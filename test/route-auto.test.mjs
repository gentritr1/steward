/* The routing table, on its own, with no server and no network.

   resolveRoute is pure, so every claim here is about the decision itself: which
   row it picked, why, and — the two that matter most — that it never picks a
   disabled row and never picks a provider the person has not consented to. */

import assert from "node:assert/strict";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import { buildEvidencePacket } from "../server/steward-context.mjs";
import { KNOWN_INTENTS } from "../server/steward-assistant.mjs";
import { ROUTE_TABLE, ROUTE_WORDS, resolveRoute, routeWord } from "../server/providers/route-auto.mjs";
import { answerWithProvider } from "../server/providers/select-provider.mjs";

const BOTH_KEYS = { local: true, openai: true, anthropic: true };
const NO_KEYS = { local: true, openai: false, anthropic: false };
const BOTH_CONSENTED = { openai: true, anthropic: true };

test("every known local intent routes local, spends nothing, and says which intent", () => {
  for (const intent of KNOWN_INTENTS) {
    const decision = resolveRoute({ intent, providers: BOTH_KEYS, consent: BOTH_CONSENTED });
    assert.equal(decision.route, "local");
    assert.equal(decision.provider, null);
    assert.equal(decision.model, null);
    assert.equal(decision.effort, null);
    assert.equal(decision.routeReason, `known-intent:${intent}`);
    assert.equal(decision.estCostUsd, null);
  }
  /* the five the local generator actually implements */
  assert.deepEqual([...KNOWN_INTENTS].sort(), ["changed", "coverage", "lessons", "reclaim", "space"]);
});

test("a known intent routes local even with both keys and both consents present", () => {
  const decision = resolveRoute({ intent: "coverage", providers: BOTH_KEYS, consent: BOTH_CONSENTED });
  assert.equal(decision.route, "local");
});

test("an unknown intent prefers the cheap openai route", () => {
  const decision = resolveRoute({ intent: "unknown", providers: BOTH_KEYS, consent: BOTH_CONSENTED });
  assert.deepEqual(decision, {
    route: "openai",
    provider: "openai",
    model: "gpt-5.6-luna",
    effort: "low",
    routeReason: "unknown-intent:cheap-cloud",
    estCostUsd: null,
  });
});

test("with openai unavailable the cheap claude route is next", () => {
  const decision = resolveRoute({
    intent: "unknown",
    providers: { local: true, openai: false, anthropic: true },
    consent: BOTH_CONSENTED,
  });
  assert.equal(decision.route, "claude");
  assert.equal(decision.provider, "anthropic");
  assert.equal(decision.model, "claude-sonnet-5");
  assert.equal(decision.effort, "low");
});

test("with openai keyed but unconsented, claude takes the turn", () => {
  const decision = resolveRoute({
    intent: "unknown",
    providers: BOTH_KEYS,
    consent: { openai: false, anthropic: true },
  });
  assert.equal(decision.provider, "anthropic");
});

/* the hard trust rule, stated four ways */
test("a provider without stored consent is never routed to", () => {
  const cases = [
    [{}, "consent absent entirely"],
    [{ openai: false, anthropic: false }, "both refused"],
    [{ openai: "yes", anthropic: 1 }, "truthy but not true"],
    [{ openai: undefined, anthropic: null }, "empty values"],
  ];
  for (const [consent, label] of cases) {
    const decision = resolveRoute({ intent: "unknown", providers: BOTH_KEYS, consent });
    assert.equal(decision.route, "local", label);
    assert.equal(decision.provider, null, label);
    assert.equal(decision.routeReason, "no-consent:local", label);
  }
});

test("keys present but no consent reads differently from no keys at all", () => {
  assert.equal(
    resolveRoute({ intent: "unknown", providers: BOTH_KEYS, consent: {} }).routeReason,
    "no-consent:local",
  );
  assert.equal(
    resolveRoute({ intent: "unknown", providers: NO_KEYS, consent: BOTH_CONSENTED }).routeReason,
    "no-cloud:local",
  );
});

test("keyless is a complete product: an unknown question still gets a local answer", () => {
  const decision = resolveRoute({ intent: "unknown", providers: NO_KEYS, consent: {} });
  assert.equal(decision.route, "local");
  assert.equal(decision.routeReason, "no-cloud:local");
});

