/* The OpenAI adapter, against the Responses API.

   Same job and same discipline as the Anthropic adapter: build one request,
   read one response, normalise both, decide nothing. The wire details differ
   more than the shape of the work does.

   Every field below was checked against the current published reference on
   2026-08-30 and carries its verification status inline. "CONFIRMED" means the
   documentation states it; "INFERRED" means the documentation describes the
   surrounding structure but not this exact spelling, and it is the standard
   item shape for that structure. Nothing here is guessed from memory. */

import { ENVELOPE_SCHEMA } from "../steward-contract.mjs";
import { STEWARD_DEVELOPER_PROMPT } from "../steward-prompt.mjs";
import { PROVIDER_TIMEOUT_MS, deadline } from "./deadline.mjs";
import { ProviderError, kindForStatus } from "./provider-error.mjs";
import { toWireSchema } from "./wire-schema.mjs";

export const PROVIDER = "openai";
/* CONFIRMED: the models listing publishes gpt-5.6-sol, gpt-5.6-terra and
   gpt-5.6-luna. terra is the balanced tier, luna the cost-sensitive one. */
export const DEFAULT_MODEL = "gpt-5.6-terra";
export const ECONOMY_MODEL = "gpt-5.6-luna";

/* CONFIRMED: POST https://api.openai.com/v1/responses, bearer auth */
const ENDPOINT = "https://api.openai.com/v1/responses";
const MAX_OUTPUT_TOKENS = 1000;
const SCHEMA_NAME = "steward_envelope";

/* This decoder's supported subset excludes minLength/maxLength/pattern/format,
   minimum/maximum/multipleOf, and minItems/maxItems/uniqueItems, and rejects a
   schema that uses them rather than ignoring them — all CONFIRMED. Nullables
   are spelled as a `["<type>", "null"]` union, which is the documented form
   here, rather than as an anyOf arm. */
export const WIRE_SCHEMA = toWireSchema(ENVELOPE_SCHEMA, { nullableAsTypeUnion: true });

export function resolveModel(model) {
  const requested = typeof model === "string" && model.trim().length > 0 ? model.trim() : null;
  const fromEnv = typeof process.env.STEWARD_OPENAI_MODEL === "string" && process.env.STEWARD_OPENAI_MODEL.trim().length > 0
    ? process.env.STEWARD_OPENAI_MODEL.trim()
    : null;
  return requested ?? fromEnv ?? DEFAULT_MODEL;
}

function userContent(modelRequest) {
  return JSON.stringify({
    profile: modelRequest?.profile ?? {},
    conversationSummary: modelRequest?.conversationSummary ?? "",
    evidence: modelRequest?.evidence ?? null,
    message: modelRequest?.message ?? "",
  });
}

export function buildRequestBody(modelRequest, model) {
  const body = {
    model,
    /* CONFIRMED: `instructions` carries the developer prompt */
    instructions: modelRequest?.prompt ?? STEWARD_DEVELOPER_PROMPT,
    /* CONFIRMED: input accepts an array of input items. INFERRED: the
       {type:"input_text"} content item is the standard spelling for a text part;
       a bare string content is also accepted and would behave identically. */
    input: [{ role: "user", content: [{ type: "input_text", text: userContent(modelRequest) }] }],
    /* CONFIRMED: structured output is text.format, not the deprecated
       response_format, and takes type/name/schema/strict */
    text: { format: { type: "json_schema", name: SCHEMA_NAME, schema: WIRE_SCHEMA, strict: true } },
    /* CONFIRMED: "low" is a documented effort value */
    reasoning: { effort: "low" },
    /* CONFIRMED name, INFERRED default: `store` is a documented body parameter
       controlling whether the response is persisted. false is set explicitly so
       the setting never depends on what the service defaults to. */
    store: false,
    /* CONFIRMED: max_output_tokens is the output ceiling on this API */
    max_output_tokens: MAX_OUTPUT_TOKENS,
  };

  /* CONFIRMED: safety_identifier is top-level and supersedes the deprecated
     `user` field, and the documentation requires a hashed value — which is what
     the router hands in. A hostname or an address must never appear here. */
  if (typeof modelRequest?.userIdHash === "string" && modelRequest.userIdHash.length > 0) {
    body.safety_identifier = modelRequest.userIdHash;
  }

  return body;
}

