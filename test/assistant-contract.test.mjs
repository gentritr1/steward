import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { answerLocal } from "../server/steward-assistant.mjs";
import { buildEvidencePacket } from "../server/steward-context.mjs";
import { ACTION_ALLOWLIST, ENVELOPE_SCHEMA, validateEnvelope } from "../server/steward-contract.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const baseFixture = path.join(testDir, "fixtures", "assistant", "base");

const context = {
  knownEvidenceIds: ["disk.availableBytes", "disk.usedPercent", "reclaim.safeBytes"],
  knownReclaimIds: ["app-caches"],
};

function goodEnvelope(overrides = {}) {
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
    ...overrides,
  };
}

test("the schema is the shape the validator enforces", () => {
  assert.equal(ENVELOPE_SCHEMA.additionalProperties, false);
  assert.equal(ENVELOPE_SCHEMA.required.length, Object.keys(ENVELOPE_SCHEMA.properties).length);
  assert.deepEqual(
    Object.keys(ACTION_ALLOWLIST).sort(),
    ["open_channel", "open_reclaim_item", "show_lesson", "show_receipt"],
  );
});

test("accepts a known-good envelope", () => {
  const result = validateEnvelope(goodEnvelope(), context);
  assert.deepEqual(result.errors, []);
  assert.equal(result.ok, true);
});

test("accepts an evidence-known reclaim target and a null next step", () => {
  assert.equal(
    validateEnvelope(goodEnvelope({ nextStep: { actionId: "open_reclaim_item", targetId: "app-caches" } }), context).ok,
    true,
  );
  assert.equal(
    validateEnvelope(goodEnvelope({
      message: "i can answer about space, changes, reclaim, coverage, and lessons.",
      epistemicState: "unavailable",
      evidenceIds: [],
      confidence: "low",
      nextStep: null,
    }), context).ok,
    true,
  );
});

const rejected = [
  ["an extra key", goodEnvelope({ provider: "local" })],
  ["a missing nullable key", (() => { const e = goodEnvelope(); delete e.nextStep; return e; })()],
  ["a wrong enum value", goodEnvelope({ confidence: "certain" })],
  ["a wrong enum in presentation", goodEnvelope({ presentation: { expression: "excited", panel: "fact" } })],
  ["a wrong schemaVersion", goodEnvelope({ schemaVersion: "2" })],
  ["another speaker", goodEnvelope({ speaker: "assistant" })],
  ["an overlong message", goodEnvelope({ message: "a".repeat(601) })],
  ["an empty message", goodEnvelope({ message: "" })],
  ["an unknown evidence id", goodEnvelope({ evidenceIds: ["disk.temperature"] })],
  ["more than eight evidence ids", goodEnvelope({ evidenceIds: Array.from({ length: 9 }, (_, i) => `id-${i}`) })],
  ["a measured claim with no evidence", goodEnvelope({ evidenceIds: [] })],
  ["an unavailable claim citing evidence", goodEnvelope({ epistemicState: "unavailable" })],
  ["an action off the allowlist", goodEnvelope({ nextStep: { actionId: "delete_files", targetId: "app-caches" } })],
  ["an illegal channel target", goodEnvelope({ nextStep: { actionId: "open_channel", targetId: "secrets" } })],
  ["an illegal receipt target", goodEnvelope({ nextStep: { actionId: "show_receipt", targetId: "everything" } })],
  ["a reclaim target the evidence never mentioned", goodEnvelope({ nextStep: { actionId: "open_reclaim_item", targetId: "wedding-photos" } })],
  ["a next step with an extra key", goodEnvelope({ nextStep: { actionId: "show_receipt", targetId: "coverage", note: "hi" } })],
  ["markdown in the message", goodEnvelope({ message: "200 GB free. see the `receipt`." })],
  ["a heading in the message", goodEnvelope({ message: "# 200 GB free." })],
  ["html in the message", goodEnvelope({ message: "200 GB free <b>now</b>." })],
  ["a markdown link in the message", goodEnvelope({ message: "open the [receipt](/data/history.json)." })],
  ["an absolute path in the message", goodEnvelope({ message: "i measured /Users/someone/Downloads." })],
  ["a home path in the message", goodEnvelope({ message: "i measured ~/Downloads." })],
  ["a url in the message", goodEnvelope({ message: "read more at https://example.com." })],
  ["a newline in the message", goodEnvelope({ message: "200 GB free.\nthe disk is 80% used." })],
  ["a non-object candidate", "200 GB free."],
];

for (const [label, candidate] of rejected) {
  test(`rejects ${label}`, () => {
    const result = validateEnvelope(candidate, context);
    assert.equal(result.ok, false, `expected a rejection for ${label}`);
    assert.ok(result.errors.length > 0, "a rejection must say why");
  });
}

/* the representative question set: one per intent, plus the shapes a real
   input box produces — gibberish, a greeting, and something almost empty */
const MESSAGES = [
  "how much free space do i have?",
  "is my disk full?",
  "what changed since yesterday?",
  "did anything move this week?",
  "what can i clean up?",
  "how much space can i reclaim?",
  "how much of the disk have you scanned?",
  "what about my privacy?",
  "teach me something today",
  "which lesson is next?",
  "asdfjkl qwerty zxcv",
  "hello",
  " ",
];

test("every local answer over the message set satisfies the contract", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: new Date("2026-08-30T09:00:00Z") });
  const packetContext = {
    knownEvidenceIds: packet.evidenceIds,
    knownReclaimIds: packet.reclaimItems.map((item) => item.id),
  };

  assert.ok(MESSAGES.length >= 10, "the message set must cover every intent plus the edges");

  for (const message of MESSAGES) {
    const result = answerLocal({ message, packet });
    const validation = validateEnvelope(result.envelope, packetContext);
    assert.deepEqual(validation.errors, [], `"${message}" produced an invalid envelope`);

    assert.equal(result.provider, "local");
    assert.equal(result.model, "deterministic-v1");
    assert.equal(result.fallbackUsed, false);
    assert.match(result.traceId, /^[0-9a-f]{12}$/);
    assert.equal(result.envelope.speaker, "steward");
    assert.equal(result.envelope.schemaVersion, "1");
  }
});

test("a local answer that broke the contract would fail loudly, not ship", () => {
  /* a packet whose ids were stripped: the space branch still cites the two
     readings it used, and answerLocal must refuse its own output rather than
     hand back an envelope citing evidence the caller cannot resolve */
  const tampered = {
    generatedAt: "2026-08-30T09:00:00.000Z",
    evidence: {
      "disk.availableBytes": { value: 214748364800, unit: "bytes", kind: "measured" },
      "disk.usedPercent": { value: 80, unit: "percent", kind: "measured" },
    },
    evidenceIds: [],
    reclaimItems: [],
  };

  assert.throws(
    () => answerLocal({ message: "how much free space do i have?", packet: tampered }),
    /failed validation/,
  );
});

test("the same question always produces the same answer", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: new Date("2026-08-30T09:00:00Z") });
  const first = answerLocal({ message: "how much free space do i have?", packet });
  const second = answerLocal({ message: "how much free space do i have?", packet });
  assert.deepEqual(first.envelope, second.envelope);
  assert.notEqual(first.traceId, second.traceId, "each answer still gets its own trace id");
});
