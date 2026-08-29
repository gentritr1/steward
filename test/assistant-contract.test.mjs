import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { answerLocal } from "../server/steward-assistant.mjs";
import { buildEvidencePacket } from "../server/steward-context.mjs";
import {
  ACTION_ALLOWLIST,
  ENVELOPE_SCHEMA,
  buildAcceptableNumbers,
  extractNumericClaims,
  validateEnvelope,
} from "../server/steward-contract.mjs";

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
  /* the packet goes in, so every digit in every local reply is cross-checked
     against the readings behind it. this is the regression gate for the numeric
     check: a local reply that fails here means the acceptable set is wrong, not
     that the reply should be reworded. */
  const packetContext = {
    knownEvidenceIds: packet.evidenceIds,
    knownReclaimIds: packet.reclaimItems.map((item) => item.id),
    packet,
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

/* ---------------------------------------------------------------------------
   the numeric cross-check: citing the right evidence id and printing the wrong
   digits used to pass every check in this file
   --------------------------------------------------------------------------- */

/* fictional throughout. 55.3 GB free, 26.7% accounted for, and a reclaim split
   of 5.2 + 3.4 GB, chosen so the sum lands on a different figure (8.6 GB) than
   either part. */
const crossCheckPacket = {
  generatedAt: "2026-08-30T09:00:00.000Z",
  evidence: {
    "disk.availableBytes": { value: 59_377_922_867, unit: "bytes", kind: "measured" },
    "disk.usedPercent": { value: 94.6, unit: "percent", kind: "measured" },
    "history.readingCount": { value: 5, unit: "count", kind: "measured" },
    "reclaim.safeBytes": { value: 5_583_457_485, unit: "bytes", kind: "measured" },
    "reclaim.reviewBytes": { value: 3_650_722_202, unit: "bytes", kind: "measured" },
    "coverage.percent": { value: 26.7, unit: "percent", kind: "measured" },
  },
  evidenceIds: [
    "disk.availableBytes",
    "disk.usedPercent",
    "history.readingCount",
    "reclaim.safeBytes",
    "reclaim.reviewBytes",
    "coverage.percent",
  ],
  reclaimItems: [{ id: "app-caches", riskToken: "rebuildable", bytes: 5_583_457_485 }],
};

const crossCheckContext = {
  knownEvidenceIds: crossCheckPacket.evidenceIds,
  knownReclaimIds: ["app-caches"],
  packet: crossCheckPacket,
};

function claimed(message, overrides = {}) {
  return goodEnvelope({ message, evidenceIds: ["disk.availableBytes"], nextStep: null, ...overrides });
}

test("extracts digit-based claims with their context, and leaves word-numbers alone", () => {
  assert.deepEqual(
    extractNumericClaims("55.3 GB free. the disk is 94.6% used.").map((claim) => claim.token),
    ["bytes:55.3gb", "percent:94.6"],
  );
  assert.deepEqual(
    extractNumericClaims("lesson 7 of 30 is ready. 5 readings so far, and 2 copies on day 3.")
      .map((claim) => claim.token),
    ["count:7", "count:30", "count:5", "count:2", "count:3"],
  );
  assert.deepEqual(extractNumericClaims("87 percent of the disk").map((claim) => claim.token), ["percent:87"]);

  /* documented scope: a spelled-out number is not extracted, and a bare number
     with no unit and no counted noun is not a claim */
  assert.deepEqual(extractNumericClaims("one reading. nothing to compare it to."), []);
  assert.deepEqual(extractNumericClaims("i can answer about space, changes, and lessons."), []);
});

test("the acceptable set holds each reading, the recomputed percentage, and the reclaim sum", () => {
  const acceptable = buildAcceptableNumbers(crossCheckPacket);

  assert.equal(acceptable.has("bytes:55.3gb"), true, "the reading itself, at one decimal");
  assert.equal(acceptable.has("bytes:55gb"), true, "and at zero decimals");
  assert.equal(acceptable.has("percent:26.7"), true);
  assert.equal(acceptable.has("bytes:8.6gb"), true, "safe plus review is the one total a reply may add up");
  assert.equal(acceptable.has("bytes:99gb"), false);
  /* capacity minus used is deliberately NOT derived, so nothing here can stand
     in for a figure the packet never measured */
  assert.equal(acceptable.has("count:59377922867"), false);
});

test("a fabricated number is rejected even when the evidence id is right", () => {
  const result = validateEnvelope(claimed("99 GB free. the disk is 94.6% used."), crossCheckContext);
  assert.equal(result.ok, false);
  assert.equal(result.errors.length, 1, "only the fabricated figure is wrong");
  assert.match(result.errors[0], /99 GB/, "the rejection must name the claim");
});

test("both the zero-decimal and the one-decimal rounding of a reading are accepted", () => {
  for (const message of ["55.3 GB free.", "55 GB free."]) {
    assert.deepEqual(validateEnvelope(claimed(message), crossCheckContext).errors, [], message);
  }
  /* "55.0" is neither rounding: dropping the decimal gives 55, keeping it gives
     55.3. a sentence that prints a decimal place is claiming that precision. */
  assert.equal(validateEnvelope(claimed("55.0 GB free."), crossCheckContext).ok, false);
  /* an exact reading does carry its padded form: 200 GB really is 200.0 GB */
  const exact = { ...crossCheckPacket, evidence: {
    ...crossCheckPacket.evidence,
    "disk.availableBytes": { value: 214_748_364_800, unit: "bytes", kind: "measured" },
  } };
  assert.equal(
    validateEnvelope(claimed("200.0 GB free."), { ...crossCheckContext, packet: exact }).ok,
    true,
  );
});

test("a percentage must be the measured one, not a plausible neighbour", () => {
  assert.equal(
    validateEnvelope(claimed("i can account for 26.7% of the disk."), crossCheckContext).ok,
    true,
  );
  const wrong = validateEnvelope(claimed("i can account for 27.9% of the disk."), crossCheckContext);
  assert.equal(wrong.ok, false);
  assert.match(wrong.errors[0], /27\.9/);
});

test("the reclaim total may be added up, and nothing else may be", () => {
  assert.deepEqual(
    validateEnvelope(claimed("8.6 gb is worth a review."), crossCheckContext).errors,
    [],
    "safe plus review is a legitimate sum",
  );
  assert.deepEqual(
    validateEnvelope(claimed("5.2 GB is safely reclaimable. another 3.4 GB is worth a review."), crossCheckContext)
      .errors,
    [],
  );
  /* 5.2 + 3.4 is allowed; 5.2 - 3.4 is not */
  assert.equal(validateEnvelope(claimed("1.8 GB is the difference."), crossCheckContext).ok, false);
});

test("counted nouns are checked against the packet too", () => {
  assert.deepEqual(validateEnvelope(claimed("5 readings so far."), crossCheckContext).errors, []);
  assert.equal(validateEnvelope(claimed("12 readings so far."), crossCheckContext).ok, false);
});

test("without a packet the numbers are not checked at all", () => {
  const noPacket = { knownEvidenceIds: crossCheckPacket.evidenceIds, knownReclaimIds: ["app-caches"] };
  assert.deepEqual(validateEnvelope(claimed("99 GB free. the disk is 12345% used."), noPacket).errors, []);
});

test("every local answer over the review-only packet also survives the cross-check", async () => {
  const reviewFixture = path.join(testDir, "fixtures", "assistant", "review-only");
  const packet = await buildEvidencePacket(reviewFixture, { now: new Date("2026-08-30T09:00:00Z") });
  const packetContext = {
    knownEvidenceIds: packet.evidenceIds,
    knownReclaimIds: packet.reclaimItems.map((item) => item.id),
    packet,
  };

  /* this fixture has five snapshots, so it is the only one that exercises the
     plural "N readings" sentence the base fixture never produces */
  const changed = answerLocal({ message: "what changed since yesterday?", packet }).envelope;
  assert.match(changed.message, /\d+ readings/);

  for (const message of MESSAGES) {
    const envelope = answerLocal({ message, packet }).envelope;
    assert.deepEqual(validateEnvelope(envelope, packetContext).errors, [], `"${message}" produced an invalid envelope`);
  }
});

test("the same question always produces the same answer", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: new Date("2026-08-30T09:00:00Z") });
  const first = answerLocal({ message: "how much free space do i have?", packet });
  const second = answerLocal({ message: "how much free space do i have?", packet });
  assert.deepEqual(first.envelope, second.envelope);
  assert.notEqual(first.traceId, second.traceId, "each answer still gets its own trace id");
});