function messageItems(payload) {
  const output = Array.isArray(payload?.output) ? payload.output : [];
  return output.filter((item) => item?.type === "message");
}

/* CONFIRMED: a decline arrives as a content part of type "refusal" carrying a
   `refusal` string. The string itself is provider prose and is deliberately not
   read: the router answers a decline in Steward's own words. */
function hasRefusal(payload) {
  return messageItems(payload).some((item) =>
    (Array.isArray(item.content) ? item.content : []).some((part) => part?.type === "refusal"));
}

/* CONFIRMED: the text lives at output[] -> message -> content[] -> output_text */
function readCandidate(payload) {
  let text = null;

  for (const item of messageItems(payload)) {
    const parts = Array.isArray(item.content) ? item.content : [];
    const part = parts.find((entry) => entry?.type === "output_text" && typeof entry.text === "string");
    if (part) {
      text = part.text;
      break;
    }
  }

  /* the flattened convenience field, only if the structured path found nothing */
  if (text === null && typeof payload?.output_text === "string") text = payload.output_text;
  if (text === null) return null;

  try {
    const parsed = JSON.parse(text);
    return parsed !== null && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

/* CONFIRMED: status "incomplete" with incomplete_details.reason
   "max_output_tokens" is how truncation is reported */
function normaliseFinish(payload) {
  if (payload?.status === "incomplete") {
    return payload?.incomplete_details?.reason === "max_output_tokens" ? "length" : "other";
  }
  if (payload?.status === "completed") return "stop";
  return "other";
}

/* CONFIRMED: usage.input_tokens and usage.output_tokens */
function readUsage(payload) {
  const usage = payload?.usage ?? {};
  return {
    inputTokens: Number.isFinite(usage.input_tokens) ? usage.input_tokens : null,
    outputTokens: Number.isFinite(usage.output_tokens) ? usage.output_tokens : null,
  };
}

function readRequestId(response, payload) {
  const header = response?.headers?.get?.("x-request-id") ?? response?.headers?.get?.("request-id") ?? null;
  return header ?? (typeof payload?.id === "string" ? payload.id : null);
}

/**
 * One structured generation. Contract identical to the Anthropic adapter.
 *
 * @param {{prompt?: string, profile?: object, conversationSummary?: string,
 *          evidence?: object, message?: string, model?: string, userIdHash?: string}} modelRequest
 * @param {{transport?: typeof fetch, signal?: AbortSignal, apiKey?: string, timeoutMs?: number}} [options]
 *   timeoutMs exists so the deadline path is reachable in a test in
 *   milliseconds instead of in twenty seconds; production never passes it.
 * @returns {Promise<{candidate: object|null, finish: string,
 *                    usage: {inputTokens: number|null, outputTokens: number|null},
 *                    receipt: {provider: string, model: string, requestId: string|null}}>}
 * @throws {ProviderError}
 */
export async function generateStructured(modelRequest, options = {}) {
  const transport = options.transport ?? fetch;
  const apiKey = options.apiKey ?? process.env.OPENAI_API_KEY;
  const model = resolveModel(modelRequest?.model);

  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    throw new ProviderError("config", "no openai credential", { provider: PROVIDER });
  }

  const bound = deadline(options.signal, options.timeoutMs ?? PROVIDER_TIMEOUT_MS);
  let response;

  try {
    response = await transport(ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${apiKey}`,
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

  /* the decline check comes before the content read, for the same reason it
     does on the other adapter: a refusal must not be mistaken for empty output */
  if (hasRefusal(payload)) {
    throw new ProviderError("refusal", "provider declined the request", {
      provider: PROVIDER,
      status,
      category: null,
    });
  }

  /* a run the service itself marks failed is weather, not an answer */
  if (payload?.status === "failed") {
    throw new ProviderError("outage", "provider run failed", { provider: PROVIDER, status });
  }

  return {
    candidate: readCandidate(payload),
    finish: normaliseFinish(payload),
    usage: readUsage(payload),
    receipt: { provider: PROVIDER, model, requestId: readRequestId(response, payload) },
  };
}
