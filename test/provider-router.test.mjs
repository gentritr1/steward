import assert from "node:assert/strict";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import { buildEvidencePacket } from "../server/steward-context.mjs";
import { validateEnvelope } from "../server/steward-contract.mjs";
import { answerWithProvider, providerAvailability, userIdHash } from "../server/providers/select-provider.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const baseFixture = path.join(testDir, "fixtures", "assistant", "base");
const NOW = new Date("2026-08-30T09:00:00Z");

/* the whole suite runs with fabricated credentials and mock transports. no
   test in this file may open a socket, so a transport is required on every
   cloud call and the default fetch is never reached. */
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

/* 214748364800 bytes = 200 GB, 80% used: the numbers the fixture can produce */
function goodEnvelope(extra = {}) {
  return {
    schemaVersion: "1",
    speaker: "steward",
    message: "200 GB free. the disk is 80% used.",
    epistemicState: "measured",
    evidenceIds: ["disk.availableBytes", "disk.usedPercent"],
    confidence: "high",
    nextStep: { actionId: "show_receipt", targetId: "disk.history" },
    memoryCandidate: null,
    presentation: { expression: "calm", panel: "fact" },
    ...extra,
  };
}

function anthropicReply(envelope) {
  return {
    status: 200,
    headers: { get: () => "req_test" },
    json: async () => ({
      id: "msg_test",
      stop_reason: "end_turn",
      content: [{ type: "text", text: JSON.stringify(envelope) }],
      usage: { input_tokens: 10, output_tokens: 20 },
    }),
  };
}

function openaiReply(envelope) {
  return {
    status: 200,
    headers: { get: () => "req_test" },
    json: async () => ({
      id: "resp_test",
      status: "completed",
      output: [{ type: "message", role: "assistant", content: [{ type: "output_text", text: JSON.stringify(envelope) }] }],
      usage: { input_tokens: 10, output_tokens: 20 },
    }),
  };
}

function counted(reply) {
  const calls = [];
  const transport = async (url, init) => {
    calls.push({ url, init });
    return typeof reply === "function" ? reply(calls.length) : reply;
  };
  transport.calls = calls;
  return transport;
}

test("a valid candidate passes through, and the server's stamps win over the candidate's", async () => {
  /* the candidate claims to be a different provider, a different model, and a
     non-fallback with its own trace id. every one of those claims is discarded. */
  const liar = goodEnvelope({
    provider: "openai",
    model: "smuggled-model",
    fallbackUsed: true,
    traceId: "deadbeefdead",
  });

  const transport = counted(anthropicReply(liar));
  const result = await answerWithProvider({
    mode: "anthropic",
    message: "how much free space do i have?",
    packet: await packet(),
    transports: { anthropic: transport },
  });

  assert.equal(result.error, undefined);
  assert.equal(result.provider, "anthropic");
  assert.equal(result.model, "claude-sonnet-5");
  assert.equal(result.fallbackUsed, false);
  assert.match(result.traceId, /^[0-9a-f]{12}$/);
  assert.notEqual(result.traceId, "deadbeefdead");

  /* the stamp keys are stripped from the envelope, not left inside it */
  for (const key of ["provider", "model", "fallbackUsed", "traceId"]) {
    assert.equal(Object.hasOwn(result.envelope, key), false, `${key} must not survive inside the envelope`);
  }
  assert.equal(result.envelope.message, "200 GB free. the disk is 80% used.");
  assert.equal(transport.calls.length, 1, "a valid first answer is not retried");
});

test("the returned envelope satisfies the same contract the local generator does", async () => {
  const pkt = await packet();
  const result = await answerWithProvider({
    mode: "openai",
    message: "how much free space do i have?",
    packet: pkt,
    transports: { openai: counted(openaiReply(goodEnvelope())) },
  });

  const validation = validateEnvelope(result.envelope, {
    knownEvidenceIds: pkt.evidenceIds,
    knownReclaimIds: pkt.reclaimItems.map((item) => item.id),
    packet: pkt,
  });
  assert.deepEqual(validation.errors, []);
});

