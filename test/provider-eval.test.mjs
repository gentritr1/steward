/* The release bar is provider-agnostic or it is not a bar.

   The same 24 cases that gate the local generator are run here through the full
   cloud path — router, adapter, wire parse, contract validation, stamps — with
   the socket replaced by a mock. Two adapters are simulated: one that behaves,
   and one that drifts. The behaving one must clear exactly the bar local
   clears. The drifting one must be caught, and its numbers must never reach an
   answer. */

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import { answerLocal } from "../server/steward-assistant.mjs";
import { buildEvidencePacket } from "../server/steward-context.mjs";
import { runEvalSuite } from "../server/steward-eval.mjs";
import { answerWithProvider } from "../server/providers/select-provider.mjs";

const testDir = path.dirname(fileURLToPath(import.meta.url));
const baseFixture = path.join(testDir, "fixtures", "assistant", "base");
const casesFile = path.join(testDir, "fixtures", "eval", "cases.json");
const NOW = new Date("2026-08-30T09:00:00Z");

const CATEGORIES = ["grounding", "agency", "privacy", "personality", "teaching", "failure"];

let savedKey;

before(() => {
  savedKey = process.env.ANTHROPIC_API_KEY;
  process.env.ANTHROPIC_API_KEY = "test-anthropic-key";
});

after(() => {
  if (savedKey === undefined) delete process.env.ANTHROPIC_API_KEY;
  else process.env.ANTHROPIC_API_KEY = savedKey;
});

async function loadSuite() {
  const [cases, packet] = await Promise.all([
    readFile(casesFile, "utf8").then((raw) => JSON.parse(raw).cases),
    buildEvidencePacket(baseFixture, { now: NOW }),
  ]);
  return { cases, packet };
}

function wireReply(envelope) {
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

/* A cloud adapter that behaves: it reads the packet out of the request it was
   actually sent — not out of a closure — and answers from it. That is what a
   model doing its job looks like from this side of the socket, and reading the
   packet off the wire is what makes it a test of the request too. */
function behavingTransport() {
  return async (url, init) => {
    const body = JSON.parse(init.body);
    const payload = JSON.parse(body.messages[0].content);
    const { envelope } = answerLocal({ message: payload.message, packet: payload.evidence });
    return wireReply(envelope);
  };
}

/* A cloud adapter that drifts: correct shape, correct evidence ids, correct
   citation — and the wrong digits. This is the failure a schema check alone
   cannot see, and the one the numeric cross-check exists for. */
const DRIFTED = {
  schemaVersion: "1",
  speaker: "steward",
  message: "1,024 GB free. the disk is 3% used.",
  epistemicState: "measured",
  evidenceIds: ["disk.availableBytes", "disk.usedPercent"],
  confidence: "high",
  nextStep: { actionId: "show_receipt", targetId: "disk.history" },
  memoryCandidate: null,
  presentation: { expression: "calm", panel: "fact" },
};

function driftingTransport() {
  return async () => wireReply(DRIFTED);
}

/* the generator runEvalSuite is handed: the real router, over a mock socket */
function cloudGenerator(transport, seen = []) {
  return async ({ message, packet }) => {
    const result = await answerWithProvider({
      mode: "anthropic",
      message,
      packet,
      transports: { anthropic: transport },
    });
    seen.push(result);
    return result;
  };
}

test("a well-behaved cloud adapter clears exactly the bar the local generator clears", async () => {
  const { cases, packet } = await loadSuite();
  const seen = [];
  const summary = await runEvalSuite(cloudGenerator(behavingTransport(), seen), { cases, packet, runs: 3 });

  const byCategory = Object.fromEntries(CATEGORIES.map((category) => [
    category,
    summary.failures.filter((failure) => failure.category === category).length,
  ]));

  console.log(
    `eval (cloud, mocked transport): ${summary.passes}/${summary.total} runs passed `
    + `| schema ${summary.schemaValidity}% | evidence+action ${summary.evidenceValidity}% | `
    + CATEGORIES.map((category) => `${category} failures ${byCategory[category]}`).join(", "),
  );
  for (const failure of summary.failures) {
    console.log(`  fail ${failure.caseId} run ${failure.run}: ${failure.errors.join("; ")}`);
  }

  assert.equal(summary.total, 72);
  assert.equal(summary.schemaValidity, 100);
  assert.equal(summary.evidenceValidity, 100);
  assert.deepEqual(summary.failures, []);
  assert.equal(summary.passes, summary.total);

  /* and it passed as a cloud answer, not by quietly falling back to local */
  assert.equal(seen.length, 72);
  assert.equal(seen.every((result) => result.fallbackUsed === false), true, "no run may have fallen back");
  assert.equal(seen.every((result) => result.provider === "anthropic"), true);
});

test("the suite catches a drifting adapter through the numeric cross-check", async () => {
  const { cases, packet } = await loadSuite();

  /* the drifted envelope handed to the suite raw, with no router in the way:
     this is the suite's own verdict on fabricated digits */
  const summary = await runEvalSuite(() => Promise.resolve({ envelope: DRIFTED }), { cases, packet, runs: 1 });

  assert.equal(summary.passes, 0, "not one drifted answer may pass");
  assert.equal(summary.evidenceValidity, 0, "a fabricated number is an evidence failure, not a schema one");
  assert.equal(summary.schemaValidity, 100, "the shape was never the problem — that is the point");

  const joined = summary.failures.flatMap((failure) => failure.errors).join(" | ");
  assert.match(joined, /1,024 GB/, "the fabricated byte figure must be named");
  assert.match(joined, /3%/, "the fabricated percentage must be named");
});

test("a drifting adapter never ships its numbers: every run falls back instead", async () => {
  const { cases, packet } = await loadSuite();
  const seen = [];
  const summary = await runEvalSuite(cloudGenerator(driftingTransport(), seen), { cases, packet, runs: 1 });

  assert.equal(seen.length, 24);
  assert.equal(seen.every((result) => result.fallbackUsed === true), true, "every drifted answer must be refused");
  assert.equal(seen.every((result) => result.fallbackReason === "invalid"), true);
  assert.equal(seen.every((result) => result.provider === "local"), true);

  /* the fabricated digits appear in the recorded reason and nowhere else */
  assert.equal(seen.some((result) => result.envelope.message.includes("1,024 GB")), false);
  assert.match(seen[0].contractErrors.join(" "), /1,024 GB/);

  /* and because the fallback is the local answer, the suite still passes —
     which is the product working, not the check being fooled */
  assert.deepEqual(summary.failures, []);
});
