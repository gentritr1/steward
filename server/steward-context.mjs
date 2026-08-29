/* The evidence packet: the only view of the machine any answer is allowed to see.
   Redaction here is structural, not a filter pass. The packet is assembled from a
   fixed list of numeric and enum fields, so a project name, a folder label, a scope
   string, a root path, lesson prose, or an event title has no route in — not because
   a rule strips it, but because nothing ever copies it. */

import { readFile } from "node:fs/promises";
import path from "node:path";

import { RECLAIM_ID_MAX_LENGTH, RECLAIM_ID_PATTERN } from "./steward-contract.mjs";

/* mirrors the dashboard: only these three tokens carry a verdict. everything
   else — medium, high, review, or a risk the collector never wrote — is space
   a person must look at, never space Steward may call reclaimable. */
const SAFE_RISKS = new Set(["safe", "low", "rebuildable"]);
const RISK_TOKENS = ["safe", "rebuildable", "low", "medium", "high", "review"];

const MAX_RECLAIM_ITEMS = 12;
const LESSON_TIME_ZONE = "Europe/Belgrade";

/* the whole vocabulary of the packet, in report order. an id that is not on
   this list cannot be produced, and an id whose source file is missing is
   simply absent — never null, never a zero standing in for a reading. */
const EVIDENCE_ORDER = [
  "disk.capacityBytes",
  "disk.usedBytes",
  "disk.availableBytes",
  "disk.usedPercent",
  "history.readingCount",
  "reclaim.safeBytes",
  "reclaim.reviewBytes",
  "reclaim.itemCount",
  "coverage.percent",
  "workflow.taskCount",
  "workflow.periodDays",
  "events.lastReclaimedBytes",
  "lessons.total",
  "lessons.currentDay",
];

export const EVIDENCE_IDS = Object.freeze([...EVIDENCE_ORDER]);

async function readJson(dataDir, name) {
  try {
    return JSON.parse(await readFile(path.join(dataDir, name), "utf8"));
  } catch {
    /* a missing or unreadable file removes its evidence ids and nothing else */
    return null;
  }
}

function finiteNumber(value) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function byteValue(value) {
  const number = finiteNumber(value);
  return number === null || number < 0 ? null : Math.round(number);
}

function percentValue(value) {
  const number = finiteNumber(value);
  if (number === null || number < 0 || number > 100) return null;
  return Math.round(number * 10) / 10;
}

function countValue(value) {
  const number = finiteNumber(value);
  return number === null || number < 0 ? null : Math.round(number);
}

function riskToken(value) {
  return typeof value === "string" && RISK_TOKENS.includes(value) ? value : "review";
}

/* an id that is not a plain slug is dropped rather than trimmed: an id built
   from a project or folder name is exactly the leak this packet must not carry */
function reclaimId(value) {
  if (typeof value !== "string") return null;
  if (value.length > RECLAIM_ID_MAX_LENGTH) return null;
  return RECLAIM_ID_PATTERN.test(value) ? value : null;
}

/* same clock the dashboard schedules lessons on, so both agree on the day */
function localDateKey(date, timeZone) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
  return parts;
}

function dayNumber(dateKey) {
  if (typeof dateKey !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(dateKey)) return null;
  const value = Date.parse(`${dateKey}T00:00:00Z`);
  return Number.isFinite(value) ? Math.floor(value / 86_400_000) : null;
}

function lessonPosition(lessons, now) {
  const total = Array.isArray(lessons?.lessons) ? lessons.lessons.length : 0;
  if (total === 0) return { total: null, currentDay: null };

  const start = dayNumber(lessons?.startsOn);
  const today = dayNumber(localDateKey(now, LESSON_TIME_ZONE));
  if (start === null || today === null) return { total, currentDay: 1 };

  const elapsed = Math.max(0, today - start);
  return { total, currentDay: Math.min(total, elapsed + 1) };
}