test("an invalid candidate is retried exactly once, then answered locally", async () => {
  /* a fabricated byte figure: the right evidence id, the wrong digits. this is
     the failure the numeric cross-check exists for, and it must not ship. */
  const fabricated = goodEnvelope({ message: "99 GB free. the disk is 80% used." });

  const transport = counted(anthropicReply(fabricated));
  const result = await answerWithProvider({
    mode: "anthropic",
    message: "how much free space do i have?",
    packet: await packet(),
    transports: { anthropic: transport },
  });

  assert.equal(transport.calls.length, 2, "exactly one retry, no more and no fewer");
  assert.equal(result.fallbackUsed, true);
  assert.equal(result.fallbackReason, "invalid");
  assert.equal(result.provider, "local", "the sentence came from local code, and the receipt says so");
  assert.equal(result.model, "deterministic-v1");
  assert.equal(result.requestedProvider, "anthropic");
  /* the fabricated number never reaches the answer */
  assert.equal(result.envelope.message.includes("99 GB"), false);
  assert.equal(result.envelope.message, "200 GB free. the disk is 80% used.");
  assert.match(result.contractErrors.join(" "), /99 GB/, "the reason is recorded, not swallowed");
});

test("a retry that succeeds is not a fallback", async () => {
  const transport = counted((call) => (call === 1
    ? anthropicReply(goodEnvelope({ message: "99 GB free." }))
    : anthropicReply(goodEnvelope())));

  const result = await answerWithProvider({
    mode: "anthropic",
    message: "how much free space do i have?",
    packet: await packet(),
    transports: { anthropic: transport },
  });

  assert.equal(transport.calls.length, 2);
  assert.equal(result.fallbackUsed, false);
  assert.equal(result.provider, "anthropic");
});

test("an outage answers locally, immediately, without a retry", async () => {
  for (const [label, reply] of [
    ["429", { status: 429, headers: { get: () => null }, json: async () => ({}) }],
    ["503", { status: 503, headers: { get: () => null }, json: async () => ({}) }],
  ]) {
    const transport = counted(reply);
    const result = await answerWithProvider({
      mode: "openai",
      message: "what can i clean up?",
      packet: await packet(),
      transports: { openai: transport },
    });

    assert.equal(transport.calls.length, 1, `${label}: an outage is not retried here`);
    assert.equal(result.fallbackUsed, true);
    assert.equal(result.fallbackReason, "outage");
    assert.equal(result.provider, "local");
    assert.equal(result.requestedProvider, "openai");
    assert.equal(result.envelope.epistemicState, "measured");
  }
});

test("a network failure answers locally rather than erroring", async () => {
  const result = await answerWithProvider({
    mode: "openai",
    message: "how much free space do i have?",
    packet: await packet(),
    transports: { openai: async () => { throw new TypeError("fetch failed"); } },
  });

  assert.equal(result.fallbackUsed, true);
  assert.equal(result.fallbackReason, "outage");
  assert.equal(result.envelope.message, "200 GB free. the disk is 80% used.");
});

test("a refusal returns Steward's own decline — never a retry, never another provider, never local content", async () => {
  const refusing = counted({
    status: 200,
    headers: { get: () => null },
    json: async () => ({ stop_reason: "refusal", stop_details: { category: "policy" }, content: [] }),
  });
  /* the other provider is wired up and must never be touched */
  const untouched = counted(openaiReply(goodEnvelope()));

  const result = await answerWithProvider({
    mode: "anthropic",
    message: "how much free space do i have?",
    packet: await packet(),
    transports: { anthropic: refusing, openai: untouched },
  });

  assert.equal(refusing.calls.length, 1, "a decline is not retried");
  assert.equal(untouched.calls.length, 0, "a decline must never reach another provider");

  assert.equal(result.declined, true);
  assert.equal(result.declineCategory, "policy");
  assert.equal(result.fallbackUsed, false, "a decline is not a fallback");
  assert.equal(result.provider, "anthropic", "the provider that declined is the one on the receipt");
  assert.equal(result.envelope.message, "the provider declined that request. the local brief is unaffected.");
  assert.equal(result.envelope.epistemicState, "unavailable");
  assert.deepEqual(result.envelope.evidenceIds, []);
  assert.equal(result.envelope.nextStep, null);

  /* and the local generator's answer to this exact question is NOT what came
     back — the decline is not routed around */
  assert.equal(result.envelope.message.includes("200 GB"), false);
});