test("no signals at all still resolves, and resolves local", () => {
  const decision = resolveRoute();
  assert.equal(decision.route, "local");
  assert.equal(decision.routeReason, "no-cloud:local");
});

/* ---- the escalation rows exist, and are unreachable ---- */

test("the frontier rows are present in the table and disabled", () => {
  const frontier = ROUTE_TABLE.filter((row) => row.when === "escalation");
  assert.equal(frontier.length, 2);
  for (const row of frontier) assert.equal(row.enabled, false);
  assert.deepEqual(frontier.map((row) => row.model).sort(), ["claude-opus-5", "gpt-5.6-sol"]);
  for (const row of frontier) assert.equal(row.effort, "high");
});

test("no combination of signals returns a disabled route", () => {
  const disabled = new Set(ROUTE_TABLE.filter((row) => row.enabled !== true).map((row) => row.model));
  assert.ok(disabled.size > 0, "the table must still carry a disabled row for this test to mean anything");

  const intents = [...KNOWN_INTENTS, "unknown", "", "escalation", "frontier"];
  const providerSets = [BOTH_KEYS, NO_KEYS, { local: true, openai: true, anthropic: false }];
  const consentSets = [BOTH_CONSENTED, {}, { openai: true }, { anthropic: true }];

  for (const intent of intents) {
    for (const providers of providerSets) {
      for (const consent of consentSets) {
        const decision = resolveRoute({ intent, providers, consent });
        assert.ok(!disabled.has(decision.model), `disabled model returned for ${intent}`);
        const row = ROUTE_TABLE.find((entry) => entry.model === decision.model && entry.route === decision.route);
        if (row) assert.equal(row.enabled, true);
      }
    }
  }
});

test("the receipt vocabulary is fixed and anthropic is written claude", () => {
  assert.deepEqual(ROUTE_WORDS, { local: "local", openai: "openai", anthropic: "claude" });
  assert.equal(routeWord("anthropic"), "claude");
  assert.equal(routeWord("gemini"), null);
});

/* ---- AUTO through the router, against mock transports ----

   Fabricated keys and injected transports: no test below may open a socket, and
   the transports count their calls so "it did not send" is asserted rather than
   assumed. */

const testDir = path.dirname(fileURLToPath(import.meta.url));
const baseFixture = path.join(testDir, "fixtures", "assistant", "base");
const NOW = new Date("2026-08-30T09:00:00Z");

const KEYS = { OPENAI_API_KEY: "test-openai-key", ANTHROPIC_API_KEY: "test-anthropic-key" };
const savedKeys = {};

before(() => {
  for (const [name, value] of Object.entries(KEYS)) {
    savedKeys[name] = process.env[name];
    process.env[name] = value;
  }
});

after(() => {
  for (const [name, value] of Object.entries(savedKeys)) {
    if (value === undefined) delete process.env[name];
    else process.env[name] = value;
  }
});

function packet() {
  return buildEvidencePacket(baseFixture, { now: NOW });
}

/* 214748364800 bytes = 200 GB, 80% used: what the fixture can produce */
const CLOUD_ENVELOPE = {
  schemaVersion: "1",
  speaker: "steward",
  message: "200 GB free. the disk is 80% used.",
  epistemicState: "measured",
  evidenceIds: ["disk.availableBytes", "disk.usedPercent"],
  confidence: "high",
  nextStep: null,
  memoryCandidate: null,
  presentation: { expression: "calm", panel: "fact" },
};

function openaiTransport() {
  const calls = [];
  const transport = async (url, init) => {
    calls.push({ url, init });
    return {
      status: 200,
      headers: { get: () => "req_test" },
      json: async () => ({
        id: "resp_test",
        status: "completed",
        output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(CLOUD_ENVELOPE) }] }],
        usage: { input_tokens: 1000, output_tokens: 100 },
      }),
    };
  };
  transport.calls = calls;
  return transport;
}

