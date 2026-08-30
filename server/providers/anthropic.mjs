/* The Anthropic adapter.

   It builds one request, reads one response, and normalises both into the
   shapes the router understands. It does not validate the envelope, it does not
   retry, it does not fall back, and it does not decide which provider produced
   an answer — the router owns every one of those, so that the same rules apply
   whichever service is on the other end of the socket.

   `transport` is injected rather than imported. Every test in this repo runs
   against a mock, and no test is ever permitted to open a socket. */

import { ENVELOPE_SCHEMA } from "../steward-contract.mjs";
import { STEWARD_DEVELOPER_PROMPT } from "../steward-prompt.mjs";
import { PROVIDER_TIMEOUT_MS, deadline } from "./deadline.mjs";
import { ProviderError, kindForStatus } from "./provider-error.mjs";
import { toWireSchema } from "./wire-schema.mjs";

export const PROVIDER = "anthropic";
export const DEFAULT_MODEL = "claude-sonnet-5";
export const ECONOMY_MODEL = "claude-haiku-4-5";

const ENDPOINT = "https://api.anthropic.com/v1/messages";
const API_VERSION = "2023-06-01";
const MAX_TOKENS = 1000;

/* effort is a sonnet-5 control and is an error on haiku-4-5, so the gate is on
   the exact id — not on a prefix, which would sweep in every future model */
const EFFORT_MODELS = new Set([DEFAULT_MODEL]);

/* nullables stay as `anyOf: [{type:"null"}, …]`, which is how ENVELOPE_SCHEMA
   already writes them and what this API accepts */
export const WIRE_SCHEMA = toWireSchema(ENVELOPE_SCHEMA);

/**
 * The model this adapter will use: an explicit choice, else the environment
 * override, else the default. Exported so the router can stamp the model on an
 * answer that never reached the provider.
 */
export function resolveModel(model) {
  const requested = typeof model === "string" && model.trim().length > 0 ? model.trim() : null;
  const fromEnv = typeof process.env.STEWARD_CLAUDE_MODEL === "string" && process.env.STEWARD_CLAUDE_MODEL.trim().length > 0
    ? process.env.STEWARD_CLAUDE_MODEL.trim()
    : null;
  return requested ?? fromEnv ?? DEFAULT_MODEL;
}

/* the user turn is the request payload as JSON, so the model reads evidence as
   data in a named field rather than as prose it might mistake for instruction */
function userContent(modelRequest) {
  return JSON.stringify({
    profile: modelRequest?.profile ?? {},
    conversationSummary: modelRequest?.conversationSummary ?? "",
    evidence: modelRequest?.evidence ?? null,
    message: modelRequest?.message ?? "",
  });
}

export function buildRequestBody(modelRequest, model) {
  const outputConfig = { format: { type: "json_schema", schema: WIRE_SCHEMA } };
  if (EFFORT_MODELS.has(model)) outputConfig.effort = "low";

  const body = {
    model,
    max_tokens: MAX_TOKENS,
    /* the character prompt is a top-level system block, never a message turn */
    system: modelRequest?.prompt ?? STEWARD_DEVELOPER_PROMPT,
    messages: [{ role: "user", content: userContent(modelRequest) }],
    output_config: outputConfig,
  };

  if (typeof modelRequest?.userIdHash === "string" && modelRequest.userIdHash.length > 0) {
    body.metadata = { user_id: modelRequest.userIdHash };
  }

  return body;
}

/* the provider's vocabulary, reduced to the four words the router acts on */
function normaliseFinish(stopReason) {
  if (stopReason === "refusal") return "refusal";
  if (stopReason === "max_tokens") return "length";
  if (stopReason === "end_turn" || stopReason === "stop_sequence" || stopReason === "tool_use") return "stop";
  return "other";
}

function readUsage(payload) {
  const usage = payload?.usage ?? {};
  return {
    inputTokens: Number.isFinite(usage.input_tokens) ? usage.input_tokens : null,
    outputTokens: Number.isFinite(usage.output_tokens) ? usage.output_tokens : null,
  };
}

function readRequestId(response, payload) {
  const header = response?.headers?.get?.("request-id") ?? response?.headers?.get?.("x-request-id") ?? null;
  return header ?? (typeof payload?.id === "string" ? payload.id : null);
}

/* structured outputs guarantees schema-shaped JSON on a normal completion, and
   this still parses defensively: a truncated or absent block yields a null
   candidate, which the router treats exactly as it treats an invalid one */
function readCandidate(payload) {
  const blocks = Array.isArray(payload?.content) ? payload.content : [];
  const text = blocks.find((block) => block?.type === "text" && typeof block.text === "string");
  if (!text) return null;
  try {
    const parsed = JSON.parse(text.text);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/**
 * One structured generation.
 *
 * @param {{prompt?: string, profile?: object, conversationSummary?: string,
 *          evidence?: object, message?: string, model?: string, userIdHash?: string}} modelRequest
 * @param {{transport?: typeof fetch, signal?: AbortSignal, apiKey?: string, timeoutMs?: number}} [options]
 *   timeoutMs exists so the deadline path is reachable in a test in
 *   milliseconds instead of in twenty seconds; production never passes it.
 * @returns {Promise<{candidate: object|null, finish: string,
 *                    usage: {inputTokens: number|null, outputTokens: number|null},
 *                    receipt: {provider: string, model: string, requestId: string|null}}>}
 * @throws {ProviderError} config, outage, refusal, or malformed
 */
export async function generateStructured(modelRequest, options = {}) {
  const transport = options.transport ?? fetch;
  const apiKey = options.apiKey ?? process.env.ANTHROPIC_API_KEY;
  const model = resolveModel(modelRequest?.model);

  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new ProviderError("config", "no anthropic credential", { provider: PROVIDER });
  }

  const bound = deadline(options.signal, options.timeoutMs ?? PROVIDER_TIMEOUT_MS);
  let response;

  try {
    response = await transport(ENDPOINT, {
      method: "POST",
      headers: {
        "x-api-key": apiKey,
        "anthropic-version": API_VERSION,
        "content-type": "application/json",
      },
      body: JSON.stringify(buildRequestBody(modelRequest, model)),
      signal: bound.signal,
    });
  } catch (error) {
    if (bound.expired()) {
      throw new ProviderError("outage", "provider timed out", { provider: PROVIDER });
    }
    if (bound.cancelled()) throw error;
    throw new ProviderError("outage", "provider unreachable", { provider: PROVIDER });
  } finally {
    bound.release();
  }

  const status = Number(response?.status ?? 0);
  if (status < 200 || status >= 300) {
    const kind = kindForStatus(status);
    throw new ProviderError(kind, `provider returned ${status}`, { provider: PROVIDER, status });
  }

  let payload;
  try {
    payload = await response.json();
  } catch {
    throw new ProviderError("malformed", "provider response was not json", { provider: PROVIDER, status });
  }

  /* stop_reason first: a refusal is a decision about the request, and reading
     content before checking for it is how a decline gets treated as an outage */
  const finish = normaliseFinish(payload?.stop_reason);
  if (finish === "refusal") {
    throw new ProviderError("refusal", "provider declined the request", {
      provider: PROVIDER,
      status,
      category: typeof payload?.stop_details?.category === "string" ? payload.stop_details.category : null,
    });
  }

  return {
    candidate: readCandidate(payload),
    finish,
    usage: readUsage(payload),
    receipt: { provider: PROVIDER, model, requestId: readRequestId(response, payload) },
  };
}