test("the decline envelope satisfies the contract", async () => {
  const pkt = await packet();
  const result = await answerWithProvider({
    mode: "openai",
    message: "how much free space do i have?",
    packet: pkt,
    transports: {
      openai: counted({
        status: 200,
        headers: { get: () => null },
        json: async () => ({
          status: "completed",
          output: [{ type: "message", content: [{ type: "refusal", refusal: "no" }] }],
        }),
      }),
    },
  });

  const validation = validateEnvelope(result.envelope, {
    knownEvidenceIds: pkt.evidenceIds,
    knownReclaimIds: pkt.reclaimItems.map((item) => item.id),
    packet: pkt,
  });
  assert.deepEqual(validation.errors, []);
});

test("a rejected credential is an error, not a quiet local answer", async () => {
  const transport = counted({ status: 401, headers: { get: () => null }, json: async () => ({}) });
  const result = await answerWithProvider({
    mode: "anthropic",
    message: "how much free space do i have?",
    packet: await packet(),
    transports: { anthropic: transport },
  });

  assert.equal(result.error, "provider_config");
  assert.equal(result.provider, "anthropic");
  assert.equal(result.envelope, undefined, "no answer is invented for a configuration failure");
  assert.equal(transport.calls.length, 1, "a bad credential is not retried");
});

test("a missing key is not_configured, and nothing is sent", async () => {
  const previous = process.env.ANTHROPIC_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  try {
    const transport = counted(anthropicReply(goodEnvelope()));
    const result = await answerWithProvider({
      mode: "anthropic",
      message: "how much free space do i have?",
      packet: await packet(),
      transports: { anthropic: transport },
    });

    assert.deepEqual(result, { error: "not_configured", provider: "anthropic" });
    assert.equal(transport.calls.length, 0);
  } finally {
    process.env.ANTHROPIC_API_KEY = previous;
  }
});

test("an unknown mode is refused rather than guessed at", async () => {
  const result = await answerWithProvider({
    mode: "gemini",
    message: "how much free space do i have?",
    packet: await packet(),
  });
  assert.deepEqual(result, { error: "unknown_mode", provider: "gemini" });
});

test("local mode is the unchanged local path", async () => {
  const result = await answerWithProvider({
    mode: "local",
    message: "how much free space do i have?",
    packet: await packet(),
  });

  assert.equal(result.provider, "local");
  assert.equal(result.model, "deterministic-v1");
  assert.equal(result.fallbackUsed, false);
  assert.equal(result.envelope.message, "200 GB free. the disk is 80% used.");
});

test("availability is three booleans and never a key", () => {
  const availability = providerAvailability();
  assert.deepEqual(Object.keys(availability).sort(), ["anthropic", "local", "openai"]);
  for (const value of Object.values(availability)) assert.equal(typeof value, "boolean");
  assert.equal(availability.local, true);

  const serialised = JSON.stringify(availability);
  for (const key of Object.values(KEYS)) assert.equal(serialised.includes(key), false);
});

test("the user identifier is a hash, stable, and not the hostname", async () => {
  const hash = userIdHash();
  assert.match(hash, /^[0-9a-f]{32}$/);
  assert.equal(userIdHash(), hash, "it must be stable within a process");

  const os = await import("node:os");
  assert.equal(hash.includes(os.hostname()), false);
  assert.equal(os.hostname().length > 0 && hash === os.hostname(), false);
});

test("the request sent to a provider carries the packet and no local identifiers", async () => {
  const transport = counted(anthropicReply(goodEnvelope()));
  await answerWithProvider({
    mode: "anthropic",
    message: "how much free space do i have?",
    packet: await packet(),
    transports: { anthropic: transport },
  });

  const sent = transport.calls[0].init.body;
  /* the same decoys the privacy suite plants in the fixture */
  for (const decoy of ["secret-launch-x", "~/Documents", "wedding photos", "Aunt Mira", "node_modules"]) {
    assert.equal(sent.includes(decoy), false, `the request leaked "${decoy}"`);
  }
  const body = JSON.parse(sent);
  const payload = JSON.parse(body.messages[0].content);
  assert.ok(payload.evidence.evidence["disk.availableBytes"], "the packet really is in the request");
});
