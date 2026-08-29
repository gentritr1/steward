import assert from "node:assert/strict";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

import { answerLocal } from "../server/steward-assistant.mjs";
import { EVIDENCE_IDS, buildEvidencePacket } from "../server/steward-context.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const baseFixture = path.join(testDir, "fixtures", "assistant", "base");
const NOW = new Date("2026-08-30T09:00:00Z");

/* every decoy is planted in a different source file and a different field:
   a project name, a coverage root, a reclaim scope, an event title, a workflow
   description, and lesson prose. none of them has a route into the packet. */
const DECOYS = [
  "secret-launch-x",
  "~/Documents/private-notes",
  "~/Library/VerySecret",
  "Cleaned the wedding photos",
  "wedding photos",
  "divorce papers",
  "Aunt Mira",
  "node_modules",
  "Application caches",
  "Xcode archives",
  "Morning Steward",
];

const QUESTIONS = [
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
  "tell me about secret-launch-x",
  "what is in ~/Documents/private-notes?",
  "asdfjkl qwerty zxcv",
  "hello",
];

function assertClean(text, where) {
  const haystack = text.toLowerCase();
  for (const decoy of DECOYS) {
    assert.equal(haystack.includes(decoy.toLowerCase()), false, `${where} leaked "${decoy}"`);
  }
}

test("the fixture really does contain the decoys", async () => {
  const { readFile } = await import("node:fs/promises");
  const files = ["latest.json", "events.json", "workflow-insights.json", "lessons.json"];
  const raw = (await Promise.all(files.map((name) => readFile(path.join(baseFixture, name), "utf8")))).join("");
  /* otherwise this whole suite could pass by testing nothing */
  for (const decoy of DECOYS) {
    assert.ok(raw.toLowerCase().includes(decoy.toLowerCase()), `the fixture is missing decoy "${decoy}"`);
  }
});

test("the packet carries numbers and slugs, never names, labels, paths, or prose", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: NOW });
  assertClean(JSON.stringify(packet), "the evidence packet");
});

test("the packet holds exactly the whitelisted evidence ids", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: NOW });

  assert.deepEqual(packet.evidenceIds, [...EVIDENCE_IDS]);
  assert.deepEqual(Object.keys(packet.evidence), [...EVIDENCE_IDS]);

  for (const [id, entry] of Object.entries(packet.evidence)) {
    assert.deepEqual(Object.keys(entry).sort(), ["kind", "unit", "value"], `${id} carries an unexpected field`);
    assert.equal(typeof entry.value, "number");
    assert.equal(entry.kind, "measured");
    assert.ok(["bytes", "percent", "count", "days"].includes(entry.unit));
  }
});

test("reclaim items carry an id, a risk token, and a byte count only", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: NOW });

  assert.equal(packet.reclaimItems.length, 3);
  for (const item of packet.reclaimItems) {
    assert.deepEqual(Object.keys(item).sort(), ["bytes", "id", "riskToken"]);
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
    assert.ok(["safe", "rebuildable", "low", "medium", "high", "review"].includes(item.riskToken));
    assert.equal(typeof item.bytes, "number");
  }
  assert.deepEqual(packet.reclaimItems.map((item) => item.id), ["app-caches", "node-modules", "xcode-archives"]);
});

test("no answer repeats a name, a path, or a label — including when asked for one", async () => {
  const packet = await buildEvidencePacket(baseFixture, { now: NOW });

  for (const question of QUESTIONS) {
    const result = answerLocal({ message: question, packet });
    assertClean(JSON.stringify(result), `the answer to "${question}"`);
    /* and the question itself is never echoed back into the answer */
    assert.equal(JSON.stringify(result).includes("secret-launch-x"), false);
  }
});
