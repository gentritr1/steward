import assert from "node:assert/strict";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { answerLocal } from "../server/steward-assistant.mjs";
import { buildEvidencePacket } from "../server/steward-context.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const baseFixture = path.join(testDir, "fixtures", "assistant", "base");
const reviewOnlyFixture = path.join(testDir, "fixtures", "assistant", "review-only");

/* fixed clock: the lesson day is a schedule position, so a test that did not
   pin the date would pass today and fail in a week */
const NOW = new Date("2026-08-30T09:00:00Z");

const QUESTIONS = [
  "how much free space do i have?",
  "is my disk full?",
  "what changed since yesterday?",
  "what can i clean up?",
  "how much of the disk have you scanned?",
  "which lesson is next?",
  "asdfjkl qwerty zxcv",
];

function answer(packet, message) {
  return answerLocal({ message, packet }).envelope;
}

test("every cited evidence id exists in the packet it was answered from", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: NOW });

  for (const question of QUESTIONS) {
    const envelope = answer(packet, question);
    for (const id of envelope.evidenceIds) {
      assert.ok(Object.hasOwn(packet.evidence, id), `"${question}" cited ${id}, which is not in the packet`);
      assert.equal(packet.evidence[id].kind, "measured");
    }
  }
});

test("the packet arithmetic matches the fixture", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: NOW });

  /* 4 GiB rebuildable is safe; 2 GiB + 1 GiB review is not */
  assert.equal(packet.evidence["reclaim.safeBytes"].value, 4294967296);
  assert.equal(packet.evidence["reclaim.reviewBytes"].value, 2147483648 + 1073741824);
  assert.equal(packet.evidence["reclaim.itemCount"].value, 3);
  assert.equal(packet.evidence["disk.availableBytes"].value, 214748364800);
  assert.equal(packet.evidence["disk.usedPercent"].value, 80);
  assert.equal(packet.evidence["coverage.percent"].value, 42.5);
  assert.equal(packet.evidence["history.readingCount"].value, 1);
  assert.equal(packet.evidence["workflow.taskCount"].value, 50);
  assert.equal(packet.evidence["workflow.periodDays"].value, 13);
  assert.equal(packet.evidence["events.lastReclaimedBytes"].value, 53687091200);
  assert.equal(packet.evidence["lessons.total"].value, 7);
});

test("the reclaim answer quotes the split it was given", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: NOW });
  const envelope = answer(packet, "what can i clean up?");

  assert.match(envelope.message, /4 GB is safely reclaimable/);
  assert.match(envelope.message, /3 GB is worth a review/);
  assert.equal(envelope.epistemicState, "measured");
  assert.deepEqual(envelope.evidenceIds, ["reclaim.safeBytes", "reclaim.reviewBytes", "reclaim.itemCount"]);
  assert.deepEqual(envelope.nextStep, { actionId: "open_channel", targetId: "storage" });
});

test("review-only space is worth a review, never reclaimable", async () => {
  const packet = await buildEvidencePacket(reviewOnlyFixture, { now: NOW });

  assert.equal(packet.evidence["reclaim.safeBytes"].value, 0);
  assert.equal(packet.evidence["reclaim.reviewBytes"].value, 3221225472);

  const envelope = answer(packet, "how much space can i reclaim?");
  assert.match(envelope.message, /nothing is clearly safe to remove/);
  assert.match(envelope.message, /3 GB is worth a review/);
  assert.doesNotMatch(envelope.message, /reclaimable/);
  assert.doesNotMatch(envelope.message, /i can wait/);
  assert.equal(envelope.presentation.expression, "watchful");
});

test("one reading is a baseline; five readings are a comparison", async () => {
  const single = await buildEvidencePacket(baseFixture, { now: NOW });
  const many = await buildEvidencePacket(reviewOnlyFixture, { now: NOW });

  assert.equal(single.evidence["history.readingCount"].value, 1);
  assert.equal(many.evidence["history.readingCount"].value, 5);

  const singleAnswer = answer(single, "what changed since yesterday?");
  const manyAnswer = answer(many, "what changed since yesterday?");

  assert.equal(singleAnswer.message, "one reading. nothing to compare it to.");
  assert.equal(singleAnswer.epistemicState, "measured");
  assert.match(manyAnswer.message, /^5 readings so far\./);
  assert.notEqual(singleAnswer.message, manyAnswer.message);
  assert.equal(manyAnswer.presentation.panel, "receipt");
});

test("free space and coverage are read straight off the packet", async () => {
  const packet = await buildEvidencePacket(reviewOnlyFixture, { now: NOW });

  const space = answer(packet, "how much free space do i have?");
  assert.equal(space.message, "81.9 GB free. the disk is 92% used.");
  assert.equal(space.presentation.expression, "concerned");
  assert.deepEqual(space.nextStep, { actionId: "show_receipt", targetId: "disk.history" });

  /* 9.884 in the fixture, rounded once in the packet, never re-rounded in prose */
  assert.equal(packet.evidence["coverage.percent"].value, 9.9);
  const coverage = answer(packet, "how much of the disk have you scanned?");
  assert.equal(coverage.message, "i can account for 9.9% of the disk. the rest is unmeasured.");
});

test("the lesson day follows the schedule, and stops at the last lesson", async () => {
  const early = await buildEvidencePacket(baseFixture, { now: new Date("2026-07-15T09:00:00Z") });
  const second = await buildEvidencePacket(baseFixture, { now: new Date("2026-08-02T09:00:00Z") });
  const late = await buildEvidencePacket(baseFixture, { now: NOW });

  assert.equal(early.evidence["lessons.currentDay"].value, 1);
  assert.equal(second.evidence["lessons.currentDay"].value, 2);
  assert.equal(late.evidence["lessons.currentDay"].value, 7);

  const envelope = answer(late, "which lesson is next?");
  assert.equal(envelope.message, "lesson 7 of 7 is ready when you are.");
  assert.deepEqual(envelope.nextStep, { actionId: "show_lesson", targetId: "current" });
});

test("a missing data file removes its evidence ids and nothing else", async () => {
  const packet = await buildEvidencePacket(reviewOnlyFixture, { now: NOW });

  /* the review-only fixture has no workflow, events, or lessons files */
  assert.equal(Object.hasOwn(packet.evidence, "workflow.taskCount"), false);
  assert.equal(Object.hasOwn(packet.evidence, "events.lastReclaimedBytes"), false);
  assert.equal(Object.hasOwn(packet.evidence, "lessons.currentDay"), false);
  assert.equal(Object.hasOwn(packet.evidence, "disk.availableBytes"), true);

  const envelope = answer(packet, "which lesson is next?");
  assert.equal(envelope.epistemicState, "unavailable");
  assert.deepEqual(envelope.evidenceIds, []);
  assert.equal(envelope.nextStep, null);
});

test("an empty data directory answers with nothing rather than throwing", async () => {
  const emptyDir = await mkdtemp(path.join(os.tmpdir(), "steward-packet-"));
  try {
    const packet = await buildEvidencePacket(emptyDir, { now: NOW });
    assert.deepEqual(packet.evidenceIds, []);
    assert.deepEqual(packet.reclaimItems, []);

    for (const question of QUESTIONS) {
      const envelope = answer(packet, question);
      assert.equal(envelope.epistemicState, "unavailable", `"${question}" claimed knowledge it did not have`);
      assert.deepEqual(envelope.evidenceIds, []);
    }
  } finally {
    await rm(emptyDir, { recursive: true, force: true });
  }
});
