/* AUTO · where a turn goes, decided before anything is sent.

   Three rules hold this file together, and each one is the reason for the rule
   after it:

   1. Nothing here calls a model. The decision is made from deterministic
      signals only — the intent the local classifier already produces, which
      providers this process has a key for, and which providers the person has
      consented to. A router that asked a model where to route would be paying
      tokens to decide whether to pay tokens, and its receipt would be a guess.

   2. A question the local generator answers deterministically routes local and
      spends nothing. Cloud is for the questions local code cannot answer, not
      for the questions it can answer less fluently.

   3. Consent is a gate, never a preference. A provider without STORED consent
      is not a fallback, not a second choice, and not reachable from here: it is
      absent from the candidate list entirely, and the turn goes local with a
      reason that says so out loud.

   The table below is data on purpose. The escalation rows are written down and
   switched OFF: the shape of the decision is public, and turning one on is a
   separate act that has to be earned by redacted evaluations rather than by
   somebody editing an if-chain. `resolveRoute` refuses to return a row whose
   `enabled` is false, and there is a test that says so. */

import { KNOWN_INTENTS } from "../steward-assistant.mjs";

/* provider id → the word a receipt uses for it. The client renders receipts
   from this vocabulary and no other, so "anthropic" is written "claude" once,
   here, rather than in four places that can drift apart. */
export const ROUTE_WORDS = Object.freeze({ local: "local", openai: "openai", anthropic: "claude" });

export function routeWord(provider) {
  return Object.hasOwn(ROUTE_WORDS, provider) ? ROUTE_WORDS[provider] : null;
}

/* `when` is the situation a row answers, not a priority number: rows are
   selected by situation and then tried in written order. */
export const ROUTE_TABLE = Object.freeze([
  /* the cheap case is also the good case: local costs nothing and cites ids */
  Object.freeze({
    id: "local-deterministic",
    enabled: true,
    when: "known-intent",
    route: "local",
    provider: null,
    model: null,
    effort: null,
  }),
  /* the cheap cloud pair, in preference order. luna first: it is the
     cost-sensitive tier of the family, and an unknown question is not yet
     worth the balanced one. */
  Object.freeze({
    id: "cheap-openai",
    enabled: true,
    when: "unknown-intent",
    route: "openai",
    provider: "openai",
    model: "gpt-5.6-luna",
    effort: "low",
  }),
  Object.freeze({
    id: "cheap-claude",
    enabled: true,
    when: "unknown-intent",
    route: "claude",
    provider: "anthropic",
    model: "claude-sonnet-5",
    effort: "low",
  }),
  /* the floor. an unknown question with no reachable cloud still gets the
     local answer — which says what it can answer — rather than an error. */
  Object.freeze({
    id: "local-floor",
    enabled: true,
    when: "no-cloud",
    route: "local",
    provider: null,
    model: null,
    effort: null,
  }),
  /* ---- frontier escalation · DISABLED ----
     These two rows exist so the escalation path is visible and reviewable
     before it is reachable. Enabling either one is gated on real redacted
     evaluations — evidence that a frontier model at high effort answers a
     Steward question better than the cheap tier does, measured on the same
     packet, at a cost written into the ledger. Until that exists, flipping
     `enabled` here would be an unmeasured spend decision, and resolveRoute
     throws rather than returning a disabled row. */
  Object.freeze({
    id: "frontier-openai",
    enabled: false,
    when: "escalation",
    route: "openai",
    provider: "openai",
    model: "gpt-5.6-sol",
    effort: "high",
  }),
  Object.freeze({
    id: "frontier-claude",
    enabled: false,
    when: "escalation",
    route: "claude",
    provider: "anthropic",
    model: "claude-opus-5",
    effort: "high",
  }),
]);

function rowsFor(when) {
  return ROUTE_TABLE.filter((row) => row.when === when && row.enabled === true);
}

/* one exit for every branch, so a disabled row cannot be returned by any path,
   including one written later by someone who did not read the comment above */
function decide(row, routeReason) {
  if (!row) throw new Error(`routing table has no enabled row for "${routeReason}"`);
  if (row.enabled !== true) throw new Error(`routing refused a disabled row: ${row.id}`);
  return {
    route: row.route,
    provider: row.provider,
    model: row.model,
    effort: row.effort,
    routeReason,
    /* A cost is not knowable before the call: it is tokens × a rate, and the
       token count only exists once the provider reports it. The field is in the
       return shape because callers stamp one shape either way — it is filled in
       from real reported usage, after the answer, by the caller that has it. */
    estCostUsd: null,
  };
}

/**
 * Where one turn goes.
 *
 * @param {{intent?: string,
 *          providers?: Record<string, boolean>,
 *          consent?: Record<string, boolean>}} signals
 *   providers is the server's own availability map (a key is present); consent
 *   is what the person has stored, per provider. Both default to "no".
 * @returns {{route: string, provider: string|null, model: string|null,
 *            effort: string|null, routeReason: string, estCostUsd: number|null}}
 */
export function resolveRoute(signals = {}) {
  const intent = typeof signals.intent === "string" ? signals.intent : "unknown";
  const providers = signals.providers ?? {};
  const consent = signals.consent ?? {};

  if (KNOWN_INTENTS.includes(intent)) {
    return decide(rowsFor("known-intent")[0], `known-intent:${intent}`);
  }

  /* both gates, in one predicate, so neither can be checked without the other */
  const reachable = (row) => providers[row.provider] === true && consent[row.provider] === true;

  const candidates = rowsFor("unknown-intent");
  const chosen = candidates.find(reachable);
  if (chosen) return decide(chosen, "unknown-intent:cheap-cloud");

  /* no cloud route. which of the two gates closed is the honest part of the
     receipt: a missing key is a setup fact, a missing consent is a decision. */
  const keyed = candidates.some((row) => providers[row.provider] === true);
  return decide(rowsFor("no-cloud")[0], keyed ? "no-consent:local" : "no-cloud:local");
}
