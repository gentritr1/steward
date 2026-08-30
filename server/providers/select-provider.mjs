/* The router. Every answer, from every provider, passes through here.

   The adapters know how to talk to a service. This file knows what an answer is
   allowed to be. That split is the whole point: an adapter can be wrong, slow,
   truncated, or actively fabricating, and none of those states can reach a
   caller, because the candidate it produced is validated here against the same
   contract the local generator has to satisfy — including the numeric
   cross-check, which is the check that catches a fluent answer citing the right
   evidence id and printing the wrong digits.

   Four outcomes, and the differences between them are deliberate:

     answered   the candidate validated. stamped and returned.
     declined   the model refused. Steward says so in its own words, and no
                other provider is asked, and the local generator is NOT used to
                produce content the model just declined to produce. A decline is
                a decision, and routing around it would be dishonest.
     fell back  an outage, or a candidate that would not validate twice. the
                local deterministic answer is returned, stamped provider "local"
                — because that is who wrote the sentence — with fallbackUsed
                true and the provider that was asked recorded alongside it.
     errored    no credential, or the service rejected the credential or the
                request. no answer is invented; the caller is told.

   Provider identity is stamped here and never read from the candidate. */

import { createHash, randomBytes } from "node:crypto";
import os from "node:os";

import { answerLocal } from "../steward-assistant.mjs";
import { buildEvidencePacket } from "../steward-context.mjs";
import { validateEnvelope } from "../steward-contract.mjs";
import { STEWARD_DEVELOPER_PROMPT } from "../steward-prompt.mjs";
import * as anthropic from "./anthropic.mjs";
import * as openai from "./openai.mjs";
import { ProviderError } from "./provider-error.mjs";

const ADAPTERS = {
  anthropic: { module: anthropic, envKey: "ANTHROPIC_API_KEY" },
  openai: { module: openai, envKey: "OPENAI_API_KEY" },
};

export const CLOUD_MODES = Object.freeze(Object.keys(ADAPTERS));
export const MODES = Object.freeze(["local", ...CLOUD_MODES]);

/* the four fields the server stamps. a candidate that arrives carrying any of
   them has that claim removed before validation — not honoured, and not treated
   as a schema violation either, since the interesting question about such a
   candidate is whether its ANSWER is sound. every other unexpected property
   still fails additionalProperties, exactly as before. */
const STAMP_KEYS = ["provider", "model", "fallbackUsed", "traceId"];

const LOCAL_PROVIDER = "local";
const LOCAL_MODEL = "deterministic-v1";

/* Steward's own words for a decline. Not the provider's: their refusal text is
   prose written for a different product, in a different voice, and it may
   describe the request back to the user. */
const DECLINE_MESSAGE = "the provider declined that request. the local brief is unaffected.";

function traceId() {
  return randomBytes(6).toString("hex");
}

/* A coarse, stable, per-machine identifier. Both services want a hashed value
   for abuse triage, and both forbid sending anything identifying in the clear.
   The hostname is the least specific stable thing available — never a path,
   never an account name, never an address — and it is hashed with a fixed
   domain-separation prefix so the digest cannot be reused as an identifier by
   anything else. The prefix is not a secret and does not pretend to be one. */
let cachedUserIdHash = null;
export function userIdHash() {
  if (cachedUserIdHash === null) {
    cachedUserIdHash = createHash("sha256").update(`steward-v1:${os.hostname()}`).digest("hex").slice(0, 32);
  }
  return cachedUserIdHash;
}

function hasKey(name) {
  const value = process.env[name];
  return typeof value === "string" && value.trim().length > 0;
}

/**
 * Which providers this process could reach. Booleans only — the presence of a
 * key, never any part of its value, and never its length.
 */
export function providerAvailability() {
  const availability = { local: true };
  for (const [mode, entry] of Object.entries(ADAPTERS)) availability[mode] = hasKey(entry.envKey);
  return availability;
}

function stripStamps(candidate) {
  if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) return candidate;
  const copy = { ...candidate };
  for (const key of STAMP_KEYS) delete copy[key];
  return copy;
}

function declineEnvelope() {
  return {
    schemaVersion: "1",
    speaker: "steward",
    message: DECLINE_MESSAGE,
    epistemicState: "unavailable",
    evidenceIds: [],
    confidence: "low",
    nextStep: null,
    memoryCandidate: null,
    presentation: { expression: "calm", panel: "fact" },
  };
}