function reclaimTotals(latest) {
  const items = Array.isArray(latest?.reclaimable) ? latest.reclaimable : [];
  let safeBytes = 0;
  let reviewBytes = 0;
  const packetItems = [];

  for (const item of items) {
    const bytes = byteValue(item?.bytes) ?? 0;
    const risk = riskToken(item?.risk);
    if (SAFE_RISKS.has(risk)) safeBytes += bytes;
    else reviewBytes += bytes;

    const id = reclaimId(item?.id);
    /* id, risk token, byte count. never label, scope, evidence, or rebuild cost. */
    if (id && packetItems.length < MAX_RECLAIM_ITEMS) packetItems.push({ id, riskToken: risk, bytes });
  }

  return { safeBytes, reviewBytes, itemCount: items.length, items: packetItems, present: items.length > 0 };
}

function lastReclaimedBytes(events) {
  const list = Array.isArray(events?.events) ? events.events : [];
  const dated = list
    .map((event) => ({ at: Date.parse(event?.occurredAt ?? ""), bytes: byteValue(event?.reclaimedBytes) }))
    .filter((entry) => entry.bytes !== null)
    .sort((left, right) => (Number.isFinite(right.at) ? right.at : 0) - (Number.isFinite(left.at) ? left.at : 0));
  return dated.length > 0 ? dated[0].bytes : null;
}

/**
 * Read the local dashboard data and reduce it to the evidence packet.
 * Every source file is optional; a file that is missing, unreadable, or
 * malformed simply removes its own evidence ids.
 *
 * @param {string} [dataDir] directory holding the dashboard json files
 * @param {{now?: Date}} [options] injectable clock, so lesson day is testable
 */
export async function buildEvidencePacket(dataDir = "public/data", options = {}) {
  const now = options.now instanceof Date && Number.isFinite(options.now.getTime()) ? options.now : new Date();

  const [latest, history, workflow, events, lessons] = await Promise.all([
    readJson(dataDir, "latest.json"),
    readJson(dataDir, "history.json"),
    readJson(dataDir, "workflow-insights.json"),
    readJson(dataDir, "events.json"),
    readJson(dataDir, "lessons.json"),
  ]);

  const reclaim = reclaimTotals(latest);
  const lesson = lessonPosition(lessons, now);

  const candidates = {
    "disk.capacityBytes": { value: byteValue(latest?.disk?.capacityBytes), unit: "bytes" },
    "disk.usedBytes": { value: byteValue(latest?.disk?.usedBytes), unit: "bytes" },
    "disk.availableBytes": { value: byteValue(latest?.disk?.availableBytes), unit: "bytes" },
    "disk.usedPercent": { value: percentValue(latest?.disk?.usedPercent), unit: "percent" },
    "history.readingCount": {
      value: Array.isArray(history?.snapshots) ? history.snapshots.length : null,
      unit: "count",
    },
    "reclaim.safeBytes": { value: reclaim.present ? reclaim.safeBytes : null, unit: "bytes" },
    "reclaim.reviewBytes": { value: reclaim.present ? reclaim.reviewBytes : null, unit: "bytes" },
    "reclaim.itemCount": { value: reclaim.present ? reclaim.itemCount : null, unit: "count" },
    "coverage.percent": { value: percentValue(latest?.coverage?.coveragePercent), unit: "percent" },
    "workflow.taskCount": { value: countValue(workflow?.period?.taskCount), unit: "count" },
    "workflow.periodDays": { value: countValue(workflow?.period?.days), unit: "days" },
    "events.lastReclaimedBytes": { value: lastReclaimedBytes(events), unit: "bytes" },
    "lessons.total": { value: lesson.total, unit: "count" },
    "lessons.currentDay": { value: lesson.currentDay, unit: "count" },
  };

  const evidence = {};
  for (const id of EVIDENCE_ORDER) {
    const candidate = candidates[id];
    if (candidate.value === null) continue;
    evidence[id] = { value: candidate.value, unit: candidate.unit, kind: "measured" };
  }

  return {
    generatedAt: now.toISOString(),
    evidence,
    evidenceIds: EVIDENCE_ORDER.filter((id) => Object.hasOwn(evidence, id)),
    reclaimItems: reclaim.items,
  };
}
