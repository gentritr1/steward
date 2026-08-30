/* The private usage ledger.

   One line per cloud call, and per AUTO-routed local answer, so the question
   "was the routing worth it?" can be answered from evidence instead of from a
   feeling. It lives at data/usage/ledger.jsonl, it is git-ignored, it is never
   served as a file, and it never leaves the machine.

   What it may contain is the whole design. The entry is not the caller's object
   with some fields deleted — nothing is ever deleted, because nothing is ever
   copied. It is built here, field by named field, from FIFTEEN whitelisted
   values, each one coerced to a number, a boolean, or a short token that cannot
   hold a sentence. A question, an answer, an evidence value, or a path has no
   route into this file: not because a filter strips it, but because no line
   here reads one.

   The tokens below are capped at 48 characters and forbid whitespace. That is
   not cosmetic — it is what makes "a question ended up in routeReason" a
   structural impossibility rather than a promise. */

import { appendFile, mkdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { PRICING } from "./providers/pricing.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

export const DEFAULT_LEDGER_PATH = path.join(projectRoot, "data", "usage", "ledger.jsonl");

/* the whole vocabulary of a line, in written order. a key not on this list
   cannot be produced by writeEntry, and summarize never reads one. */
export const LEDGER_FIELDS = Object.freeze([
  "ts",
  "traceId",
  "mode",
  "route",
  "provider",
  "model",
  "effort",
  "tokensIn",
  "tokensCached",
  "tokensOut",
  "latencyMs",
  "valid",
  "fallbackUsed",
  "routeReason",
  "estCostUsd",
]);

/* ids, model names and machine reasons only: letters, digits, and the four
   separators those vocabularies actually use. no spaces, so no prose. */
const TOKEN = /^[A-Za-z0-9][A-Za-z0-9._:-]{0,47}$/;
const TRACE = /^[0-9a-f]{4,32}$/;

const ROUTE_KEYS = Object.freeze(["local", "openai", "claude"]);

export function ledgerPath() {
  const override = process.env.STEWARD_USAGE_LEDGER;
  return typeof override === "string" && override.trim().length > 0
    ? path.resolve(override.trim())
    : DEFAULT_LEDGER_PATH;
}

function token(value) {
  return typeof value === "string" && TOKEN.test(value) ? value : null;
}

function counter(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.round(value) : null;
}

function money(value) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? value : null;
}

/* three-state on purpose: true, false, and "there was nothing to judge" */
function flag(value) {
  return value === true ? true : value === false ? false : null;
}

/**
 * The line, built from named fields. This is the redaction: every value that
 * leaves here has passed through one of the four coercions above.
 */
export function writeEntry(input = {}, options = {}) {
  const at = options.now === undefined ? Date.now() : options.now;
  return {
    ts: new Date(at).toISOString(),
    traceId: typeof input.traceId === "string" && TRACE.test(input.traceId) ? input.traceId : null,
    mode: token(input.mode),
    route: token(input.route),
    provider: token(input.provider),
    model: token(input.model),
    effort: token(input.effort),
    tokensIn: counter(input.tokensIn),
    tokensCached: counter(input.tokensCached),
    tokensOut: counter(input.tokensOut),
    latencyMs: counter(input.latencyMs),
    valid: flag(input.valid),
    fallbackUsed: flag(input.fallbackUsed),
    routeReason: token(input.routeReason),
    estCostUsd: money(input.estCostUsd),
  };
}

/**
 * Append one line. A ledger is bookkeeping, and bookkeeping never fails an
 * answer: every failure here is swallowed, reported to stderr by error CODE
 * only — never a path, never a message that could quote one — and the caller
 * gets a boolean it is free to ignore.
 *
 * @returns {Promise<boolean>} whether the line was written
 */
export async function appendUsage(input, options = {}) {
  const file = options.file ?? ledgerPath();
  try {
    await mkdir(path.dirname(file), { recursive: true });
    await appendFile(file, `${JSON.stringify(writeEntry(input, options))}\n`, "utf8");
    return true;
  } catch (error) {
    /* names and counts only */
    console.error(`usage ledger: append failed (${error?.code ?? error?.name ?? "unknown"})`);
    return false;
  }
}

function emptyRow() {
  return { calls: 0, tokensIn: 0, tokensOut: 0, estCostUsd: 0, fallbacks: 0, invalid: 0 };
}

function round(value) {
  return Math.round(value * 1_000_000) / 1_000_000;
}

/**
 * Per-route totals. Aggregates only: this never returns a line, and the
 * endpoint that serves it never gets the chance to leak one.
 *
 * A missing file is not an error — it is a machine that has not asked anything
 * yet, and it summarises to zeros.
 */
export async function summarizeLedger(options = {}) {
  const file = options.file ?? ledgerPath();
  const byRoute = Object.fromEntries(ROUTE_KEYS.map((key) => [key, emptyRow()]));
  const totals = emptyRow();
  let entries = 0;
  let unreadable = 0;

  let raw = "";
  try {
    raw = await readFile(file, "utf8");
  } catch {
    /* no ledger yet, or one this process may not read: zeros either way */
    return { pricesAsOf: PRICING.pricesAsOf, entries: 0, unreadable: 0, byRoute, totals };
  }

  for (const line of raw.split("\n")) {
    if (line.trim().length === 0) continue;
    let parsed;
    try {
      parsed = JSON.parse(line);
    } catch {
      unreadable += 1;
      continue;
    }
    if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
      unreadable += 1;
      continue;
    }

    entries += 1;
    const key = typeof parsed.route === "string" && Object.hasOwn(byRoute, parsed.route) ? parsed.route : null;
    const row = key === null ? null : byRoute[key];
    for (const target of [row, totals]) {
      if (!target) continue;
      target.calls += 1;
      target.tokensIn += counter(parsed.tokensIn) ?? 0;
      target.tokensOut += counter(parsed.tokensOut) ?? 0;
      target.estCostUsd += money(parsed.estCostUsd) ?? 0;
      if (parsed.fallbackUsed === true) target.fallbacks += 1;
      if (parsed.valid === false) target.invalid += 1;
    }
  }

  for (const row of [...Object.values(byRoute), totals]) row.estCostUsd = round(row.estCostUsd);
  /* the date on the rate card the costs were estimated from. every cost in this
     summary is inferred from it, which is why the UI marks them with `~`. */
  return { pricesAsOf: PRICING.pricesAsOf, entries, unreadable, byRoute, totals };
}