/* the decline is an envelope this file writes, so it is held to the contract
   this file enforces — at import, loudly, rather than at the one moment a
   provider actually declines and nobody is watching */
{
  const check = validateEnvelope(declineEnvelope(), {});
  if (!check.ok) throw new Error(`decline envelope failed validation: ${check.errors.join("; ")}`);
}

function fellBack(message, packet, mode, model, reason) {
  const local = answerLocal({ message, packet });
  return {
    envelope: local.envelope,
    /* the sentence came from local code, so that is what the receipt says */
    provider: LOCAL_PROVIDER,
    model: LOCAL_MODEL,
    fallbackUsed: true,
    requestedProvider: mode,
    requestedModel: model,
    fallbackReason: reason,
    traceId: traceId(),
  };
}

async function resolvePacket(packet, dataDir) {
  if (packet && typeof packet === "object") return packet;
  return buildEvidencePacket(dataDir ?? "public/data");
}

/**
 * Answer one question through the requested provider.
 *
 * @param {{mode?: string, message: string, packet?: object, dataDir?: string,
 *          transports?: Record<string, typeof fetch>, signal?: AbortSignal,
 *          model?: string}} request
 * @returns {Promise<object>} an answer with server stamps, or {error, provider}
 */
export async function answerWithProvider(request = {}) {
  const mode = typeof request.mode === "string" ? request.mode : "local";
  const message = typeof request.message === "string" ? request.message : "";
  const packet = await resolvePacket(request.packet, request.dataDir);

  if (mode === LOCAL_PROVIDER) return answerLocal({ message, packet });

  const entry = Object.hasOwn(ADAPTERS, mode) ? ADAPTERS[mode] : null;
  if (!entry) return { error: "unknown_mode", provider: mode };

  const apiKey = process.env[entry.envKey];
  if (typeof apiKey !== "string" || apiKey.trim().length === 0) {
    return { error: "not_configured", provider: mode };
  }

  const model = entry.module.resolveModel(request.model);
  const transport = request.transports?.[mode];

  const modelRequest = {
    prompt: STEWARD_DEVELOPER_PROMPT,
    /* no stored profile and no conversation history yet; both are declared here
       rather than omitted, so the request shape does not change when they land */
    profile: {},
    conversationSummary: "",
    evidence: packet,
    message,
    model,
    userIdHash: userIdHash(),
  };

  const context = {
    knownEvidenceIds: packet.evidenceIds ?? [],
    knownReclaimIds: (packet.reclaimItems ?? []).map((item) => item.id),
    /* the packet goes in, so a fabricated number cannot pass validation */
    packet,
  };

  /* two attempts at most: the first, and one retry of the identical request for
     a candidate that did not validate. an outage is not retried here — it goes
     straight to the local answer rather than spending another 20 seconds. */
  let lastErrors = [];

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    let result;

    try {
      result = await entry.module.generateStructured(modelRequest, {
        transport,
        apiKey,
        signal: request.signal,
      });
    } catch (error) {
      if (error instanceof ProviderError) {
        if (error.kind === "refusal") {
          return {
            envelope: declineEnvelope(),
            provider: mode,
            model,
            fallbackUsed: false,
            declined: true,
            declineCategory: error.category,
            traceId: traceId(),
          };
        }
        if (error.kind === "config") return { error: "provider_config", provider: mode };
        if (error.kind === "malformed") {
          lastErrors = [error.message];
          continue;
        }
        return fellBack(message, packet, mode, model, "outage");
      }
      /* a cancellation propagates; anything else unrecognised is weather */
      if (error?.name === "AbortError") throw error;
      return fellBack(message, packet, mode, model, "outage");
    }

    const candidate = stripStamps(result.candidate);
    const validation = candidate === null
      ? { ok: false, errors: [`finish "${result.finish}" produced no parsable envelope`] }
      : validateEnvelope(candidate, context);

    if (validation.ok) {
      return {
        envelope: candidate,
        provider: mode,
        model: result.receipt?.model ?? model,
        fallbackUsed: false,
        traceId: traceId(),
        finish: result.finish,
        usage: result.usage,
        requestId: result.receipt?.requestId ?? null,
      };
    }

    lastErrors = validation.errors;
  }

  /* two candidates in a row that the contract would not accept. the local
     answer is the product's floor, and it is labelled as one. */
  const fallback = fellBack(message, packet, mode, model, "invalid");
  fallback.contractErrors = lastErrors;
  return fallback;
}
