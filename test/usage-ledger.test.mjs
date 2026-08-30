/* The ledger, its privacy whitelist, its resilience, and the prices it uses.

   The privacy test here is structural on purpose: it plants a question in every
   field of a full request/response cycle's worth of input and then asserts that
   the written line has exactly the fifteen whitelisted keys and that no string
   anywhere in it contains any part of the planted text. That is a claim about
   what the writer CAN produce, not about what today's caller happens to pass. */

import assert from "node:assert/strict";
import { mkdtemp, readFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { estimateCostUsd, PRICING, priceFor } from "../server/providers/pricing.mjs";
import { LEDGER_FIELDS, appendUsage, summarizeLedger, writeEntry } from "../server/usage-ledger.mjs";

const QUESTION = "why is my Downloads folder full of Acme-Q3-payroll.pdf?";

function tmpdir() {
  return mkdtemp(path.join(os.tmpdir(), "steward-ledger-"));
}

/* every string in a parsed line, however deeply nested */
function strings(value, found = []) {
  if (typeof value === "string") found.push(value);
  else if (value && typeof value === "object") for (const child of Object.values(value)) strings(child, found);
  return found;
}

test("a line has exactly the fifteen whitelisted fields", () => {
  const entry = writeEntry({
    traceId: "a1b2c3d4e5f6",
    mode: "auto",
    route: "openai",
    provider: "openai",
    model: "gpt-5.6-luna",
    effort: "low",
    tokensIn: 900,
    tokensCached: null,
    tokensOut: 120,
    latencyMs: 812,
    valid: true,
    fallbackUsed: false,
    routeReason: "unknown-intent:cheap-cloud",
    estCostUsd: 0.000324,
  });
  assert.deepEqual(Object.keys(entry), [...LEDGER_FIELDS]);
  assert.equal(LEDGER_FIELDS.length, 15);
  assert.match(entry.ts, /^\d{4}-\d{2}-\d{2}T/);
});

test("prompt text, answer text and paths cannot reach a line", async () => {
  const directory = await tmpdir();
  const file = path.join(directory, "nested", "ledger.jsonl");
  try {
    /* everything a request/response cycle holds, hostile: the question in every
       string field, the answer in the reason, a real path in the model */
    const written = await appendUsage({
      traceId: QUESTION,
      mode: QUESTION,
      route: QUESTION,
      provider: `${QUESTION} openai`,
      model: "/Users/someone/Downloads/Acme-Q3-payroll.pdf",
      effort: QUESTION,
      routeReason: `205 GB free. the disk is 80% used. (${QUESTION})`,
      tokensIn: QUESTION,
      tokensOut: { nested: QUESTION },
      latencyMs: "12ms",
      valid: QUESTION,
      fallbackUsed: "no",
      estCostUsd: "0.0004",
      /* a field nobody asked for: it must not survive being handed in */
      message: QUESTION,
      question: QUESTION,
      evidence: { "disk.availableBytes": 214748364800 },
    }, { file });
    assert.equal(written, true);

    const lines = (await readFile(file, "utf8")).trim().split("\n");
    assert.equal(lines.length, 1);
    const parsed = JSON.parse(lines[0]);

    /* the whitelist, positively: these keys and no others */
    assert.deepEqual(Object.keys(parsed).sort(), [...LEDGER_FIELDS].sort());
    assert.equal(parsed.message, undefined);
    assert.equal(parsed.question, undefined);
    assert.equal(parsed.evidence, undefined);

    /* and negatively: no string in the line carries any of the planted text */
    const planted = ["Downloads", "Acme", "payroll", "pdf", "why is my", "205 GB", "/Users/"];
    for (const value of strings(parsed)) {
      for (const needle of planted) {
        assert.ok(!value.includes(needle), `"${needle}" reached the ledger in "${value}"`);
      }
    }

    /* the raw line, not just the parsed object — no encoding sneaks it past */
    for (const needle of planted) assert.ok(!lines[0].includes(needle), `"${needle}" reached the raw line`);

    /* prose fails the token shape and lands as null, never as a truncation */
    assert.equal(parsed.routeReason, null);
    assert.equal(parsed.model, null);
    assert.equal(parsed.tokensIn, null);
    assert.equal(parsed.tokensOut, null);
    assert.equal(parsed.latencyMs, null);
    assert.equal(parsed.valid, null);
    assert.equal(parsed.fallbackUsed, null);
    assert.equal(parsed.estCostUsd, null);
    assert.equal(parsed.traceId, null);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("the directory is created on demand, and appends accumulate", async () => {
  const directory = await tmpdir();
  const file = path.join(directory, "data", "usage", "ledger.jsonl");
  try {
    for (const route of ["local", "openai", "local"]) {
      await appendUsage({ mode: "auto", route, routeReason: "known-intent:space", valid: true, fallbackUsed: false }, { file });
    }
    const lines = (await readFile(file, "utf8")).trim().split("\n");
    assert.equal(lines.length, 3);
    assert.deepEqual(lines.map((line) => JSON.parse(line).route), ["local", "openai", "local"]);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("an unwritable ledger never throws — the answer outranks the bookkeeping", async () => {
  const directory = await tmpdir();
  try {
    /* a FILE standing where the ledger's directory would have to be: mkdir
       fails, append fails, and appendUsage still returns rather than throwing */
    const blocker = path.join(directory, "blocker");
    await appendUsage({ mode: "auto", route: "local" }, { file: blocker });
    const written = await appendUsage({ mode: "auto", route: "local" }, { file: path.join(blocker, "usage", "ledger.jsonl") });
    assert.equal(written, false);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("a missing ledger summarises to zeros, not to an error", async () => {
  const directory = await tmpdir();
  try {
    const summary = await summarizeLedger({ file: path.join(directory, "absent.jsonl") });
    assert.equal(summary.entries, 0);
    assert.deepEqual(summary.totals, { calls: 0, tokensIn: 0, tokensOut: 0, estCostUsd: 0, fallbacks: 0, invalid: 0 });
    assert.deepEqual(Object.keys(summary.byRoute).sort(), ["claude", "local", "openai"]);
    assert.equal(summary.byRoute.openai.calls, 0);
    assert.equal(summary.pricesAsOf, PRICING.pricesAsOf);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test("the summary totals per route, and survives a torn line", async () => {
  const directory = await tmpdir();
  const file = path.join(directory, "ledger.jsonl");
  try {
    await appendUsage({ mode: "auto", route: "local", routeReason: "known-intent:space", valid: true, fallbackUsed: false }, { file });
    await appendUsage({
      mode: "auto", route: "openai", provider: "openai", model: "gpt-5.6-luna",
      tokensIn: 1000, tokensOut: 100, estCostUsd: 0.00032, valid: true, fallbackUsed: false,
    }, { file });
    await appendUsage({
      mode: "anthropic", route: "claude", provider: "anthropic", model: "claude-sonnet-5",
      tokensIn: 1000, tokensOut: 100, estCostUsd: 0.003, valid: false, fallbackUsed: true,
    }, { file });
    /* a half-written line from a killed process must not lose the rest */
    const { appendFile } = await import("node:fs/promises");
    await appendFile(file, '{"route":"local","tokensIn":\n', "utf8");

    const summary = await summarizeLedger({ file });
    assert.equal(summary.entries, 3);
    assert.equal(summary.unreadable, 1);
    assert.equal(summary.byRoute.local.calls, 1);
    assert.equal(summary.byRoute.openai.tokensIn, 1000);
    assert.equal(summary.byRoute.claude.fallbacks, 1);
    assert.equal(summary.byRoute.claude.invalid, 1);
    assert.equal(summary.totals.calls, 3);
    assert.equal(summary.totals.estCostUsd, 0.00332);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

/* ---- pricing ---- */

test("the rate card is dated and covers the six models the table names", () => {
  assert.equal(PRICING.pricesAsOf, "2026-08-30");
  assert.deepEqual(Object.keys(PRICING.perMTok).sort(), [
    "claude-haiku-4-5", "claude-opus-5", "claude-sonnet-5",
    "gpt-5.6-luna", "gpt-5.6-sol", "gpt-5.6-terra",
  ]);
  assert.deepEqual(priceFor("gpt-5.6-luna"), { in: 0.2, out: 1.2 });
  assert.equal(priceFor("gpt-5.6-unknown"), null);
});

test("estimateCostUsd multiplies the card by the reported tokens", () => {
  /* 1000 in at $0.20/MTok = $0.0002; 100 out at $1.20/MTok = $0.00012 */
  assert.equal(estimateCostUsd("gpt-5.6-luna", { inputTokens: 1000, outputTokens: 100 }), 0.00032);
  /* 1000 in at $2/MTok = $0.002; 100 out at $10/MTok = $0.001 */
  assert.equal(estimateCostUsd("claude-sonnet-5", { inputTokens: 1000, outputTokens: 100 }), 0.003);
  /* a million each, so the card reads straight off the answer */
  assert.equal(estimateCostUsd("claude-opus-5", { inputTokens: 1_000_000, outputTokens: 1_000_000 }), 30);
});

test("cached tokens are priced as ordinary input — an over-estimate, never an invented discount", () => {
  const plain = estimateCostUsd("gpt-5.6-luna", { inputTokens: 1000, outputTokens: 0 });
  const cached = estimateCostUsd("gpt-5.6-luna", { inputTokens: 0, cachedTokens: 1000, outputTokens: 0 });
  assert.equal(cached, plain);
  assert.equal(estimateCostUsd("gpt-5.6-luna", { inputTokens: 1000, cachedTokens: 1000, outputTokens: 0 }), 0.0004);
});

test("an unpriced model and an unreported call both estimate to null, never to zero", () => {
  assert.equal(estimateCostUsd("deterministic-v1", { inputTokens: 10, outputTokens: 10 }), null);
  assert.equal(estimateCostUsd("gpt-5.6-luna", {}), null);
  assert.equal(estimateCostUsd("gpt-5.6-luna", { inputTokens: null, outputTokens: null }), null);
  assert.equal(estimateCostUsd(null, { inputTokens: 10 }), null);
  /* a reported zero is a claim, and it prices to zero */
  assert.equal(estimateCostUsd("gpt-5.6-luna", { inputTokens: 0, outputTokens: 0 }), 0);
});
