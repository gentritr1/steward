/* Local-only Steward. No network, no keys, no model: a deterministic router
   over the evidence packet, wearing the same envelope every future provider
   adapter will have to wear. It is the product for phase 1, not a stub — so it
   validates its own output and throws if it ever fails its own contract. */

import { randomBytes } from "node:crypto";

import { validateEnvelope } from "./steward-contract.mjs";

const PROVIDER = "local";
const MODEL = "deterministic-v1";

/* same rounding the dashboard uses, so a number never changes shape between
   the panel that shows it and the sentence that explains it */
function formatBytes(value) {
  const units = ["B", "KB", "MB", "GB", "TB"];
  let amount = Math.max(0, value);
  let unitIndex = 0;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  const digits = amount >= 100 || unitIndex === 0 ? 0 : 1;
  return `${new Intl.NumberFormat("en", { maximumFractionDigits: digits }).format(amount)} ${units[unitIndex]}`;
}

function formatPercent(value) {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}

function read(packet, id) {
  const entry = packet?.evidence?.[id];
  return entry && typeof entry.value === "number" ? entry.value : null;
}

function escapeToken(token) {
  return token.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function tokenMatcher(tokens) {
  return new RegExp(`(?:^|[^a-z0-9])(?:${tokens.map(escapeToken).join("|")})(?:[^a-z0-9]|$)`);
}

/* first match wins, so the order is the routing decision: a question about
   cleaning is about cleaning even when it also says "space", and a question
   about what changed is about change even when it also says "disk" */
const INTENTS = [
  ["reclaim", tokenMatcher([
    "reclaim", "reclaimable", "clean", "cleanup", "clean up", "free up", "delete",
    "remove", "junk", "cache", "caches", "tidy", "purge", "trash", "clear",
  ])],
  ["changed", tokenMatcher([
    "changed", "change", "changes", "different", "moved", "move", "grew", "grow",
    "growing", "growth", "compare", "comparison", "since", "trend", "yesterday", "new",
  ])],
  ["coverage", tokenMatcher([
    "coverage", "covered", "trust", "privacy", "private", "scan", "scanned",
    "scanning", "unknown", "blind", "measure", "measured", "account for",
  ])],
  ["lessons", tokenMatcher([
    "learn", "learning", "lesson", "lessons", "teach", "course", "study", "academy", "curriculum",
  ])],
  ["space", tokenMatcher([
    "space", "disk", "storage", "room", "free", "full", "capacity",
    "available", "gb", "gigabytes", "left", "drive",
  ])],
];

function classify(message) {
  const text = typeof message === "string" ? message.toLowerCase() : "";
  for (const [intent, matcher] of INTENTS) {
    if (matcher.test(text)) return intent;
  }
  return "unknown";
}

function envelope(fields) {
  return {
    schemaVersion: "1",
    speaker: "steward",
    message: fields.message,
    epistemicState: fields.epistemicState,
    evidenceIds: fields.evidenceIds ?? [],
    confidence: fields.confidence,
    nextStep: fields.nextStep ?? null,
    memoryCandidate: fields.memoryCandidate ?? null,
    presentation: { expression: fields.expression, panel: fields.panel },
  };
}

/* the only honest answer when the reading is not in the packet: no estimate,
   no nearby number standing in for the one that was asked about */
function unavailable() {
  return envelope({
    message: "i do not have that reading yet.",
    epistemicState: "unavailable",
    evidenceIds: [],
    confidence: "low",
    expression: "calm",
    panel: "fact",
  });
}

function answerSpace(packet) {
  const available = read(packet, "disk.availableBytes");
  const usedPercent = read(packet, "disk.usedPercent");
  if (available === null || usedPercent === null) return unavailable();

  const expression = usedPercent >= 90 ? "concerned" : usedPercent >= 80 ? "watchful" : "calm";

  return envelope({
    message: `${formatBytes(available)} free. the disk is ${formatPercent(usedPercent)} used.`,
    epistemicState: "measured",
    evidenceIds: ["disk.availableBytes", "disk.usedPercent"],
    confidence: "high",
    nextStep: { actionId: "show_receipt", targetId: "disk.history" },
    expression,
    panel: "fact",
  });
}

function answerChanged(packet) {
  const readings = read(packet, "history.readingCount");
  if (readings === null || readings < 1) return unavailable();

  /* one reading is a baseline, not a trend. saying so is the whole answer. */
  const message = readings === 1
    ? "one reading. nothing to compare it to."
    : `${readings} readings so far. the receipt shows what moved between them.`;

  return envelope({
    message,
    epistemicState: "measured",
    evidenceIds: ["history.readingCount"],
    confidence: "high",
    nextStep: { actionId: "show_receipt", targetId: "disk.history" },
    expression: "calm",
    panel: readings === 1 ? "fact" : "receipt",
  });
}

function answerReclaim(packet) {
  const safeBytes = read(packet, "reclaim.safeBytes");
  const reviewBytes = read(packet, "reclaim.reviewBytes");
  if (safeBytes === null || reviewBytes === null) return unavailable();

  const evidenceIds = ["reclaim.safeBytes", "reclaim.reviewBytes"];
  if (read(packet, "reclaim.itemCount") !== null) evidenceIds.push("reclaim.itemCount");

  /* the honesty line of this whole branch: safe bytes are reclaimable, review
     bytes are worth a review. review bytes never become "reclaimable, i can
     wait" — that is a decision Steward does not get to pre-make. */
  let message;
  if (safeBytes > 0 && reviewBytes > 0) {
    message = `${formatBytes(safeBytes)} is safely reclaimable. another ${formatBytes(reviewBytes)} is worth a review.`;
  } else if (safeBytes > 0) {
    message = `${formatBytes(safeBytes)} is safely reclaimable. nothing else is pending.`;
  } else if (reviewBytes > 0) {
    message = `nothing is clearly safe to remove. ${formatBytes(reviewBytes)} is worth a review.`;
  } else {
    message = "nothing crosses the threshold today.";
  }

  return envelope({
    message,
    epistemicState: "measured",
    evidenceIds,
    confidence: "high",
    nextStep: { actionId: "open_channel", targetId: "storage" },
    expression: reviewBytes > 0 ? "watchful" : "calm",
    panel: "fact",
  });
}

function answerCoverage(packet) {
  const percent = read(packet, "coverage.percent");
  if (percent === null) return unavailable();

  return envelope({
    message: `i can account for ${formatPercent(percent)} of the disk. the rest is unmeasured.`,
    epistemicState: "measured",
    evidenceIds: ["coverage.percent"],
    confidence: "high",
    nextStep: { actionId: "open_channel", targetId: "trust" },
    expression: "calm",
    panel: "receipt",
  });
}

function answerLessons(packet) {
  const currentDay = read(packet, "lessons.currentDay");
  const total = read(packet, "lessons.total");
  if (currentDay === null || total === null) return unavailable();

  return envelope({
    message: `lesson ${currentDay} of ${total} is ready when you are.`,
    epistemicState: "measured",
    evidenceIds: ["lessons.currentDay", "lessons.total"],
    confidence: "high",
    nextStep: { actionId: "show_lesson", targetId: "current" },
    expression: "pleased",
    panel: "teach",
  });
}

function answerUnknown() {
  return envelope({
    message: "i can answer about space, changes, reclaim, coverage, and lessons.",
    epistemicState: "unavailable",
    evidenceIds: [],
    confidence: "low",
    expression: "calm",
    panel: "fact",
  });
}

const ROUTES = {
  space: answerSpace,
  changed: answerChanged,
  reclaim: answerReclaim,
  coverage: answerCoverage,
  lessons: answerLessons,
  unknown: answerUnknown,
};

/**
 * Answer one question from the evidence packet alone.
 * The message is routed and then discarded: nothing about it is stored, and no
 * timestamp of it is kept.
 *
 * @param {{message: string, packet: object}} request
 */
export function answerLocal(request) {
  const packet = request?.packet ?? { evidence: {}, evidenceIds: [], reclaimItems: [] };
  const intent = classify(request?.message);
  const candidate = ROUTES[intent](packet);

  const result = validateEnvelope(candidate, {
    knownEvidenceIds: packet.evidenceIds ?? [],
    knownReclaimIds: (packet.reclaimItems ?? []).map((item) => item.id),
    packet,
  });

  /* a local branch that breaks the contract is a bug in this file, and it fails
     here — loudly, in tests — rather than shipping an invalid envelope */
  if (!result.ok) {
    throw new Error(`local envelope failed validation: ${result.errors.join("; ")}`);
  }

  return {
    envelope: candidate,
    provider: PROVIDER,
    model: MODEL,
    fallbackUsed: false,
    traceId: randomBytes(6).toString("hex"),
  };
}