test("AUTO answers a known question locally and never opens a transport", async () => {
  const openai = openaiTransport();
  const anthropic = openaiTransport();
  const result = await answerWithProvider({
    mode: "auto",
    message: "how much free space do i have?",
    packet: await packet(),
    consent: { openai: true, anthropic: true },
    transports: { openai, anthropic },
  });

  assert.equal(result.route, "local");
  assert.equal(result.routeReason, "known-intent:space");
  assert.equal(result.provider, "local");
  assert.equal(result.model, "deterministic-v1");
  assert.equal(result.effort, null);
  assert.equal(result.usage, undefined);
  assert.equal(openai.calls.length, 0);
  assert.equal(anthropic.calls.length, 0);
});

test("AUTO sends an unknown question to the cheap openai route, with its usage", async () => {
  const openai = openaiTransport();
  const result = await answerWithProvider({
    mode: "auto",
    message: "what do you make of all this, honestly",
    packet: await packet(),
    consent: { openai: true, anthropic: true },
    transports: { openai },
  });

  assert.equal(result.route, "openai");
  assert.equal(result.routeReason, "unknown-intent:cheap-cloud");
  assert.equal(result.provider, "openai");
  assert.equal(result.model, "gpt-5.6-luna");
  assert.equal(result.effort, "low");
  assert.deepEqual(result.usage, { inputTokens: 1000, outputTokens: 100 });
  assert.equal(openai.calls.length, 1);
  /* the model the router chose is the model on the wire, not the adapter default */
  assert.equal(JSON.parse(openai.calls[0].init.body).model, "gpt-5.6-luna");
});

test("AUTO with a key but no consent sends nothing at all", async () => {
  const openai = openaiTransport();
  const anthropic = openaiTransport();
  const result = await answerWithProvider({
    mode: "auto",
    message: "what do you make of all this, honestly",
    packet: await packet(),
    consent: {},
    transports: { openai, anthropic },
  });

  assert.equal(result.route, "local");
  assert.equal(result.routeReason, "no-consent:local");
  assert.equal(result.provider, "local");
  assert.equal(openai.calls.length, 0, "an unconsented provider was contacted");
  assert.equal(anthropic.calls.length, 0, "an unconsented provider was contacted");
});

function anthropicTransport() {
  const calls = [];
  const transport = async (url, init) => {
    calls.push({ url, init });
    return {
      status: 200,
      headers: { get: () => "req_test" },
      json: async () => ({
        id: "msg_test",
        stop_reason: "end_turn",
        content: [{ type: "text", text: JSON.stringify(CLOUD_ENVELOPE) }],
        usage: { input_tokens: 1000, output_tokens: 100 },
      }),
    };
  };
  transport.calls = calls;
  return transport;
}

test("AUTO with consent for only one provider uses only that one", async () => {
  const openai = openaiTransport();
  const anthropic = anthropicTransport();
  const result = await answerWithProvider({
    mode: "auto",
    message: "what do you make of all this, honestly",
    packet: await packet(),
    consent: { anthropic: true },
    transports: { openai, anthropic },
  });

  assert.equal(result.route, "claude");
  assert.equal(result.provider, "anthropic");
  assert.equal(result.model, "claude-sonnet-5");
  assert.equal(result.fallbackUsed, false);
  assert.equal(openai.calls.length, 0);
  assert.equal(anthropic.calls.length, 1);
});

test("a candidate that claims its own route has the claim stripped, not honoured", async () => {
  const liar = { ...CLOUD_ENVELOPE, route: "claude", routeReason: "known-intent:space", estCostUsd: 99 };
  const calls = [];
  const transport = async (url, init) => {
    calls.push({ url, init });
    return {
      status: 200,
      headers: { get: () => "req_test" },
      json: async () => ({
        id: "resp_test",
        status: "completed",
        output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(liar) }] }],
        usage: { input_tokens: 1000, output_tokens: 100 },
      }),
    };
  };

  const result = await answerWithProvider({
    mode: "auto",
    message: "what do you make of all this, honestly",
    packet: await packet(),
    consent: { openai: true },
    transports: { openai: transport },
  });

  assert.equal(result.route, "openai");
  assert.equal(result.routeReason, "unknown-intent:cheap-cloud");
  assert.equal(result.fallbackUsed, false, "the claim should be stripped, not treated as a schema violation");
  for (const key of ["route", "routeReason", "estCostUsd"]) {
    assert.equal(Object.hasOwn(result.envelope, key), false, `the candidate's "${key}" survived into the envelope`);
  }
});
