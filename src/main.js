const GIB = 1024 ** 3;

const DATA_FILES = {
  latest: "/data/latest.json",
  history: "/data/history.json",
  workflow: "/data/workflow-insights.json",
  events: "/data/events.json",
  lessons: "/data/lessons.json",
};

const FALLBACK_DATA = {
  latest: {
    generatedAt: "2026-08-29T08:54:00+02:00",
    disk: {
      capacityBytes: 494 * GIB,
      usedBytes: 435 * GIB,
      availableBytes: 59 * GIB,
      usedPercent: 88.1,
    },
    summary: {
      headline: "Your Mac has room to breathe again.",
      body: "The recent cleanup removed the rebuildable layer without touching source code, personal files, downloads, or task history. The useful question now is what quietly grows back.",
    },
    categories: [
      { id: "projects", label: "Projects", bytes: 114 * GIB, deltaBytes: -29 * GIB, kind: "personal" },
      { id: "system", label: "macOS & system data", bytes: 91 * GIB, deltaBytes: 0.2 * GIB, kind: "protected" },
      { id: "media", label: "Documents & media", bytes: 72 * GIB, deltaBytes: 0, kind: "personal" },
      { id: "applications", label: "Applications", bytes: 64 * GIB, deltaBytes: 0.3 * GIB, kind: "system" },
      { id: "generated", label: "Generated developer data", bytes: 38 * GIB, deltaBytes: -21 * GIB, kind: "generated" },
      { id: "other", label: "Other observed data", bytes: 56 * GIB, deltaBytes: 0.1 * GIB, kind: "unknown" },
    ],
    projects: [
      { name: "heifer-mobile-app", bytes: 16.4 * GIB, generatedBytes: 7.1 * GIB, hasGit: true },
      { name: "futurisma-race", bytes: 5.8 * GIB, generatedBytes: 2.4 * GIB, hasGit: true },
      { name: "Unity prototypes", bytes: 4.1 * GIB, generatedBytes: 3.3 * GIB, hasGit: false },
    ],
    reclaimable: [
      {
        id: "app-caches",
        label: "Application caches that have returned",
        bytes: 2.1 * GIB,
        risk: "low",
        rebuildCost: "Usually a few slower launches",
        evidence: "Measured in cache-only folders used by browsers and creative apps.",
        scope: "~/Library/Caches — selected app-owned folders only",
        reversibility: "Apps recreate this data; no personal documents are included.",
      },
      {
        id: "project-builds",
        label: "Generated project build outputs",
        bytes: 1.4 * GIB,
        risk: "low",
        rebuildCost: "The next build will take longer",
        evidence: "Build directories were identified inside active source projects.",
        scope: "Project build, dist, and derived-output folders; source is excluded",
        reversibility: "Fully rebuildable from the project source and dependencies.",
      },
      {
        id: "downloads-review",
        label: "Large downloads worth reviewing",
        bytes: 7.3 * GIB,
        risk: "review",
        rebuildCost: "Varies; some files may not be replaceable",
        evidence: "Large videos, books, and archives are present, but intent cannot be inferred.",
        scope: "~/Downloads — review list only; Steward will not select files",
        reversibility: "Move to Trash first. Personal files are never cleared automatically.",
      },
    ],
    coverage: {
      scannedBytes: 472 * GIB,
      unknownBytes: 22 * GIB,
      roots: ["Macintosh HD — Data", "~/Desktop", "~/Documents", "~/Downloads", "~/Library"],
      exclusions: ["File contents", "Protected macOS folders", "Cloud-only files", "Secrets and credentials"],
    },
    trend: {
      state: "watching",
      message: "There is enough headroom now. Steward is watching which rebuildable category returns first.",
      nextMilestone: "A 5 GB change in any category",
    },
  },
  history: {
    snapshots: [
      { generatedAt: "2026-08-23T09:00:00+02:00", availableBytes: 11.2 * GIB, usedBytes: 482.8 * GIB },
      { generatedAt: "2026-08-24T09:00:00+02:00", availableBytes: 10.1 * GIB, usedBytes: 483.9 * GIB },
      { generatedAt: "2026-08-25T09:00:00+02:00", availableBytes: 9.4 * GIB, usedBytes: 484.6 * GIB },
      { generatedAt: "2026-08-26T09:00:00+02:00", availableBytes: 8.8 * GIB, usedBytes: 485.2 * GIB },
      { generatedAt: "2026-08-29T08:54:00+02:00", availableBytes: 59 * GIB, usedBytes: 435 * GIB },
    ],
  },
  workflow: {
    period: { days: 30, taskCount: 31 },
    patterns: [
      { label: "Interface polish & visual QA", count: 9, share: 0.29, description: "Repeated passes over hierarchy, responsive behavior, and final visual checks." },
      { label: "Research and decision briefs", count: 7, share: 0.23, description: "Gathering evidence, comparing options, and turning it into a concise recommendation." },
      { label: "Workspace health checks", count: 4, share: 0.13, description: "Inspecting storage or project state before deciding what is safe to change." },
    ],
    opportunities: [
      {
        title: "Daily storage story",
        summary: "Compare each morning scan with the previous one and name the folders behind meaningful growth.",
        evidence: "Storage inspection and cleanup has recurred across 4 recent tasks.",
        confidence: "high",
        timeSaved: "10–15 min/week",
        state: "ready",
      },
      {
        title: "Pre-handoff interface check",
        summary: "Run a compact responsive and accessibility pass after substantial frontend changes.",
        evidence: "Visual polish and QA appeared in 29% of recent tasks.",
        confidence: "medium",
        timeSaved: "20–30 min/week",
        state: "idea",
      },
      {
        title: "Research brief template",
        summary: "Reuse the same evidence, tradeoff, recommendation, and next-action structure for recurring research.",
        evidence: "Seven recent tasks followed a similar research-to-decision shape.",
        confidence: "medium",
        timeSaved: "15 min/week",
        state: "idea",
      },
    ],
  },
  events: {
    events: [
      {
        occurredAt: "2026-08-29T14:32:00+02:00",
        type: "cleanup",
        title: "A careful reset",
        summary: "Rebuildable caches, derived data, Android outputs, Unity libraries, and older duplicate Xcode support were removed.",
        reclaimedBytes: 50.2 * GIB,
        details: "Source code, personal files, downloads, current device support, and agent history were preserved.",
      },
      {
        occurredAt: "2026-08-29T08:54:00+02:00",
        type: "observation",
        title: "Storage pressure confirmed",
        summary: "The data volume was 98% full, with less than 9 GB available.",
        reclaimedBytes: 0,
        details: "The largest safe opportunities were developer caches and generated build outputs.",
      },
    ],
  },
  lessons: {
    schemaVersion: 1,
    startsOn: "2026-08-29",
    cadence: "daily",
    lessons: [
      {
        id: "ram-and-storage",
        dayOffset: 0,
        title: "RAM is your desk. Storage is your cabinet.",
        deck: "Two kinds of space, two very different jobs.",
        readMinutes: 4,
        summary: "RAM holds what your Mac is actively working with; storage keeps things after the work is done. A crowded desk can slow you down even when the filing cabinet still has room.",
        concepts: [
          {
            term: "RAM",
            analogy: "Your desk",
            definition: "Fast, temporary memory used by apps and the system while they are running.",
            example: "Open browser tabs, a design canvas, and a video timeline all need room in RAM.",
          },
          {
            term: "Storage",
            analogy: "Your filing cabinet",
            definition: "Long-term space on the SSD where apps and files remain after a restart.",
            example: "A project stays on the SSD after you close its app.",
          },
          {
            term: "Working set",
            analogy: "Everything spread across the desk",
            definition: "The parts of open apps and files the Mac needs to reach quickly right now.",
            example: "Editing video usually creates a larger working set than reading one webpage.",
          },
        ],
        misconception: "Adding storage does not add RAM. Free SSD space can help swap, but they remain separate resources.",
        takeaway: "RAM is space for now; storage is space for later. Check which one is under pressure before deciding what to close or clean.",
        interaction: {
          kind: "workbench-simulation",
          title: "Set your workbench",
          prompt: "Choose a workload and watch the active desk fill up.",
          unit: "working-set points",
          presets: [
            { id: "browser", label: "Browser", value: 4 },
            { id: "design", label: "Design", value: 7 },
            { id: "video", label: "Video", value: 11 },
          ],
        },
      },
    ],
  },
};

const CATEGORY_COLORS = [
  "oklch(0.86 0.20 130)",
  "oklch(0.74 0.16 340)",
  "oklch(0.80 0.14 205)",
  "oklch(0.82 0.15 78)",
  "oklch(0.72 0.13 250)",
  "oklch(0.72 0.17 25)",
  "oklch(0.84 0.12 165)",
  "oklch(0.72 0.15 300)",
  "oklch(0.78 0.06 80)",
];

document.documentElement.classList.add("has-js");

/* Day shift is applied before the first paint. The stylesheet defaults to night,
   so only the stored "day" needs to be stamped on the root here. */
const THEME_KEY = "steward.theme";
try {
  if (localStorage.getItem(THEME_KEY) === "day") document.documentElement.setAttribute("data-theme", "day");
} catch {
  /* per-viewer convenience only */
}

const app = document.querySelector("#app");
const freshness = document.querySelector("#data-freshness");
const refreshButton = document.querySelector("#refresh-button");
const liveRegion = document.querySelector("#live-region");
const prefersReducedMotion = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
let activeRequest = null;
let navObserver = null;
let revealObserver = null;
let countObserver = null;
let bootPlayed = false;
/* captured once per load, before the deck renders: the briefing stagger is a
   markup decision (a class on CH01) and must not race the reveal observer */
let stewardBriefingActive = false;
let selectedLessonId = null;
let activeLessonsData = FALLBACK_DATA.lessons;

function motionReduced() {
  return Boolean(prefersReducedMotion?.matches);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function numberOr(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function arrayOr(value) {
  return Array.isArray(value) ? value : [];
}

function formatBytes(value, options = {}) {
  const bytes = numberOr(value);
  const absolute = Math.abs(bytes);
  const units = ["B", "KB", "MB", "GB", "TB"];
  let unitIndex = 0;
  let amount = absolute;

  while (amount >= 1024 && unitIndex < units.length - 1) {
    amount /= 1024;
    unitIndex += 1;
  }

  const digits = amount >= 100 || unitIndex === 0 ? 0 : amount >= 10 ? 1 : 1;
  const formatted = new Intl.NumberFormat("en", { maximumFractionDigits: digits }).format(amount);
  const sign = options.signed && bytes !== 0 ? (bytes > 0 ? "+" : "−") : "";
  return `${sign}${formatted} ${units[unitIndex]}`;
}

function safeDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function formatDate(value, style = "long") {
  const date = safeDate(value);
  if (!date) return "Date unavailable";
  const options = style === "short"
    ? { day: "numeric", month: "short" }
    : { weekday: "long", day: "numeric", month: "long" };
  return new Intl.DateTimeFormat("en-GB", options).format(date);
}

function formatClock(value) {
  const date = safeDate(value);
  if (!date) return "time unavailable";
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit" }).format(date);
}

function localDateKey(date = new Date(), timeZone = "Europe/Belgrade") {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

function dateKeyNumber(value) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value ?? ""));
  if (!match) return null;
  return Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
}

function titleCase(value) {
  const text = String(value ?? "").replaceAll("_", " ").replaceAll("-", " ");
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : "Unknown";
}

function kindLabel(kind) {
  const labels = {
    generated: "Rebuildable",
    personal: "Personal",
    protected: "Protected",
    system: "System",
    app: "App data",
    unknown: "Unclassified",
  };
  return labels[String(kind).toLowerCase()] || titleCase(kind);
}

function milestoneLabel(value) {
  if (Number.isFinite(Number(value))) {
    const count = Number(value);
    return `${count} daily reading${count === 1 ? "" : "s"}`;
  }
  return String(value || "A meaningful category change");
}

function safeToken(value, allowed, fallback) {
  const token = String(value ?? "").toLowerCase();
  return allowed.includes(token) ? token : fallback;
}

function diskState(latest) {
  const disk = latest?.disk || {};
  const capacity = Math.max(0, numberOr(disk.capacityBytes));
  const used = Math.max(0, numberOr(disk.usedBytes));
  const available = Math.max(0, numberOr(disk.availableBytes, Math.max(0, capacity - used)));
  const inferredPercent = capacity > 0 ? (used / capacity) * 100 : 0;
  const usedPercent = Math.min(100, Math.max(0, numberOr(disk.usedPercent, inferredPercent)));
  const availablePercent = capacity > 0 ? Math.min(100, (available / capacity) * 100) : Math.max(0, 100 - usedPercent);
  return { capacity, used, available, usedPercent, availablePercent };
}

function deriveSummary(latest, history) {
  const disk = diskState(latest);
  const snapshots = validSnapshots(history);
  const previous = snapshots.at(-2);
  const change = previous ? disk.used - previous.usedBytes : 0;
  const provided = latest?.summary || {};

  let headline = String(provided.headline || "").trim();
  let body = String(provided.body || "").trim();

  if (!headline) {
    if (disk.availablePercent < 3) headline = "Storage is too close to the edge.";
    else if (change < -5 * GIB) headline = "Your Mac has room to breathe again.";
    else if (change > 5 * GIB) headline = "Something meaningful grew since yesterday.";
    else headline = "The machine stayed mostly still.";
  }

  if (!body) {
    if (change < -GIB) body = `${formatBytes(Math.abs(change))} returned to the disk since the previous reading. Steward will now watch what grows back.`;
    else if (change > GIB) body = `${formatBytes(change)} was added since the previous reading. The change list below shows the strongest attribution available.`;
    else body = "No category moved enough to deserve your attention. The daily observation completed without changing any files.";
  }

  return { headline, body, change };
}

function validSnapshots(history) {
  return arrayOr(history?.snapshots)
    .map((snapshot) => ({
      generatedAt: snapshot?.generatedAt,
      availableBytes: Math.max(0, numberOr(snapshot?.availableBytes)),
      usedBytes: Math.max(0, numberOr(snapshot?.usedBytes)),
      date: safeDate(snapshot?.generatedAt),
    }))
    .filter((snapshot) => snapshot.date)
    .sort((a, b) => a.date - b.date);
}

/* ---------- Ground Control primitives ---------- */

/* One segmented-bar generator.
   · density law — never more than 48 cells; callers keep inline bars ≤120px at 8.
   · the fill is per-cell, not a whole-bar scaleX: each cell carries its index as
     --k and the bar publishes the per-cell step as --sd (18ms, capped so the
     whole bar lands inside 400ms), so the stagger is pure CSS.
   · two tones maximum: an optional `second` run is drawn INSIDE the lit run at
     the 0.30 level, which is how the project rack shows its rebuildable slice.
   · `markers` are the only place amber/coral may appear on a bar. */
const SEG_MAX_CELLS = 48;
const SEG_STAGGER_MS = 18;
const SEG_STAGGER_CAP_MS = 400;

function seg(percent, tone = "signal", cells = 24, options = {}) {
  const count = Math.max(1, Math.min(SEG_MAX_CELLS, Math.round(numberOr(cells, 24))));
  const clamped = Math.min(100, Math.max(0, numberOr(percent)));
  const filled = Math.round((clamped / 100) * count);
  const hasSecond = options.second !== undefined && options.second !== null;
  const secondPercent = Math.min(100, Math.max(0, numberOr(options.second)));
  /* the last lit cell keeps the 0.85 cap, so the second run stops one short of it */
  const secondCount = hasSecond
    ? Math.min(Math.max(0, filled - 1), Math.round((secondPercent / 100) * count))
    : 0;
  const step = Math.min(SEG_STAGGER_MS, SEG_STAGGER_CAP_MS / count);
  const spans = Array.from({ length: count }, (_, index) => {
    const classes = [];
    if (index < filled) classes.push("on");
    if (index < secondCount) classes.push("is-second");
    if (filled > 0 && index === filled - 1) classes.push("is-last");
    return `<span class="${classes.join(" ")}" style="--k:${index}"></span>`;
  }).join("");
  const bar = `<div class="seg seg-${tone}" style="--sd:${step.toFixed(2)}ms"${options.attrs ? ` ${options.attrs}` : ""} aria-hidden="true">${spans}</div>`;
  const markers = arrayOr(options.markers);
  if (markers.length === 0) return bar;
  return `
    <div class="seg-band" aria-hidden="true">
      ${bar}
      <span class="seg-marks">
        ${markers.map((marker) => `<span class="seg-mark seg-mark-${escapeHtml(marker?.tone || "rule")}" style="--at:${numberOr(marker?.at)}"><i></i><b>${escapeHtml(marker?.label ?? marker?.at)}</b></span>`).join("")}
      </span>
    </div>
  `;
}

function countSpan(value, format, extraClass = "") {
  const number = numberOr(value);
  const text = format === "percent" ? `${number.toFixed(1)}%` : formatBytes(number);
  return `<span class="mono-num ${extraClass}" data-count data-count-value="${number}" data-count-format="${format}">${text}</span>`;
}

function channelHeader(num, name, title, headingId, sub) {
  return `
    <header class="section-header channel-header">
      <div class="channel-id">
        <span class="ch-badge" aria-hidden="true">CH ${num}</span>
        <div>
          <p class="section-name">${escapeHtml(name)}</p>
          <h2 id="${headingId}">${escapeHtml(title)}</h2>
        </div>
      </div>
      <p class="channel-sub" aria-hidden="true">▸ ${escapeHtml(sub)}</p>
    </header>
  `;
}

/* ---------- the dial · one generator, three instruments ----------

   Two sweeps, one anatomy. The 240° arc "M 30.7 140 A 80 80 0 1 1 169.3 140" is
   a sweep of r=80 about (100, 100): start 210°, end −30° in standard math coords
   (y up), running clockwise on screen. Reproducing the SVG spec's
   endpoint→centre conversion for the same path agrees with this model to within
   0.04 user units at every sampled percentage — invisible under a 9-wide stroke.
   The 360° ring is the same idea as two half-arcs starting at 12 o'clock, so it
   needs no -90° wrapper rotation and its reticle maths are identical.
   Everything positional derives from the geometry table, so a reticle can never
   drift away from the stroke it is supposed to cap. */
const DIAL_GEO = {
  240: {
    viewBox: "0 8 200 144",
    d: "M 30.7 140 A 80 80 0 1 1 169.3 140",
    cx: 100, cy: 100, r: 80,
    startDeg: 210,
    sweepDeg: 240,
    /* kit law: the minimum readable arc is 8° on a 240° sweep, 12° on a ring */
    floorDeg: 8,
    reticleR: 4,
  },
  360: {
    viewBox: "0 0 120 120",
    d: "M 60 10 A 50 50 0 1 1 60 110 A 50 50 0 1 1 60 10",
    cx: 60, cy: 60, r: 50,
    startDeg: 90,
    sweepDeg: 360,
    floorDeg: 12,
    reticleR: 3,
  },
};

/* Point on the arc at `pct` along it (0 → the start foot, 100 → the end foot),
   in the SVG's own y-down user units. */
function dialPoint(geo, pct) {
  const theta = ((geo.startDeg - (pct / 100) * geo.sweepDeg) * Math.PI) / 180;
  return { x: geo.cx + geo.r * Math.cos(theta), y: geo.cy - geo.r * Math.sin(theta) };
}

/* The lit arc never changes hue or opacity with value — `hue` is a property of
   the instrument, not of the reading. Status lives on the chip beside it. */
function dial(options = {}) {
  const {
    sweep = 240,
    value = 0,
    hasData = true,
    hue = "signal",
    className = "",
    attrs = "",
    ticks = true,
    reticle = true,
    readout = "",
    unit = "",
  } = options;
  const geo = DIAL_GEO[sweep] || DIAL_GEO[240];
  const raw = Math.max(0, Math.min(100, numberOr(value)));
  const floor = (geo.floorDeg / geo.sweepDeg) * 100;
  /* any nonzero value draws at least the arc floor; a true zero draws nothing
     and parks the reticle at the start foot; no data draws no arc at all */
  const drawn = !hasData || raw <= 0 ? 0 : Math.max(raw, floor);
  const tip = dialPoint(geo, drawn);
  return `
    <div class="dial dial-${geo.sweepDeg} ${className}" data-hue="${hue}"${hasData ? "" : ' data-empty="true"'}${attrs ? ` ${attrs}` : ""}>
      <svg class="dial-svg" viewBox="${geo.viewBox}" aria-hidden="true">
        ${ticks ? `<path class="dial-ticks" d="${geo.d}" pathLength="100" />` : ""}
        <path class="dial-track" d="${geo.d}" pathLength="100" />
        ${drawn > 0 ? `<path class="dial-value" d="${geo.d}" pathLength="100" style="--dial-pct: ${drawn.toFixed(2)}" />` : ""}
        ${reticle && hasData ? `<circle class="dial-reticle" cx="${tip.x.toFixed(2)}" cy="${tip.y.toFixed(2)}" r="${geo.reticleR}" />` : ""}
      </svg>
      ${readout || unit ? `<div class="dial-readout">${readout}${unit ? `<span class="dial-unit">${unit}</span>` : ""}</div>` : ""}
    </div>
  `;
}

function arcGauge(disk, tone, hasData) {
  const pct = hasData ? Math.max(0, Math.min(100, disk.availablePercent)) : 0;
  return dial({
    sweep: 240,
    value: pct,
    hasData,
    hue: "signal",
    className: "gauge",
    attrs: `data-tone="${tone}" role="progressbar" aria-label="Available storage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct.toFixed(1)}"`,
    readout: hasData
      ? `<strong class="readout mono-num" data-count data-count-value="${disk.available}" data-count-format="bytes">${formatBytes(disk.available)}</strong>`
      : `<strong class="readout mono-num">--</strong>`,
    unit: hasData ? `free of ${formatBytes(disk.capacity)}` : "no reading",
  });
}

function clockDial(timeText) {
  const match = /^(\d{1,2}):(\d{2})/.exec(String(timeText || "09:00"));
  const hours = match ? Number(match[1]) : 9;
  const minutes = match ? Number(match[2]) : 0;
  const rad = (deg) => ((deg - 90) * Math.PI) / 180;
  const hourAngle = ((hours % 12) + minutes / 60) * 30;
  const minuteAngle = minutes * 6;
  const hx = 24 + 10 * Math.cos(rad(hourAngle));
  const hy = 24 + 10 * Math.sin(rad(hourAngle));
  const mx = 24 + 15 * Math.cos(rad(minuteAngle));
  const my = 24 + 15 * Math.sin(rad(minuteAngle));
  return `
    <svg class="clock-dial" viewBox="0 0 48 48" aria-hidden="true">
      <circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2" opacity="0.35" />
      <circle cx="24" cy="4.6" r="1.8" fill="currentColor" />
      <line x1="24" y1="24" x2="${hx.toFixed(1)}" y2="${hy.toFixed(1)}" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" />
      <line x1="24" y1="24" x2="${mx.toFixed(1)}" y2="${my.toFixed(1)}" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" />
    </svg>
  `;
}

function pictogram(index) {
  const art = [
    `<rect x="6" y="19" width="36" height="4" rx="1"/><line x1="11" y1="23" x2="11" y2="38"/><line x1="37" y1="23" x2="37" y2="38"/><rect x="14" y="12" width="11" height="7" rx="1"/><rect x="28" y="14" width="8" height="5" rx="1"/>`,
    `<rect x="13" y="7" width="22" height="34" rx="2"/><line x1="13" y1="18.5" x2="35" y2="18.5"/><line x1="13" y1="29.5" x2="35" y2="29.5"/><line x1="21" y1="13" x2="27" y2="13"/><line x1="21" y1="24" x2="27" y2="24"/><line x1="21" y1="35" x2="27" y2="35"/>`,
    `<rect x="7" y="9" width="10" height="8" rx="1"/><rect x="22" y="6" width="13" height="9" rx="1"/><rect x="11" y="23" width="13" height="10" rx="1"/><rect x="29" y="21" width="10" height="13" rx="1"/><rect x="7" y="38" width="15" height="5" rx="1"/>`,
  ];
  return `<svg class="pictogram" viewBox="0 0 48 48" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${art[index % art.length]}</svg>`;
}

const COMPLETED_KEY = "steward.completedLessons";

function readCompletedLessons() {
  try {
    const raw = JSON.parse(localStorage.getItem(COMPLETED_KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function saveCompletedLesson(id) {
  try {
    const list = readCompletedLessons();
    if (!list.includes(id)) {
      list.push(id);
      localStorage.setItem(COMPLETED_KEY, JSON.stringify(list));
    }
  } catch {
    /* per-viewer convenience only */
  }
}

/* ---------- Sections ---------- */

function dataNotice(sources) {
  const unavailable = Object.entries(sources)
    .filter(([, source]) => source.state !== "live")
    .map(([name]) => name);

  if (unavailable.length === 0) return "";

  return `
    <div class="data-notice" role="status">
      <svg aria-hidden="true" viewBox="0 0 20 20" width="18" height="18">
        <circle cx="10" cy="10" r="7.5" fill="none" stroke="currentColor" stroke-width="1.5" />
        <path d="M10 6.3v4.2M10 13.7h.01" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" />
      </svg>
      <p><strong>Preview data is filling a gap.</strong> ${escapeHtml(unavailable.join(", "))} ${unavailable.length === 1 ? "file is" : "files are"} not available yet. Nothing here has been acted on.</p>
    </div>
  `;
}

function renderToday(latest, history) {
  const disk = diskState(latest);
  const summary = deriveSummary(latest, history);
  const categories = arrayOr(latest?.categories);
  const changed = [...categories]
    .filter((category) => Math.abs(numberOr(category?.deltaBytes)) > 0)
    .sort((a, b) => Math.abs(numberOr(b?.deltaBytes)) - Math.abs(numberOr(a?.deltaBytes)))
    .slice(0, 4);
  const hasDisk = disk.capacity > 0;
  /* the band names the reading; the chip is the only thing that changes colour.
     coral is reserved for a genuinely unrecoverable state — 99.5% used, or a
     read that did not come back at all. The watch and edge bands are amber. */
  const band = !hasDisk ? "unknown" : disk.availablePercent >= 12 ? "comfortable" : disk.availablePercent >= 6 ? "watch" : "edge";
  const tone = !hasDisk || disk.usedPercent >= 99.5 ? "coral" : band === "comfortable" ? "signal" : "amber";
  const status = band === "comfortable"
    ? { glyph: "●", label: "Comfortable", note: "Nothing needs cleaning this morning. The useful signal is what grows back." }
    : band === "watch"
      ? { glyph: "▲", label: "Worth watching", note: "There is working room, but one large toolchain download could tighten it quickly." }
      : band === "edge"
        ? { glyph: "▼", label: "Close to the edge", note: "Start with high-confidence, reproducible data. Review every personal file separately." }
        : { glyph: "▼", label: "No reading", note: "The disk figures did not come back. Nothing has been inferred from the gap." };
  const movement = summary.change === 0
    ? { glyph: "■", text: "Steady", cls: "steady" }
    : summary.change > 0
      ? { glyph: "▲", text: formatBytes(summary.change), cls: "growth" }
      : { glyph: "▼", text: formatBytes(Math.abs(summary.change)), cls: "reduction" };

  return `
    <section class="page-section channel today-section" id="today"${stewardBriefingActive ? " data-briefing" : ""} data-observed-section aria-labelledby="today-heading">
      <p class="channel-tag" aria-hidden="true"><span class="ch-badge">CH 01</span> STATUS BOARD</p>

      <div class="bento today-bento">
        <article class="panel panel-notch gauge-panel" data-reveal style="--i:0">
          <p class="mono-label">▸ ROOM ON THE MAC</p>
          ${arcGauge(disk, tone, hasDisk)}
          ${seg(hasDisk ? disk.availablePercent : 0, "signal", 24)}
          <p class="status-chip chip chip-${tone}"><span aria-hidden="true">${status.glyph}</span> ${escapeHtml(status.label)}</p>
        </article>

        <article class="panel headline-panel" data-reveal style="--i:1">
          <p class="salutation mono-label">▸ GOOD MORNING</p>
          <h1 id="today-heading">${escapeHtml(summary.headline)}</h1>
          <div class="transcript well is-clamped" data-transcript>
            <p><span class="caret" aria-hidden="true">▸</span> ${escapeHtml(summary.body)}</p>
          </div>
          <button class="keycap note-expand" type="button" data-note-expand aria-expanded="false">MORE ▾</button>
        </article>

        <div class="stat-tiles">
          <article class="panel stat-tile" data-reveal style="--i:2">
            <p class="mono-label">Δ SINCE LAST</p>
            <strong class="tile-value mono-num ${movement.cls}"><span aria-hidden="true">${movement.glyph}</span> ${escapeHtml(movement.text)}</strong>
          </article>
          <article class="panel stat-tile" data-reveal style="--i:3">
            <p class="mono-label">DISK USED</p>
            <strong class="tile-value">${countSpan(disk.usedPercent, "percent")}</strong>
            ${seg(disk.usedPercent, "plasma", 8, {
              attrs: "data-band-bar",
              markers: [
                { at: 60, tone: "rule", label: "60" },
                { at: 80, tone: "amber", label: "80" },
                { at: 90, tone: "coral", label: "90" },
              ],
            })}
          </article>
          <article class="panel stat-tile" data-reveal style="--i:4">
            <p class="mono-label">OBSERVED</p>
            <strong class="tile-value mono-num">${escapeHtml(formatDate(latest?.generatedAt, "short"))} · ${escapeHtml(formatClock(latest?.generatedAt))}</strong>
          </article>
          <article class="panel stat-tile" data-reveal style="--i:5">
            <p class="mono-label">NEXT CHECK</p>
            <strong class="tile-value mono-num">Tomorrow 09:00</strong>
          </article>
        </div>

        <article class="panel movement-panel" data-reveal style="--i:6">
          <div class="subsection-heading">
            <h2>What moved</h2>
          </div>
          ${renderChangeList(changed)}
        </article>

        <article class="panel console-panel" data-reveal style="--i:7">
          <p class="mono-label">▸ STEWARD / CONSOLE</p>
          <div class="console-lines well">
            <p>▸ ${escapeHtml(latest?.trend?.message || status.note)}</p>
            <p>▸ ${escapeHtml(status.note)}<span class="cursor" aria-hidden="true"></span></p>
          </div>
          <div class="console-chips">
            <span class="chip">WATCHING · ${escapeHtml(milestoneLabel(latest?.trend?.nextMilestone))}</span>
            <span class="chip chip-signal">■ OBSERVE ONLY</span>
          </div>
        </article>
      </div>
    </section>
  `;
}

function renderChangeList(categories) {
  if (categories.length === 0) {
    return `
      <div class="empty-state scanner-state">
        <div class="scan-baseline" aria-hidden="true"><span class="scan-dot"></span></div>
        <p class="mono-label">BASELINE SET · AWAITING SECOND READING</p>
        <div class="reading-count">${seg(50, "signal", 2)}<span class="mono-label">1 / 2 READINGS</span></div>
      </div>
    `;
  }

  const maxDelta = Math.max(...categories.map((category) => Math.abs(numberOr(category?.deltaBytes))), 1);

  return `
    <ol class="change-list rack">
      ${categories.map((category, index) => {
        const delta = numberOr(category?.deltaBytes);
        const direction = delta > 0 ? "grew" : "shrank";
        const directionClass = delta > 0 ? "growth" : "reduction";
        const width = (Math.abs(delta) / maxDelta) * 100;
        return `
          <li style="--i:${index}">
            <span class="change-rank mono-num" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
            <span class="change-name">
              <strong>${escapeHtml(category?.label || "Unnamed category")}</strong>
              <span>${escapeHtml(kindLabel(category?.kind))}</span>
            </span>
            <span class="rack-track" aria-hidden="true"><span class="rack-bar ${directionClass}" style="--w:${width.toFixed(1)}"></span></span>
            <span class="change-value mono-num ${directionClass}"><span class="sr-only">${escapeHtml(direction)} </span>${delta > 0 ? "▲" : "▼"} ${formatBytes(Math.abs(delta))}</span>
          </li>
        `;
      }).join("")}
    </ol>
  `;
}

function renderStorage(latest, history) {
  const categories = arrayOr(latest?.categories)
    .filter((category) => numberOr(category?.bytes) > 0)
    .sort((a, b) => numberOr(b?.bytes) - numberOr(a?.bytes));
  const categoryTotal = categories.reduce((total, category) => total + numberOr(category?.bytes), 0);
  const projects = arrayOr(latest?.projects)
    .filter((project) => numberOr(project?.bytes) > 0)
    .sort((a, b) => numberOr(b?.bytes) - numberOr(a?.bytes));

  return `
    <section class="page-section channel" id="storage" data-observed-section aria-labelledby="storage-heading">
      ${channelHeader("02", "Disk", "The deck plan", "storage-heading", "COMPOSITION · CHANGE · RECLAIM")}

      <div class="storage-layout bento">
        <figure class="composition-figure panel" data-reveal style="--i:0">
          <figcaption>
            <span class="mono-label">▸ OBSERVED COMPOSITION</span>
            <strong class="mono-num">${formatBytes(categoryTotal)}</strong>
          </figcaption>
          ${renderCompositionBar(categories, categoryTotal)}
          ${renderCategoryLegend(categories, categoryTotal)}
        </figure>

        <div class="trend-panel panel" data-reveal style="--i:1">
          <div class="trend-heading">
            <div>
              <p class="mono-label">▸ FREE-SPACE TRACE</p>
              <h3>${escapeHtml(titleCase(latest?.trend?.state || "watching"))}</h3>
            </div>
            <span class="chip">${validSnapshots(history).length} READING${validSnapshots(history).length === 1 ? "" : "S"}</span>
          </div>
          ${renderHistoryChart(history)}
        </div>
      </div>

      ${projects.length ? `
        <div class="project-slice panel" data-reveal style="--i:2">
          <div class="subsection-heading subsection-heading-split">
            <div>
              <h3>Project footprint</h3>
            </div>
            <p class="mono-label">▸ REBUILDABLE SHOWN IN VIOLET</p>
          </div>
          <div class="project-table" role="table" aria-label="Largest project storage footprints">
            <div class="project-table-head" role="row">
              <span role="columnheader">Project</span>
              <span role="columnheader">Footprint</span>
              <span role="columnheader">Total</span>
              <span role="columnheader">Rebuildable</span>
              <span role="columnheader">Git</span>
            </div>
            ${(() => {
              const maxProject = Math.max(...projects.map((project) => numberOr(project?.bytes)), 1);
              return projects.slice(0, 6).map((project, index) => {
                const total = numberOr(project?.bytes);
                const generated = numberOr(project?.generatedBytes);
                const totalPct = (total / maxProject) * 100;
                const genPct = (generated / maxProject) * 100;
                return `
                  <div class="project-row" role="row" style="--i:${index}">
                    <strong role="cell" class="mono-num project-name">${escapeHtml(project?.name || "Unnamed project")}</strong>
                    <span role="cell" class="project-bar-cell" aria-hidden="true">
                      ${seg(totalPct, "signal", 24, { second: genPct })}
                    </span>
                    <span role="cell" class="mono-num">${formatBytes(total)}</span>
                    <span role="cell" class="mono-num">${formatBytes(generated)}</span>
                    <span role="cell" class="git-cell ${project?.hasGit ? "is-lit" : ""}"><span class="led" aria-hidden="true"></span>GIT<span class="sr-only">${project?.hasGit ? " detected" : " not detected"}</span></span>
                  </div>
                `;
              }).join("");
            })()}
          </div>
        </div>
      ` : ""}

      ${renderRecommendations(latest?.reclaimable)}
    </section>
  `;
}

function renderCompositionBar(categories, total) {
  if (categories.length === 0 || total <= 0) {
    return `<div class="empty-state"><p>Composition will appear after the first complete scan.</p></div>`;
  }

  const ariaLabel = categories
    .map((category) => `${category.label || "Unnamed"} ${Math.round((numberOr(category.bytes) / total) * 100)} percent`)
    .join(", ");

  return `
    <div class="composition-track" role="img" aria-label="Storage composition: ${escapeHtml(ariaLabel)}">
      ${categories.map((category, index) => {
        const percent = (numberOr(category?.bytes) / total) * 100;
        return `<span class="comp-seg" title="${escapeHtml(category?.label)} — ${formatBytes(category?.bytes)}" style="--segment-width: ${percent.toFixed(3)}%; --segment-color: ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}; --i:${index}"></span>`;
      }).join("")}
    </div>
  `;
}

function renderCategoryLegend(categories, total) {
  if (categories.length === 0) return "";

  return `
    <ul class="category-list" aria-label="Storage categories">
      ${categories.map((category, index) => {
        const delta = numberOr(category?.deltaBytes);
        const color = CATEGORY_COLORS[index % CATEGORY_COLORS.length];
        const percent = Math.round((numberOr(category?.bytes) / total) * 100);
        const kind = String(category?.kind || "unknown").toLowerCase();
        return `
          <li style="--i:${index}">
            <span class="category-swatch" aria-hidden="true" style="--swatch-color: ${color}"></span>
            <span class="category-main">
              <strong>${escapeHtml(category?.label || "Unnamed category")}</strong>
              <span class="kind-pill kind-${escapeHtml(kind)}">${escapeHtml(kindLabel(category?.kind))}</span>
            </span>
            <span class="category-size mono-num">${formatBytes(category?.bytes)} · ${percent}%</span>
            <span class="category-meter" style="--seg-color:${color}">${seg(percent, "custom", 12)}</span>
            ${delta !== 0 ? `<span class="category-delta mono-num ${delta > 0 ? "growth" : "reduction"}">${delta > 0 ? "▲" : "▼"} ${formatBytes(Math.abs(delta))}</span>` : ""}
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

/* ---------- the scope · free-space trace ----------
   One column per reading. The trace is built from divs rather than SVG so the
   scrub can move a crosshair and a chip with transforms alone, and so the
   column caps can carry the same 0.62 / 0.85 ramp as every seg bar on the deck.
   The whole block keeps role="img" with a summarising label — the two readings
   a scrub cannot reach (first and last) are the ones the label names. */
function renderHistoryChart(history) {
  const snapshots = validSnapshots(history);
  /* the scope unlocks at two readings; a single reading still has nothing to
     compare against, so the radar ping stays. */
  if (snapshots.length < 2) {
    return `
      <div class="empty-state radar-state compact">
        <span class="radar-ping" aria-hidden="true"><span></span><span></span></span>
        <p class="mono-label">${snapshots.length} READING · TREND UNLOCKS AT 2</p>
      </div>
    `;
  }

  const values = snapshots.map((snapshot) => snapshot.availableBytes);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = Math.max(rawMax - rawMin, GIB);
  const floor = Math.max(0, rawMin - spread * 0.12);
  const ceiling = rawMax + spread * 0.12;
  const height = (value) => {
    const normalized = (value - floor) / (ceiling - floor || 1);
    /* a reading is never invisible: the shortest column still reads as a column */
    return Math.max(6, Math.min(100, normalized * 100));
  };
  const first = snapshots[0];
  const last = snapshots.at(-1);
  const gap = snapshots.length > 60 ? 1 : 2;

  const columns = snapshots.map((snapshot, index) => {
    const previous = index > 0 ? snapshots[index - 1].availableBytes : null;
    const delta = previous === null ? null : snapshot.availableBytes - previous;
    const direction = delta === null ? "none" : delta > 0 ? "up" : delta < 0 ? "down" : "flat";
    const deltaText = delta === null
      ? "first reading"
      : delta === 0
        ? "no change"
        : `${delta > 0 ? "▲ +" : "▼ −"}${stewardGb(Math.abs(delta))} gb`;
    const readText = `${formatDate(snapshot.generatedAt, "short")} · ${stewardGb(snapshot.availableBytes)} gb`;
    return `<span class="scope-col${index === snapshots.length - 1 ? " is-now" : ""}" style="--h:${height(snapshot.availableBytes).toFixed(2)}" data-read="${escapeHtml(readText)}" data-delta="${escapeHtml(deltaText)}" data-dir="${direction}"><span class="scope-cap"></span></span>`;
  }).join("");

  /* the mobile stand-in: the same readings as a 30-column seg strip */
  const strip = snapshots.slice(-30)
    .map((snapshot) => `<span style="--h:${height(snapshot.availableBytes).toFixed(2)}"></span>`)
    .join("");

  const label = `Free-space trace across ${snapshots.length} readings: ${formatBytes(first.availableBytes)} available on ${formatDate(first.generatedAt, "short")}, ${formatBytes(last.availableBytes)} available on ${formatDate(last.generatedAt, "short")}.`;

  return `
    <div class="trace" role="img" aria-label="${escapeHtml(label)}">
      <div class="scope well" data-scope style="--gap:${gap}px">
        <span class="scope-sweep" aria-hidden="true"></span>
        <div class="scope-cols" data-scope-cols>
          ${columns}
          <span class="scope-now" style="--h:${height(last.availableBytes).toFixed(2)}" aria-hidden="true"></span>
          <span class="scope-cross" aria-hidden="true"></span>
          <span class="scope-chip mono-num" aria-hidden="true"><b data-scope-read></b><i data-scope-delta></i></span>
        </div>
      </div>
      <div class="trend-strip" aria-hidden="true">${strip}</div>
      <div class="chart-axis mono-num" aria-hidden="true">
        <span>${escapeHtml(formatDate(first.generatedAt, "short"))}</span>
        <strong>${formatBytes(last.availableBytes)} NOW</strong>
        <span>${escapeHtml(formatDate(last.generatedAt, "short"))}</span>
      </div>
    </div>
  `;
}


function renderRecommendations(items) {
  const recommendations = arrayOr(items)
    .filter((item) => numberOr(item?.bytes) > 0)
    .sort((a, b) => numberOr(b?.bytes) - numberOr(a?.bytes));

  return `
    <div class="recommendations" data-reveal style="--i:3">
      <div class="subsection-heading subsection-heading-split">
        <div>
          <h3>Reclaim bay</h3>
          <p>Every proposal opens into its evidence and exact boundary.</p>
        </div>
        <p class="mono-label">▸ NOTHING IS SELECTED AUTOMATICALLY</p>
      </div>
      ${recommendations.length ? `
        <div class="recommendation-list">
          ${recommendations.map((item, index) => {
            const risk = safeToken(item?.risk, ["safe", "rebuildable", "low", "medium", "high", "review"], "review");
            const riskGlyph = risk === "safe" || risk === "low" || risk === "rebuildable" ? "●" : "▲";
            const reclaimId = String(item?.id || `reclaim-${index}`);
            return `
              <details class="recommendation panel" data-reclaim-id="${escapeHtml(reclaimId)}" ${index === 0 ? "open" : ""}>
                <summary>
                  <span class="summary-main">
                    <strong>${escapeHtml(item?.label || "Cleanup opportunity")}</strong>
                    <span class="mono-num">${formatBytes(item?.bytes)} possible</span>
                  </span>
                  <span class="risk-badge risk-${risk}"><span aria-hidden="true">${riskGlyph}</span> ${escapeHtml(risk === "review" ? "Needs review" : `${titleCase(risk)} risk`)}</span>
                </summary>
                <div class="recommendation-body">
                  <dl class="evidence-list spec-grid">
                    <div>
                      <dt>Evidence</dt>
                      <dd>${escapeHtml(item?.evidence || "No supporting evidence was recorded.")}</dd>
                    </div>
                    <div>
                      <dt>Expected effect</dt>
                      <dd>Recover up to ${formatBytes(item?.bytes)}. ${escapeHtml(item?.rebuildCost || "Rebuild cost is not yet known.")}</dd>
                    </div>
                    <div>
                      <dt>Risk</dt>
                      <dd>${escapeHtml(risk === "safe" || risk === "low" ? "Low — reproducible data with a known owner." : risk === "rebuildable" ? "Rebuildable — safe to reproduce, but the next build may take time." : risk === "medium" ? "Medium — verify the owning app or project first." : risk === "high" ? "High — do not proceed without a file-level review." : "Intent is unclear, so Steward is asking you to review it.")}</dd>
                    </div>
                    <div>
                      <dt>Reversibility</dt>
                      <dd>${escapeHtml(item?.reversibility || "Reversibility was not recorded.")}</dd>
                    </div>
                    <div class="spec-wide">
                      <dt>Exact scope</dt>
                      <dd><code>${escapeHtml(item?.scope || "Scope unavailable")}</code></dd>
                    </div>
                  </dl>
                  <button class="switch-control" type="button" aria-pressed="false" data-review-action data-reclaim-id="${escapeHtml(reclaimId)}" data-review-risk="${risk}" data-reclaim-label="${escapeHtml(item?.label || "Cleanup opportunity")}">
                    <span class="switch" aria-hidden="true"><span class="switch-knob"></span></span>
                    <span data-label>Add to review</span>
                  </button>
                </div>
              </details>
            `;
          }).join("")}
        </div>
      ` : `<div class="empty-state"><p><strong>No cleanup proposal today.</strong> Nothing clears the evidence threshold.</p></div>`}
    </div>
  `;
}

function lessonSchedule(lessonsData) {
  const lessons = arrayOr(lessonsData?.lessons)
    .filter((lesson) => lesson && typeof lesson === "object")
    .sort((left, right) => numberOr(left?.dayOffset) - numberOr(right?.dayOffset));

  if (lessons.length === 0) {
    return { lessons: [], available: [], current: null };
  }

  const startNumber = dateKeyNumber(lessonsData?.startsOn);
  const todayNumber = dateKeyNumber(localDateKey(new Date(), "Europe/Belgrade"));
  const elapsedDays = startNumber === null || todayNumber === null
    ? 0
    : Math.max(0, Math.floor((todayNumber - startNumber) / 86_400_000));
  const currentOffset = Math.min(
    numberOr(lessons.at(-1)?.dayOffset),
    elapsedDays,
  );
  const available = lessons.filter((lesson) => numberOr(lesson?.dayOffset) <= currentOffset);
  const current = available.at(-1) || lessons[0];

  return { lessons, available, current };
}

function renderMemoryLab(lesson) {
  const interaction = lesson?.interaction || {};
  const presets = arrayOr(interaction?.presets);
  const initialValue = Math.min(12, Math.max(1, numberOr(presets[0]?.value, 4)));
  const ramSlots = Array.from({ length: 8 }, (_, index) => (
    `<span data-ram-slot="${index}" style="--n:${index}" aria-hidden="true"></span>`
  )).join("");
  const swapSlots = Array.from({ length: 4 }, (_, index) => (
    `<span data-swap-slot="${index}" style="--n:${index}" aria-hidden="true"></span>`
  )).join("");

  return `
    <figure class="memory-lab panel-notch" data-memory-lab data-pressure="light">
      <figcaption>
        <div>
          <p class="mono-label">▸ TRY IT · SIMPLIFIED MODEL</p>
          <h3 id="memory-lab-heading">${escapeHtml(interaction?.title || "Set your workbench")}</h3>
        </div>
        <span class="chip">EXAMPLE · NOT LIVE</span>
      </figcaption>

      <p class="lab-prompt">${escapeHtml(interaction?.prompt || "Change the workload and watch where active work goes.")}</p>

      <div class="workload-presets" role="group" aria-label="Example workloads">
        ${presets.map((preset, index) => `
          <button
            class="workload-preset keycap"
            type="button"
            data-memory-preset="${Math.min(12, Math.max(1, numberOr(preset?.value)))}"
            aria-pressed="${index === 0 ? "true" : "false"}"
          >${escapeHtml(preset?.label || "Workload")}</button>
        `).join("")}
      </div>

      <label class="workload-control">
        <span>
          <strong>Workload</strong>
          <output class="mono-num" data-workload-output>${initialValue} ${escapeHtml(interaction?.unit || "points")}</output>
        </span>
        <input
          type="range"
          min="1"
          max="12"
          step="1"
          value="${initialValue}"
          data-memory-range
          aria-label="Illustrative workload intensity"
        />
      </label>

      <div class="memory-model">
        <section class="resource-zone ram-zone" aria-labelledby="ram-zone-title">
          <header>
            <div>
              <p class="mono-label">THE WORKBENCH</p>
              <h4 id="ram-zone-title">RAM</h4>
            </div>
            <strong class="mono-num" data-ram-count>4 / 8</strong>
          </header>
          <div class="resource-slots ram-slots" aria-hidden="true">${ramSlots}</div>
          <p>Fast, temporary room for what is active now.</p>
        </section>

        <div class="memory-handoff" aria-hidden="true">
          <span class="conduit"><span class="conduit-pulse"></span></span>
          <p class="mono-label">OVERFLOW</p>
        </div>

        <section class="resource-zone storage-zone" aria-labelledby="storage-zone-title">
          <header>
            <div>
              <p class="mono-label">THE CABINET</p>
              <h4 id="storage-zone-title">SSD storage</h4>
            </div>
            <strong class="mono-label">PERSISTENT</strong>
          </header>
          <div class="storage-shelves" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="swap-tray">
            <div>
              <span class="mono-label">SWAP TRAY</span>
              <strong class="mono-num" data-swap-count>0 / 4</strong>
            </div>
            <div class="resource-slots swap-slots" aria-hidden="true">${swapSlots}</div>
          </div>
          <p>Files remain here; swap temporarily borrows a small part.</p>
        </section>
      </div>

      <div class="memory-reading well" data-memory-reading>
        <strong>Light memory pressure.</strong>
        <span>The active work fits comfortably on the RAM workbench.</span>
      </div>
    </figure>
  `;
}

function renderConceptExplorer(lesson) {
  const concepts = arrayOr(lesson?.concepts);
  return `
    <figure class="concept-explorer panel" data-concept-explorer>
      <figcaption>
        <p class="mono-label">▸ FROM FAMILIAR IDEA TO EXACT TERM</p>
        <h3>Move between the layers</h3>
      </figcaption>
      <div class="concept-tabs" role="tablist" aria-label="Lesson concepts">
        ${concepts.map((concept, index) => `
          <button
            type="button"
            role="tab"
            id="concept-tab-${index}"
            aria-controls="concept-panel-${index}"
            aria-selected="${index === 0 ? "true" : "false"}"
            tabindex="${index === 0 ? "0" : "-1"}"
            data-concept-tab="${index}"
          >${escapeHtml(concept?.term || "Concept")}</button>
        `).join("")}
      </div>
      ${concepts.map((concept, index) => `
        <div
          class="concept-panel"
          role="tabpanel"
          id="concept-panel-${index}"
          aria-labelledby="concept-tab-${index}"
          ${index === 0 ? "" : "hidden"}
          data-concept-panel="${index}"
        >
          <p class="concept-analogy">Like ${escapeHtml(concept?.analogy || "a familiar tool")}</p>
          <p>${escapeHtml(concept?.definition || "Definition unavailable.")}</p>
          <p class="concept-example"><strong>Example</strong> ${escapeHtml(concept?.example || "Example unavailable.")}</p>
        </div>
      `).join("")}
    </figure>
  `;
}

function renderFlipDeck(concepts) {
  return `
    <div class="flip-deck">
      ${concepts.map((concept, index) => `
        <button class="flip-card" type="button" data-flip-card aria-expanded="false">
          <span class="flip-inner">
            <span class="flip-face flip-front">
              ${pictogram(index)}
              <strong>${escapeHtml(concept?.analogy || "Familiar idea")}</strong>
              <span class="flip-hint mono-label">FLIP ⟳</span>
            </span>
            <span class="flip-face flip-back" aria-hidden="true">
              <strong class="mono-num">${escapeHtml(concept?.term || "Term")}</strong>
              <span>${escapeHtml(concept?.definition || "Definition unavailable.")}</span>
              <em>${escapeHtml(concept?.example || "")}</em>
            </span>
          </span>
        </button>
      `).join("")}
    </div>
  `;
}

function renderTranslationStrip(concepts) {
  return `
    <div class="translation-strip">
      ${concepts.map((concept) => `
        <div class="translation-row">
          <span>${escapeHtml(concept?.analogy || "Familiar idea")}</span>
          <span class="arrow" aria-hidden="true">⟶</span>
          <strong class="mono-num">${escapeHtml(concept?.term || "Term")}</strong>
        </div>
      `).join("")}
    </div>
  `;
}

function renderLessonVisual(lesson) {
  return lesson?.interaction?.kind === "workbench-simulation"
    ? renderMemoryLab(lesson)
    : renderConceptExplorer(lesson);
}

function renderCourseRows(lessons, allLessons, currentLesson, selectedLesson, currentOffset) {
  const completed = readCompletedLessons();
  return lessons.map((lesson) => {
    const offset = numberOr(lesson?.dayOffset);
    const lessonNumber = allLessons.findIndex((item) => item.id === lesson.id) + 1;
    const isAvailable = offset <= currentOffset;
    const isCurrent = lesson.id === currentLesson.id;
    const isSelected = lesson.id === selectedLesson.id;
    const isLogged = completed.includes(lesson.id);
    const wait = offset - currentOffset;
    const timing = isCurrent ? "Today" : isAvailable ? "Archive" : wait === 1 ? "Tomorrow" : `In ${wait} days`;
    const label = `Lesson ${lessonNumber}: ${lesson?.title || "Untitled"}`;
    const node = isLogged ? "✓" : String(lessonNumber).padStart(2, "0");
    return `
      <li data-course-state="${isCurrent ? "current" : isAvailable ? "available" : "future"}" ${isLogged ? 'data-logged="true"' : ""}>
        ${isAvailable ? `
          <button type="button" data-lesson-choice="${escapeHtml(lesson.id)}" data-lesson-number="${lessonNumber}" aria-pressed="${isSelected}">
            <span class="ladder-node mono-num" aria-hidden="true">${node}</span>
            <span class="ladder-copy">
              <span>${escapeHtml(label)}</span>
              <small class="mono-label">${timing} · ${numberOr(lesson?.readMinutes, 4)} MIN</small>
            </span>
          </button>
        ` : `
          <span class="ladder-locked">
            <span class="ladder-node mono-num" aria-hidden="true">▪</span>
            <span class="ladder-copy">
              <span>${escapeHtml(label)}</span>
              <small class="mono-label">${timing} · ${numberOr(lesson?.readMinutes, 4)} MIN</small>
            </span>
          </span>
        `}
      </li>
    `;
  }).join("");
}

function renderLearn(lessonsData) {
  const schedule = lessonSchedule(lessonsData);
  if (!schedule.current) {
    return `
      <section class="page-section channel" id="learn" data-observed-section aria-labelledby="learn-heading">
        ${channelHeader("03", "Academy", "The first lesson is being prepared", "learn-heading", "STANDBY")}
      </section>
    `;
  }

  const selected = schedule.available.find((lesson) => lesson.id === selectedLessonId) || schedule.current;
  selectedLessonId = selected.id;
  const selectedIndex = schedule.lessons.findIndex((lesson) => lesson.id === selected.id);
  const currentOffset = numberOr(schedule.current?.dayOffset);
  const viewingToday = selected.id === schedule.current.id;
  const extendedArchive = schedule.lessons.length > 7;
  const courseLessons = extendedArchive ? schedule.lessons.slice(-10) : schedule.lessons;
  const earlierLessons = extendedArchive ? schedule.lessons.slice(0, -10) : [];
  const hasInteraction = Boolean(selected?.interaction);
  const concepts = arrayOr(selected?.concepts);
  const patchProgress = ((selectedIndex + 1) / Math.max(1, schedule.lessons.length)) * 100;

  return `
    <section class="page-section channel learn-section" id="learn" data-observed-section aria-labelledby="learn-heading">
      ${channelHeader("03", "Academy", "One useful idea each morning", "learn-heading", "ANALOGY FIRST · EXACT TERM SECOND")}

      <article class="daily-lesson panel" aria-labelledby="lesson-title" data-reveal style="--i:0">
        <div class="lesson-editorial">
          <div class="lesson-masthead">
            ${dial({
              sweep: 360,
              value: patchProgress,
              hue: "violet",
              className: "mission-patch",
              ticks: false,
              reticle: false,
              attrs: 'aria-hidden="true"',
              readout: `<strong class="mono-num">${String(selectedIndex + 1).padStart(2, "0")}</strong>`,
            })}
            <div class="lesson-meta">
              <span class="chip ${viewingToday ? "chip-signal" : ""}">${viewingToday ? "TODAY'S LESSON" : "FROM THE ARCHIVE"}</span>
              <span class="chip">DAY ${selectedIndex + 1} / ${schedule.lessons.length}</span>
              <span class="chip">${numberOr(selected?.readMinutes, 4)} MIN</span>
            </div>
          </div>
          <p class="lesson-deck">${escapeHtml(selected?.deck || "A compact explanation for the curious.")}</p>
          <h3 id="lesson-title" tabindex="-1">${escapeHtml(selected?.title || "Untitled lesson")}</h3>
          <p class="lesson-summary">${escapeHtml(selected?.summary || "This lesson is not available yet.")}</p>

          ${hasInteraction ? renderFlipDeck(concepts) : renderTranslationStrip(concepts)}

          <aside class="misconception-note">
            <span class="mono-label myth-label">▲ EASY MIX-UP</span>
            <p>${escapeHtml(selected?.misconception || "No common misconception recorded.")}</p>
          </aside>

          <div class="lesson-takeaway panel-notch">
            <span class="mono-label">▸ KEEP THIS</span>
            <p>${escapeHtml(selected?.takeaway || "Notice the signal before choosing an action.")}</p>
            <button class="keycap log-button" type="button" data-lesson-complete="${escapeHtml(selected.id)}" aria-pressed="false"><span data-label>LOG IT ✓</span></button>
            <span class="burst-stage" aria-hidden="true"></span>
          </div>
        </div>

        <div class="lesson-visual-column">
          ${renderLessonVisual(selected)}
        </div>
      </article>

      <footer class="lesson-course" aria-labelledby="course-heading" data-reveal style="--i:1">
        <div class="course-heading-row">
          <p class="mono-label">▸ ${extendedArchive ? "LESSON ARCHIVE" : "SEVEN-DAY FOUNDATION"}</p>
          <h3 id="course-heading">${extendedArchive ? "Recent field notes" : "The machine, explained from the inside out"}</h3>
        </div>
        <ol class="lesson-ladder">
          ${renderCourseRows(courseLessons, schedule.lessons, schedule.current, selected, currentOffset)}
        </ol>
        ${earlierLessons.length ? `
          <details class="lesson-archive-more">
            <summary>Earlier lessons <span class="mono-num">${earlierLessons.length}</span></summary>
            <ol class="lesson-ladder">${renderCourseRows(earlierLessons, schedule.lessons, schedule.current, selected, currentOffset)}</ol>
          </details>
        ` : ""}
      </footer>
    </section>
  `;
}

function renderRoutines(workflow, automation) {
  const period = workflow?.period || {};
  const patterns = arrayOr(workflow?.patterns);
  const opportunities = arrayOr(workflow?.opportunities);
  const days = Math.max(1, numberOr(period.days, 30));
  const taskCount = Math.max(0, numberOr(period.taskCount));
  const automationStatus = safeToken(automation?.status, ["active", "paused"], "active");
  const automationActive = automationStatus === "active";
  const automationTime = automation?.localTime || "09:00";
  const automationZone = automation?.timeZone || "Europe/Belgrade";
  const automationModel = automation?.model || "Luna";
  const automationReasoning = automation?.reasoning || "extra-high";

  return `
    <section class="page-section channel" id="routines" data-observed-section aria-labelledby="routines-heading">
      ${channelHeader("04", "Autopilot", "What your work keeps asking for", "routines-heading", "TASK SHAPE ONLY · NEVER FILE CONTENTS")}

      <div class="automation-status panel-notch" data-reveal style="--i:0">
        <div class="automation-copy">
          <span class="automation-symbol" aria-hidden="true">${clockDial(automationTime)}</span>
          <div>
            <p class="mono-label">▸ THE QUIET PART</p>
            <h3>Daily observation at ${escapeHtml(automationTime)}</h3>
            <div class="spec-chips">
              <span class="chip">TZ ${escapeHtml(automationZone)}</span>
              <span class="chip">${escapeHtml(automationModel)} · ${escapeHtml(automationReasoning)}</span>
              <span class="chip">READ-ONLY</span>
              <span class="chip">NO DELETE</span>
            </div>
          </div>
        </div>
        <div class="automation-next" data-state="${automationStatus}">
          <span class="status-dot" aria-hidden="true"></span>
          <span>${automationActive ? "Active" : "Paused"}</span>
        </div>
      </div>

      <div class="routines-layout bento">
        <div class="pattern-column panel" data-reveal style="--i:1">
          <div class="subsection-heading">
            <h3>Signals from ${taskCount} tasks</h3>
            <p class="mono-label">▸ LAST ${days} DAYS</p>
          </div>
          ${patterns.length ? `
            <ul class="pattern-list">
              ${patterns.map((pattern, index) => {
                const share = Math.min(1, Math.max(0, numberOr(pattern?.share, taskCount ? numberOr(pattern?.count) / taskCount : 0)));
                return `
                  <li style="--i:${index}">
                    <div class="pattern-line">
                      <strong>${escapeHtml(pattern?.label || "Unnamed pattern")}</strong>
                      <span class="mono-num">${numberOr(pattern?.count)}× · ${Math.round(share * 100)}%</span>
                    </div>
                    ${seg(share * 100, "plasma", 24)}
                    <p>${escapeHtml(pattern?.description || "No description available.")}</p>
                  </li>
                `;
              }).join("")}
            </ul>
          ` : `<div class="empty-state"><p>More sessions are needed before a routine can be named responsibly.</p></div>`}
        </div>

        <div class="opportunity-column" data-reveal style="--i:2">
          <div class="subsection-heading">
            <h3>Worth automating next</h3>
            <p class="mono-label">▸ SMALL · REVERSIBLE · EVIDENCE-BACKED</p>
          </div>
          ${opportunities.length ? `
            <div class="opportunity-list">
              ${opportunities.map((opportunity, index) => {
                const confidence = safeToken(opportunity?.confidence, ["low", "medium", "high"], "low");
                const confidenceLevel = confidence === "high" ? 3 : confidence === "medium" ? 2 : 1;
                const state = safeToken(opportunity?.state, ["ready", "idea", "candidate", "paused", "active"], "idea");
                return `
                  <article class="opportunity panel" style="--i:${index}">
                    <div class="opportunity-heading">
                      <h4>${escapeHtml(opportunity?.title || "Automation opportunity")}</h4>
                      <span class="state-label state-${state}">${escapeHtml(titleCase(state))}</span>
                    </div>
                    <p class="time-back"><strong class="mono-num">${escapeHtml(opportunity?.timeSaved || "—")}</strong> <span class="mono-label">TIME BACK</span></p>
                    <p>${escapeHtml(opportunity?.summary || "No summary available.")}</p>
                    <p class="mono-line">▸ ${escapeHtml(opportunity?.evidence || "Not recorded")}</p>
                    <p class="confidence-row"><span class="confidence-leds" aria-hidden="true">${[1, 2, 3].map((n) => `<span class="${n <= confidenceLevel ? "on" : ""}"></span>`).join("")}</span><span class="mono-label">${escapeHtml(confidence.toUpperCase())} CONFIDENCE</span></p>
                    <button class="text-action radar-toggle" type="button" aria-pressed="false" data-opportunity-action><span class="radar-icon" aria-hidden="true">◉</span><span data-label>Keep on the radar</span></button>
                  </article>
                `;
              }).join("")}
            </div>
          ` : `<div class="empty-state"><p>No automation idea has enough evidence yet. That restraint is intentional.</p></div>`}
        </div>
      </div>
    </section>
  `;
}

function renderTimeline(eventsData) {
  const events = arrayOr(eventsData?.events)
    .filter((event) => safeDate(event?.occurredAt))
    .sort((a, b) => safeDate(b.occurredAt) - safeDate(a.occurredAt));
  const markerGlyphs = { cleanup: "▶", observation: "●", warning: "▲", automation: "⬢" };

  return `
    <section class="page-section channel" id="timeline" data-observed-section aria-labelledby="timeline-heading">
      ${channelHeader("05", "Recorder", "A record you can audit", "timeline-heading", "OBSERVATIONS AND APPROVED CLEANUPS · ONE TAPE")}

      ${events.length ? `
        <ol class="timeline-list">
          ${events.map((event, index) => {
            const type = safeToken(event?.type, ["cleanup", "observation", "warning", "automation"], "observation");
            const reclaimed = numberOr(event?.reclaimedBytes);
            const details = event?.details
              ? Array.isArray(event.details)
                ? `<ul class="timeline-details">${event.details.map((line) => `<li>▸ ${escapeHtml(line)}</li>`).join("")}</ul>`
                : `<p class="timeline-details">▸ ${escapeHtml(event.details)}</p>`
              : "";
            return `
              <li data-reveal style="--i:${index}">
                <div class="timeline-marker marker-${type}" aria-hidden="true">${markerGlyphs[type]}</div>
                <time class="mono-num" datetime="${escapeHtml(event?.occurredAt)}">
                  <span>${escapeHtml(formatDate(event?.occurredAt, "short"))}</span>
                  <span>${escapeHtml(formatClock(event?.occurredAt))}</span>
                </time>
                <div class="timeline-copy panel">
                  <div>
                    <h3>${escapeHtml(event?.title || "Untitled event")}</h3>
                    <span class="event-type chip">${escapeHtml(titleCase(type))}</span>
                  </div>
                  <p>${escapeHtml(event?.summary || "No summary recorded.")}</p>
                  ${details}
                </div>
                <div class="timeline-effect">
                  ${reclaimed > 0
                    ? `${countSpan(reclaimed, "bytes", "effect-value")}<span class="mono-label">+ RECLAIMED</span>`
                    : `<strong class="mono-num effect-value dim">■</strong><span class="mono-label">READ ONLY · 0 B</span>`}
                </div>
              </li>
            `;
          }).join("")}
        </ol>
      ` : `<div class="empty-state"><p>The tape begins after the first completed observation.</p></div>`}
    </section>
  `;
}

function renderTrust(latest) {
  const coverage = latest?.coverage || {};
  const scanned = Math.max(0, numberOr(coverage.scannedBytes));
  const unknown = Math.max(0, numberOr(coverage.unknownBytes));
  const total = scanned + unknown;
  const percent = total > 0 ? (scanned / total) * 100 : 0;
  const roots = arrayOr(coverage.roots);
  const exclusions = arrayOr(coverage.exclusions);

  return `
    <section class="page-section channel trust-section" id="trust" data-observed-section aria-labelledby="trust-heading">
      ${channelHeader("06", "Scope", "What Steward knows — and what it does not", "trust-heading", "COVERAGE IS A MEASUREMENT · NEVER CERTAINTY")}

      <div class="trust-layout bento">
        <div class="coverage-panel panel" data-reveal style="--i:0" role="group" aria-label="Coverage of addressable storage">
          ${dial({
            sweep: 240,
            value: percent,
            hasData: total > 0,
            hue: "plasma",
            className: "coverage-dial",
            attrs: 'aria-hidden="true"',
            readout: total > 0
              ? `<strong class="mono-num" data-count data-count-value="${percent.toFixed(1)}" data-count-format="percent">${percent.toFixed(1)}%</strong>`
              : `<strong class="mono-num">--</strong>`,
          })}
          <h3>of addressable storage scanned</h3>
          <dl class="coverage-figures">
            <div><dt class="mono-label">MEASURED</dt><dd class="mono-num">${formatBytes(scanned)}</dd>${seg(percent, "plasma", 12)}</div>
            <div><dt class="mono-label">NOT INSPECTED</dt><dd class="mono-num">${formatBytes(unknown)}</dd>${seg(100 - percent, "dim", 12)}</div>
          </dl>
        </div>

        <div class="scope-details panel" data-reveal style="--i:1">
          <div>
            <h3>In the observation</h3>
            ${roots.length ? `<ul class="scope-chips">${roots.map((root) => `<li class="scope-chip in-view"><code>${escapeHtml(root)}</code><span class="mono-label">✓ IN VIEW</span></li>`).join("")}</ul>` : `<p>Scan roots have not been reported yet.</p>`}
          </div>
          <div>
            <h3>Deliberately outside</h3>
            ${exclusions.length ? `<ul class="scope-chips">${exclusions.map((exclusion) => `<li class="scope-chip out-view"><span>${escapeHtml(exclusion)}</span><span class="mono-label">– OUT OF VIEW</span></li>`).join("")}</ul>` : `<p>No exclusions were reported.</p>`}
          </div>
        </div>
      </div>

      <div class="trust-contract" data-reveal style="--i:2">
        <div class="seal-card panel-notch">
          <strong class="mono-label">■ LOCAL BY DEFAULT</strong>
          <p>Scan history and workflow summaries stay on this Mac.</p>
        </div>
        <div class="seal-card panel-notch">
          <strong class="mono-label">■ METADATA, NOT MEANING</strong>
          <p>Routine detection uses task labels, timing, and repetition—not document contents.</p>
        </div>
        <div class="seal-card panel-notch">
          <strong class="mono-label">■ APPROVAL BEFORE ACTION</strong>
          <p>A scheduled observation cannot delete, move, or upload a file.</p>
        </div>
      </div>
    </section>
  `;
}

function renderApp(data, sources) {
  activeLessonsData = data.lessons || FALLBACK_DATA.lessons;
  app.innerHTML = `
    <div class="brief-shell">
      <div class="brief-dateline">
        <p class="mono-num">${escapeHtml(formatDate(data.latest?.generatedAt))}</p>
        <span class="mono-label">▸ ONE-MINUTE OPS BRIEF</span>
      </div>
      ${dataNotice(sources)}
      ${renderToday(data.latest, data.history)}
      ${renderStorage(data.latest, data.history)}
      ${renderLearn(data.lessons)}
      ${renderRoutines(data.workflow, data.latest?.automation)}
      ${renderTimeline(data.events)}
      ${renderTrust(data.latest)}
    </div>
  `;
  app.setAttribute("aria-busy", "false");
  runBootSweep();
}

/* ---------- Motion & interaction setup ---------- */

function runBootSweep() {
  if (bootPlayed) return;
  bootPlayed = true;
  const sweep = document.querySelector(".boot-sweep");
  if (!sweep) return;
  if (motionReduced()) {
    sweep.remove();
    return;
  }
  sweep.classList.add("is-running");
  const cleanup = () => sweep.remove();
  sweep.addEventListener("animationend", cleanup, { once: true });
  setTimeout(cleanup, 1400);
}

function setupRevealObserver() {
  if (revealObserver) revealObserver.disconnect();
  const targets = [...document.querySelectorAll("[data-reveal]:not(.is-in)")];
  if (!("IntersectionObserver" in window) || motionReduced()) {
    targets.forEach((target) => target.classList.add("is-in"));
    return;
  }
  revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add("is-in");
      revealObserver.unobserve(entry.target);
    });
  }, { rootMargin: "0px 0px -6%", threshold: 0.08 });
  targets.forEach((target) => revealObserver.observe(target));
}

function animateCount(element) {
  const target = numberOr(element.dataset.countValue);
  const format = element.dataset.countFormat || "bytes";
  const finalText = element.textContent;
  if (motionReduced()) return;
  const duration = 760;
  const start = performance.now();
  /* the gauge readout is the only counter Steward mirrors — every other [data-count] is untouched */
  const mirrored = Boolean(element.closest(".gauge .dial-readout"));
  const formatValue = (value) => format === "percent" ? `${value.toFixed(1)}%` : formatBytes(value);
  const tick = (now) => {
    const t = Math.min(1, (now - start) / duration);
    if (t >= 1) {
      element.textContent = finalText;
      if (mirrored) stewardCountProgress(1);
      return;
    }
    const eased = 1 - Math.pow(2, -10 * t);
    element.textContent = formatValue(target * eased);
    if (mirrored) stewardCountProgress(eased);
    requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function setupCountUps() {
  if (countObserver) countObserver.disconnect();
  const nodes = [...document.querySelectorAll("[data-count]:not([data-counted])")];
  if (nodes.length === 0) return;
  if (!("IntersectionObserver" in window) || motionReduced()) {
    nodes.forEach((node) => { node.dataset.counted = "true"; });
    return;
  }
  countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const node = entry.target;
      countObserver.unobserve(node);
      if (node.dataset.counted) return;
      node.dataset.counted = "true";
      animateCount(node);
    });
  }, { threshold: 0.4 });
  nodes.forEach((node) => countObserver.observe(node));
}

/* The scrub is data inspection, so it survives reduced motion — only the
   transitions that carry it are dropped, in CSS. One pointermove listener on the
   scope, rAF-throttled, writing transforms and custom properties: no per-column
   listener, no layout read inside the frame beyond the cached column centres. */
function setupScope() {
  document.querySelectorAll("[data-scope]").forEach((scope) => {
    const columns = [...scope.querySelectorAll(".scope-col")];
    const chip = scope.querySelector(".scope-chip");
    const readOut = scope.querySelector("[data-scope-read]");
    const deltaOut = scope.querySelector("[data-scope-delta]");
    const plot = scope.querySelector("[data-scope-cols]");
    if (columns.length === 0 || !chip || !plot || !readOut || !deltaOut) return;
    /* pointer ceremony only — a coarse pointer has no hover to scrub with */
    if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;

    let frame = 0;
    let pendingX = 0;
    let centres = null;
    let plotLeft = 0;
    let plotWidth = 0;
    let hot = null;

    const measure = () => {
      const rect = plot.getBoundingClientRect();
      plotLeft = rect.left;
      plotWidth = rect.width;
      centres = columns.map((column) => {
        const columnRect = column.getBoundingClientRect();
        return columnRect.left - rect.left + columnRect.width / 2;
      });
    };

    const apply = () => {
      frame = 0;
      if (!centres || centres.length === 0) return;
      const x = pendingX - plotLeft;
      let index = 0;
      let best = Infinity;
      for (let i = 0; i < centres.length; i += 1) {
        const distance = Math.abs(centres[i] - x);
        if (distance < best) {
          best = distance;
          index = i;
        }
      }
      const column = columns[index];
      if (column !== hot) {
        hot?.classList.remove("is-hot");
        column.classList.add("is-hot");
        hot = column;
        readOut.textContent = column.dataset.read || "";
        deltaOut.textContent = column.dataset.delta || "";
        chip.dataset.dir = column.dataset.dir || "none";
      }
      const cx = centres[index];
      scope.style.setProperty("--cx", `${cx.toFixed(1)}px`);
      const chipWidth = chip.offsetWidth;
      const clamped = Math.max(0, Math.min(plotWidth - chipWidth, cx - chipWidth / 2));
      scope.style.setProperty("--chip-x", `${clamped.toFixed(1)}px`);
    };

    const clear = () => {
      if (frame) cancelAnimationFrame(frame);
      frame = 0;
      centres = null;
      hot?.classList.remove("is-hot");
      hot = null;
      scope.removeAttribute("data-scrub");
    };

    scope.addEventListener("pointerenter", (event) => {
      if (event.pointerType === "touch") return;
      measure();
      scope.setAttribute("data-scrub", "on");
    });
    scope.addEventListener("pointermove", (event) => {
      if (event.pointerType === "touch") return;
      if (!centres) {
        measure();
        scope.setAttribute("data-scrub", "on");
      }
      pendingX = event.clientX;
      if (!frame) frame = requestAnimationFrame(apply);
    });
    scope.addEventListener("pointerleave", clear);
    scope.addEventListener("pointercancel", clear);
  });
}

/* ---------- day shift ---------- */

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_KEY) === "day" ? "day" : "night";
  } catch {
    return "night";
  }
}

function applyTheme(theme) {
  const day = theme === "day";
  const root = document.documentElement;
  if (day) root.setAttribute("data-theme", "day");
  else root.removeAttribute("data-theme");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", day ? "#f4f4ef" : "#090f1c");
  document.querySelector('meta[name="color-scheme"]')?.setAttribute("content", day ? "light" : "dark");
  const button = document.querySelector("[data-theme-toggle]");
  if (button) {
    button.setAttribute("aria-pressed", String(day));
    button.setAttribute("aria-label", day ? "Switch to night theme" : "Switch to day theme");
    button.textContent = day ? "NIGHT" : "DAY";
  }
}

function activeTheme() {
  /* the root attribute is the source of truth, not the store: where storage is
     blocked the toggle still has to work in both directions */
  return document.documentElement.getAttribute("data-theme") === "day" ? "day" : "night";
}

function setupTheme() {
  const button = document.querySelector("[data-theme-toggle]");
  applyTheme(readStoredTheme());
  if (!button) return;
  button.addEventListener("click", () => {
    const next = activeTheme() === "day" ? "night" : "day";
    try {
      localStorage.setItem(THEME_KEY, next);
    } catch {
      /* per-viewer convenience only */
    }
    applyTheme(next);
    liveRegion.textContent = next === "day" ? "Day shift applied." : "Night shift applied.";
  });
}

function setupNoteExpand() {
  document.querySelectorAll("[data-note-expand]").forEach((button) => {
    const transcript = button.closest(".headline-panel")?.querySelector("[data-transcript]");
    const line = transcript?.querySelector("p");
    if (!transcript || !line) {
      button.hidden = true;
      return;
    }
    // The line clamp lives on the inner <p> (.transcript.is-clamped p), so the
    // wrapper never overflows — measure the clamped paragraph itself.
    transcript.classList.add("is-clamped");
    if (line.scrollHeight <= line.clientHeight + 2) {
      button.hidden = true;
      transcript.classList.remove("is-clamped");
      return;
    }
    button.hidden = false;
    button.addEventListener("click", () => {
      const open = !transcript.classList.contains("is-open");
      transcript.classList.toggle("is-open", open);
      transcript.classList.toggle("is-clamped", !open);
      button.setAttribute("aria-expanded", String(open));
      button.textContent = open ? "LESS ▴" : "MORE ▾";
    });
  });
}

function setupFlipCards() {
  document.querySelectorAll("[data-flip-card]").forEach((card) => {
    const front = card.querySelector(".flip-front");
    const back = card.querySelector(".flip-back");
    card.addEventListener("click", () => {
      const flipped = card.getAttribute("aria-expanded") === "true";
      card.setAttribute("aria-expanded", String(!flipped));
      card.classList.toggle("is-flipped", !flipped);
      front?.setAttribute("aria-hidden", String(!flipped));
      back?.setAttribute("aria-hidden", String(flipped));
    });
  });
}

function setupLessonCompletion() {
  document.querySelectorAll("[data-lesson-complete]").forEach((button) => {
    const id = button.dataset.lessonComplete;
    const label = button.querySelector("[data-label]");
    if (readCompletedLessons().includes(id)) {
      button.setAttribute("aria-pressed", "true");
      if (label) label.textContent = "LOGGED ✓";
    }
    button.addEventListener("click", () => {
      if (button.getAttribute("aria-pressed") === "true") return;
      button.setAttribute("aria-pressed", "true");
      if (label) label.textContent = "LOGGED ✓";
      saveCompletedLesson(id);
      document.querySelectorAll(`[data-lesson-choice="${CSS.escape(id)}"]`).forEach((choice) => {
        choice.closest("li")?.setAttribute("data-logged", "true");
        const node = choice.querySelector(".ladder-node");
        if (node) node.textContent = "✓";
      });
      if (!motionReduced()) {
        const stage = button.closest(".lesson-takeaway")?.querySelector(".burst-stage");
        if (stage) {
          stage.innerHTML = Array.from({ length: 8 }, (_, index) => `<i style="--a:${index * 45}deg; --d:${index * 20}ms"></i>`).join("");
          setTimeout(() => { stage.innerHTML = ""; }, 800);
        }
      }
      liveRegion.textContent = "Lesson logged.";
      /* seven distinct lessons is a once-ever moment — it outranks the logged reaction */
      if (readCompletedLessons().length >= 7 && !stewardHasCelebrated()) {
        stewardMarkCelebrated();
        stewardSet("celebrating", "seven days. i noticed.");
      } else {
        stewardSet("logged", "logged. see you tomorrow.");
      }
    });
  });
}

function setupMemoryLab() {
  document.querySelectorAll("[data-memory-lab]").forEach((lab) => {
    const range = lab.querySelector("[data-memory-range]");
    const output = lab.querySelector("[data-workload-output]");
    const reading = lab.querySelector("[data-memory-reading]");
    const ramCount = lab.querySelector("[data-ram-count]");
    const swapCount = lab.querySelector("[data-swap-count]");
    const ramSlots = [...lab.querySelectorAll("[data-ram-slot]")];
    const swapSlots = [...lab.querySelectorAll("[data-swap-slot]")];
    const presets = [...lab.querySelectorAll("[data-memory-preset]")];
    if (!range || !output || !reading || !ramCount || !swapCount) return;

    const update = (rawValue, announce = false) => {
      const workload = Math.min(12, Math.max(1, numberOr(rawValue, 4)));
      const ramUsed = Math.min(8, workload);
      const swapUsed = Math.max(0, workload - 8);
      const pressure = workload <= 4 ? "light" : workload <= 8 ? "busy" : "crowded";
      const status = pressure === "light"
        ? ["Light memory pressure.", "The active work fits comfortably on the RAM workbench."]
        : pressure === "busy"
          ? ["The workbench is busy.", "The working set still fits in RAM; macOS may compress less-active memory before it needs swap."]
          : ["The workbench overflowed.", `${swapUsed} working-set point${swapUsed === 1 ? " is" : "s are"} shown in swap on the SSD, which is slower than RAM.`];

      lab.dataset.pressure = pressure;
      range.value = String(workload);
      range.setAttribute("aria-valuetext", `${workload} working-set points; ${status[0]} ${status[1]}`);
      output.textContent = `${workload} working-set points`;
      ramCount.textContent = `${ramUsed} / 8`;
      swapCount.textContent = `${swapUsed} / 4`;
      ramSlots.forEach((slot, index) => slot.classList.toggle("is-filled", index < ramUsed));
      swapSlots.forEach((slot, index) => slot.classList.toggle("is-filled", index < swapUsed));
      presets.forEach((button) => {
        button.setAttribute("aria-pressed", String(numberOr(button.dataset.memoryPreset) === workload));
      });
      reading.innerHTML = `<strong>${status[0]}</strong><span>${status[1]}</span>`;
      if (announce) liveRegion.textContent = `${status[0]} ${status[1]}`;
    };

    presets.forEach((button) => {
      button.addEventListener("click", () => update(button.dataset.memoryPreset, true));
    });
    range.addEventListener("input", () => update(range.value));
    update(range.value);
  });
}

function setupConceptExplorers() {
  document.querySelectorAll("[data-concept-explorer]").forEach((explorer) => {
    const tabs = [...explorer.querySelectorAll("[data-concept-tab]")];
    const panels = [...explorer.querySelectorAll("[data-concept-panel]")];

    const activate = (nextIndex, moveFocus = false) => {
      const safeIndex = (nextIndex + tabs.length) % tabs.length;
      tabs.forEach((tab, index) => {
        const selected = index === safeIndex;
        tab.setAttribute("aria-selected", String(selected));
        tab.tabIndex = selected ? 0 : -1;
        panels[index].hidden = !selected;
      });
      if (moveFocus) tabs[safeIndex]?.focus();
    };

    tabs.forEach((tab, index) => {
      tab.addEventListener("click", () => activate(index));
      tab.addEventListener("keydown", (event) => {
        if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
        event.preventDefault();
        if (event.key === "Home") activate(0, true);
        else if (event.key === "End") activate(tabs.length - 1, true);
        else activate(index + (event.key === "ArrowRight" ? 1 : -1), true);
      });
    });
  });
}

function setupLessonChoices() {
  document.querySelectorAll("[data-lesson-choice]").forEach((button) => {
    button.addEventListener("click", () => {
      if (button.dataset.lessonChoice === selectedLessonId) return;
      selectedLessonId = button.dataset.lessonChoice;
      const currentSection = document.querySelector("#learn");
      if (!currentSection) return;
      currentSection.outerHTML = renderLearn(activeLessonsData);
      setupLearnInteractions();
      setupSectionObserver();
      setupRevealObserver();
      setupCountUps();
      document.querySelector("#lesson-title")?.focus();
      liveRegion.textContent = "Archived lesson opened.";
    });
  });
}

function setupLearnInteractions() {
  setupMemoryLab();
  setupConceptExplorers();
  setupLessonChoices();
  setupFlipCards();
  setupLessonCompletion();
}

async function fetchDataFile(key, signal) {
  const path = DATA_FILES[key];
  try {
    const response = await fetch(path, { cache: "no-store", signal });
    if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
    const value = await response.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Expected a JSON object");
    return { value, state: "live", error: null };
  } catch (error) {
    if (error.name === "AbortError") throw error;
    return { value: FALLBACK_DATA[key], state: "fallback", error: error.message };
  }
}

async function loadBrief({ announce = false } = {}) {
  if (activeRequest) activeRequest.abort();
  if (announce) selectedLessonId = null;
  /* read the brief day BEFORE the deck renders — stewardReport marks it, and the
     reveal observer must not be able to fire before the class is in the markup */
  stewardBriefingActive = stewardBriefingDue();
  activeRequest = new AbortController();
  const { signal } = activeRequest;

  refreshButton.disabled = true;
  refreshButton.classList.add("is-loading");
  refreshButton.querySelector("span").textContent = "Reading…";
  freshness.classList.add("is-reading");
  freshness.querySelector("span:last-child").textContent = "Reading local snapshots";
  app.setAttribute("aria-busy", "true");
  clearTimeout(stewardBriefTimer);
  stewardSet("scanning", "reading local snapshots");

  try {
    const keys = Object.keys(DATA_FILES);
    const results = await Promise.all(keys.map((key) => fetchDataFile(key, signal)));
    const sources = Object.fromEntries(keys.map((key, index) => [key, results[index]]));
    const data = Object.fromEntries(keys.map((key, index) => [key, results[index].value]));
    renderApp(data, sources);
    setupInteractions();

    const fallbackCount = results.filter((result) => result.state !== "live").length;
    const clock = formatClock(data.latest?.generatedAt);
    freshness.classList.toggle("has-fallback", fallbackCount > 0);
    freshness.querySelector("span:last-child").textContent = fallbackCount > 0
      ? `Preview · ${clock}`
      : `Observed ${clock}`;
    stewardReport(data, fallbackCount);
    if (announce) {
      liveRegion.textContent = fallbackCount > 0
        ? "Brief refreshed. Some local scan files are not available, so preview data is clearly labeled."
        : "Brief refreshed with the latest local scan.";
    }
  } catch (error) {
    if (error.name !== "AbortError") {
      renderApp(FALLBACK_DATA, {
        latest: { state: "fallback" },
        history: { state: "fallback" },
        workflow: { state: "fallback" },
        events: { state: "fallback" },
        lessons: { state: "fallback" },
      });
      setupInteractions();
      freshness.classList.add("has-fallback");
      freshness.querySelector("span:last-child").textContent = "Preview available";
      /* the steward speaks first: his preview line now reaches the live region,
         and the fuller failure message is what must be left standing there */
      stewardReport(FALLBACK_DATA, 1);
      liveRegion.textContent = "The live brief could not be read. A labeled local preview is available.";
    }
  } finally {
    if (!signal.aborted) {
      refreshButton.disabled = false;
      refreshButton.classList.remove("is-loading");
      refreshButton.querySelector("span").textContent = "Refresh";
      freshness.classList.remove("is-reading");
      activeRequest = null;
    }
  }
}

function setupInteractions() {
  document.querySelectorAll("[data-review-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!selected));
      const label = button.querySelector("[data-label]");
      if (label) label.textContent = selected ? "Add to review" : "Held for review";
      liveRegion.textContent = selected ? "Removed from review." : "Added to review. No cleanup has been run.";
      if (!selected) {
        /* personal items stay yours — he queues them but refuses to claim the call */
        if (button.dataset.reviewRisk === "review") stewardSet("refuse-scope", "yours to review. i will not pick.");
        else stewardSet("holding", "held for review. nothing removed.");
      }
      stewardSyncShellHolds();
    });
  });

  document.querySelectorAll("[data-opportunity-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!selected));
      const label = button.querySelector("[data-label]");
      if (label) label.textContent = selected ? "Keep on the radar" : "On the radar";
      liveRegion.textContent = selected ? "Automation idea unmarked." : "Automation idea marked for a future draft.";
    });
  });

  setupLearnInteractions();
  setupSectionObserver();
  setupRevealObserver();
  setupCountUps();
  setupNoteExpand();
  setupScope();
}

function setupSectionObserver() {
  if (navObserver) navObserver.disconnect();
  if (!("IntersectionObserver" in window)) return;
  const links = [...document.querySelectorAll("[data-nav-link]")];
  const linkById = new Map(links.map((link) => [link.getAttribute("href")?.slice(1), link]));

  navObserver = new IntersectionObserver((entries) => {
    const visible = entries
      .filter((entry) => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
    if (!visible) return;
    links.forEach((link) => link.removeAttribute("aria-current"));
    linkById.get(visible.target.id)?.setAttribute("aria-current", "page");
  }, { rootMargin: "-20% 0px -68%", threshold: [0, 0.1, 0.4] });

  document.querySelectorAll("[data-observed-section]").forEach((section) => navObserver.observe(section));
}

/* ---------- Steward · the character (kit v2) ---------- */

const STEWARD_LINE_MS = 7000;
const STEWARD_IDLE_MS = 60000;
const STEWARD_BRIEF_MS = 7000;
const STEWARD_GAZE_MAX = 5;
const STEWARD_GAZE_DEADZONE = 40;
const STEWARD_GAZE_GIVEUP_MS = 4000;
const STEWARD_REPEAT_MS = 10000;

/* the charge gesture: 640ms of stillness before a hold can be filed */
const STEWARD_CHARGE_MS = 640;
const STEWARD_DRAIN_MS = 180;
const STEWARD_BRIEF_LINE_MS = 360;

/* states that stand on their own — he settles back to the most recent one */
const STEWARD_SETTLE_STATES = new Set(["resting", "watching", "full", "preview", "bored"]);
/* one-shot reactions — they hand control back once the line is gone */
const STEWARD_TRANSIENT_STATES = new Set(["found", "logged", "holding", "refuse-scope", "refuse-repeat", "celebrating"]);
/* the two states whose grid is the real disk fill */
const STEWARD_FILL_STATES = new Set(["resting", "watching"]);
/* he only follows the pointer when he is standing still and paying attention */
const STEWARD_GAZE_STATES = new Set(["resting", "watching", "preview"]);
/* states that own their cells outright — the rest keep whatever is on the grid */
const STEWARD_CELLS = {
  scanning: "dldd" + "dldd" + "dldd" + "dldd",
  found: "dddd" + "dhhd" + "dhhd" + "dddd",
  briefing: "mmmm" + "mmmm" + "dddd" + "dddd",
  holding: "dddd" + "dddd" + "dddd" + "llll",
  "refuse-scope": "dddd" + "dmmd" + "dmmd" + "dddd",
  /* the ceremony checkerboard: 0.85 and 0.30, violet against plasma */
  celebrating: "hmhm" + "mhmh" + "hmhm" + "mhmh",
  asleep: "dddd" + "dddd" + "dddd" + "dddm",
  full: "llll" + "llll" + "llll" + "llll",
  preview: "dddd" + "dmdd" + "ddmd" + "dddd",
  bored: "dddd" + "dddd" + "dddd" + "dddd",
};
/* empty-data pose · a single reading has nothing to compare against */
const STEWARD_POSE_ONE_READING = `l${"d".repeat(15)}`;

const STEWARD_BAND_LINES = {
  100: "full. i cannot help you from here.",
  90: "ninety. i would clear something this week.",
  80: "eighty percent used. worth a look this week.",
  70: "seventy. worth a look this month, not today.",
  60: "sixty percent used. no action needed.",
};

const STEWARD_BRIEF_KEY = "steward.lastBriefDay";
const STEWARD_BAND_KEY = "steward.lastUsedPercent";
const STEWARD_CELEBRATED_KEY = "steward.celebrated";

const stewardDock = document.querySelector("[data-steward]");
const stewardBadge = stewardDock?.querySelector("[data-steward-badge]");
const stewardLineEl = stewardDock?.querySelector("[data-steward-line]");
const stewardFace = stewardDock?.querySelector("[data-steward-face]");
const stewardShellEl = stewardDock?.querySelector("[data-steward-shell]");
const stewardShellBody = stewardDock?.querySelector("[data-steward-shell-body]");
const stewardStatusEl = stewardDock?.querySelector("[data-steward-status]");
const stewardCells = stewardDock ? [...stewardDock.querySelectorAll("[data-steward-cell]")] : [];
const stewardFinePointer = window.matchMedia?.("(hover: hover) and (pointer: fine)") || null;

let stewardLineTimer = null;
let stewardHideTimer = null;
let stewardSettleTimer = null;
let stewardIdleTimer = null;
let stewardBriefTimer = null;
let stewardBlinkTimer = null;
let stewardGazeIdleTimer = null;
let stewardGazeFrame = 0;
let stewardGazePointer = null;
let stewardActivityStamp = 0;
let stewardRestState = "resting";
let stewardCurrentState = "resting";
let stewardLastLine = "";
let stewardFillPercent = 0;
let stewardCellOverride = null;
let stewardCounting = false;
let stewardShellOpenState = false;
let stewardData = {};
let stewardRepeatLine = "";
let stewardRepeatStart = 0;
let stewardRepeatCount = 0;
let stewardCharge = null;
let stewardBandCrossed = false;
let stewardBriefLineTimer = null;
const stewardChargeTimers = new Set();

function stewardGb(bytes, digits = 1) {
  return String(Number((numberOr(bytes) / GIB).toFixed(digits)));
}

function stewardReadStore(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function stewardWriteStore(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* per-viewer convenience only */
  }
}

function stewardHasCelebrated() {
  return stewardReadStore(STEWARD_CELEBRATED_KEY) === "true";
}

function stewardMarkCelebrated() {
  stewardWriteStore(STEWARD_CELEBRATED_KEY, "true");
}

/* ---- the word ---- */

function stewardHideLine() {
  if (!stewardLineEl) return;
  clearTimeout(stewardLineTimer);
  clearTimeout(stewardHideTimer);
  if (stewardLineEl.hidden) return;
  stewardLineEl.classList.remove("is-shown");
  stewardHideTimer = setTimeout(() => { stewardLineEl.hidden = true; }, 220);
}

/* the line is aria-hidden decoration, but for these states it is the ONLY place
   the observation is written — so it is mirrored into the existing live region.
   States driven by a user action that already announces stay out of this set. */
const STEWARD_ANNOUNCE_STATES = new Set(["briefing", "found", "watching", "full", "preview", "bored", "resting"]);

function stewardShowLine(line, announce = false) {
  if (!stewardLineEl || !line) return;
  clearTimeout(stewardLineTimer);
  clearTimeout(stewardHideTimer);
  stewardLastLine = line;
  stewardLineEl.textContent = line;
  stewardLineEl.hidden = false;
  void stewardLineEl.offsetWidth;
  stewardLineEl.classList.add("is-shown");
  if (announce && liveRegion) liveRegion.textContent = line;
  stewardLineTimer = setTimeout(stewardHideLine, STEWARD_LINE_MS);
}

/* ---- the grid ---- */

function stewardWriteCells(pattern) {
  if (stewardCells.length === 0) return;
  stewardCells.forEach((cell, index) => {
    cell.dataset.lv = pattern[index] || "d";
  });
}

function stewardFillPattern(percent) {
  const lit = Math.round(Math.min(100, Math.max(0, numberOr(percent))) / 100 * stewardCells.length);
  return stewardCells.map((_, index) => (index < lit ? "l" : "d")).join("");
}

function stewardApplyCells(state) {
  if (stewardCells.length === 0) return;
  /* refuse-repeat is deadpan: the grid does not move. counting and logged keep what is on it. */
  if (state === "refuse-repeat" || state === "counting" || state === "logged") return;
  const pattern = STEWARD_CELLS[state];
  if (pattern) {
    stewardWriteCells(pattern);
    return;
  }
  if (STEWARD_FILL_STATES.has(state)) stewardWriteCells(stewardCellOverride || stewardFillPattern(stewardFillPercent));
}

function stewardSetFill(usedPercent) {
  stewardFillPercent = Math.min(100, Math.max(0, numberOr(usedPercent)));
  if (stewardDock) stewardApplyCells(stewardDock.getAttribute("data-state"));
}

/* ---- state ---- */

function stewardArmIdle() {
  if (!stewardDock) return;
  clearTimeout(stewardIdleTimer);
  stewardIdleTimer = setTimeout(() => {
    if (stewardDock.getAttribute("data-state") === "scanning") return;
    stewardSet("asleep");
  }, STEWARD_IDLE_MS);
}

/* pose only — no line, no settle, no idle bookkeeping */
function stewardEnterState(state) {
  if (!stewardDock) return;
  stewardDock.setAttribute("data-state", state);
  stewardApplyCells(state);
  if (!STEWARD_GAZE_STATES.has(state)) stewardGazeRecenter(true);
}

function stewardSet(state, line = "") {
  if (!stewardDock) return;
  clearTimeout(stewardSettleTimer);
  stewardCounting = false;
  stewardCurrentState = state;
  /* one motion at a time: swapping data-state cancels the previous animation outright */
  stewardEnterState(state);
  if (STEWARD_SETTLE_STATES.has(state)) stewardRestState = state;
  if (line) stewardShowLine(line, STEWARD_ANNOUNCE_STATES.has(state));
  else stewardHideLine();
  if (STEWARD_TRANSIENT_STATES.has(state)) {
    stewardSettleTimer = setTimeout(() => {
      if (stewardCurrentState !== state) return;
      stewardCurrentState = stewardRestState;
      stewardEnterState(stewardRestState);
    }, line ? STEWARD_LINE_MS : 900);
  }
  if (state !== "asleep") stewardArmIdle();
}

/* ---- the gauge count-up, mirrored into the grid ---- */

function stewardCountProgress(progress) {
  if (!stewardDock || stewardCells.length === 0 || motionReduced()) return;
  const state = stewardDock.getAttribute("data-state");
  /* the morning brief and a live fetch outrank a count-up */
  if (stewardCurrentState === "briefing" || state === "scanning" || state === "asleep") return;
  if (progress >= 1) {
    if (!stewardCounting) return;
    stewardCounting = false;
    stewardEnterState(stewardCurrentState);
    return;
  }
  if (!stewardCounting) {
    stewardCounting = true;
    stewardEnterState("counting");
  }
  const lit = Math.round(Math.min(1, Math.max(0, progress)) * stewardCells.length);
  const columns = 4;
  const pattern = stewardCells
    .map((_, index) => {
      const row = Math.floor(index / columns);
      const order = (3 - row) * columns + (index % columns);
      return order < lit ? "l" : "d";
    })
    .join("");
  stewardWriteCells(pattern);
}

/* ---- gaze (tier 1) ---- */

function stewardGazeAllowed() {
  return Boolean(stewardFace) && !motionReduced() && Boolean(stewardFinePointer?.matches);
}

function stewardGazeWrite(x, y, instant) {
  if (!stewardFace) return;
  if (instant) {
    stewardFace.style.transition = "none";
    stewardFace.style.transform = `translate(${x}px, ${y}px)`;
    void stewardFace.offsetWidth;
    stewardFace.style.transition = "";
    return;
  }
  stewardFace.style.transform = `translate(${x}px, ${y}px)`;
}

function stewardGazeRecenter(instant = false) {
  stewardGazeWrite(0, 0, instant);
}

function stewardBlink() {
  if (!stewardDock || motionReduced()) return;
  stewardDock.classList.add("is-blink");
  clearTimeout(stewardBlinkTimer);
  stewardBlinkTimer = setTimeout(() => stewardDock.classList.remove("is-blink"), 130);
}

function stewardGazeApply() {
  stewardGazeFrame = 0;
  if (!stewardBadge || !stewardGazePointer) return;
  if (!stewardGazeAllowed() || !STEWARD_GAZE_STATES.has(stewardDock.getAttribute("data-state"))) {
    stewardGazeRecenter(true);
    return;
  }
  const rect = stewardBadge.getBoundingClientRect();
  const dx = stewardGazePointer.x - (rect.left + rect.width / 2);
  const dy = stewardGazePointer.y - (rect.top + rect.height / 2);
  if (Math.hypot(dx, dy) <= STEWARD_GAZE_DEADZONE) {
    stewardGazeRecenter(false);
    return;
  }
  const clamp = (value) => Math.max(-STEWARD_GAZE_MAX, Math.min(STEWARD_GAZE_MAX, value));
  stewardGazeWrite(clamp(dx / 50), clamp(dy / 50), false);
}

function stewardGazeMove(event) {
  if (!stewardGazeAllowed()) return;
  stewardGazePointer = { x: event.clientX, y: event.clientY };
  clearTimeout(stewardGazeIdleTimer);
  stewardGazeIdleTimer = setTimeout(stewardGazeGiveUp, STEWARD_GAZE_GIVEUP_MS);
  if (!stewardGazeFrame) stewardGazeFrame = requestAnimationFrame(stewardGazeApply);
}

function stewardGazeGiveUp() {
  stewardGazePointer = null;
  stewardGazeRecenter(false);
  stewardBlink();
}

function stewardGazeDrop() {
  stewardGazePointer = null;
  clearTimeout(stewardGazeIdleTimer);
  stewardGazeRecenter(true);
}

/* ---- the shell (tier 3) ---- */

/* ---- the two panels ----

   ASK and RECLAIM are one tablist over two panels that already exist in the
   markup. Switching only flips `hidden` — the conversation log node is never
   re-created, so a half-finished exchange survives every switch. The choice is
   a module variable: it lasts the session and is deliberately not stored. */

const stewardTabsEl = stewardDock?.querySelector("[data-steward-tabs]");
const stewardTabKeys = stewardTabsEl ? [...stewardTabsEl.querySelectorAll("[data-steward-tab]")] : [];
const stewardTabPanels = stewardShellEl ? [...stewardShellEl.querySelectorAll("[data-steward-panel]")] : [];

let stewardTab = "ask";

function stewardTabApply(tab, moveFocus = false) {
  if (stewardTabKeys.length === 0) return;
  stewardTab = stewardTabKeys.some((key) => key.dataset.stewardTab === tab) ? tab : "ask";
  stewardTabKeys.forEach((key) => {
    const selected = key.dataset.stewardTab === stewardTab;
    key.setAttribute("aria-selected", String(selected));
    /* roving tabindex — the tablist is one tab stop, arrows move inside it */
    key.tabIndex = selected ? 0 : -1;
    if (selected && moveFocus) key.focus({ preventScroll: true });
  });
  stewardTabPanels.forEach((panel) => {
    panel.hidden = panel.dataset.stewardPanel !== stewardTab;
  });
  /* a picker left open on a panel nobody can see is a focus trap with no door */
  if (stewardTab !== "ask") stewardModePopClose(false);
}

function stewardTabMove(index, step) {
  if (stewardTabKeys.length === 0) return;
  const next = stewardTabKeys[(index + step + stewardTabKeys.length) % stewardTabKeys.length];
  stewardTabApply(next.dataset.stewardTab, true);
}

function setupStewardTabs() {
  stewardTabKeys.forEach((key, index) => {
    key.addEventListener("click", () => stewardTabApply(key.dataset.stewardTab));
    key.addEventListener("keydown", (event) => {
      if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return;
      event.preventDefault();
      if (event.key === "Home") stewardTabMove(0, 0);
      else if (event.key === "End") stewardTabMove(stewardTabKeys.length - 1, 0);
      else stewardTabMove(index, event.key === "ArrowRight" ? 1 : -1);
    });
  });
}

function stewardCandidates() {
  return arrayOr(stewardData.latest?.reclaimable)
    .filter((item) => numberOr(item?.bytes) > 0)
    .sort((a, b) => numberOr(b?.bytes) - numberOr(a?.bytes))
    .slice(0, 3);
}

function stewardReviewButton(id) {
  if (!id) return null;
  return document.querySelector(`[data-review-action][data-reclaim-id="${CSS.escape(id)}"]`);
}

function stewardSyncHold(key, target) {
  const held = Boolean(target) && target.getAttribute("aria-pressed") === "true";
  key.setAttribute("aria-pressed", String(held));
  /* the label rides above the charge fill, so it is written into its own span */
  const label = key.querySelector("[data-hold-label]") || key;
  label.textContent = held ? "held" : "hold";
}

function stewardSyncShellHolds() {
  if (!stewardShellBody) return;
  stewardShellBody.querySelectorAll("[data-steward-hold]").forEach((key) => {
    stewardSyncHold(key, stewardReviewButton(key.dataset.stewardHold));
  });
}

/* ---- the hold affordance ----

   The keycap says "hold" and nothing on it says the gesture wants 640ms of
   stillness. The title carries that for a cursor; the first shell of the
   session carries it in words for everyone else — one dim line, not a
   paragraph. Keyboard activation files instantly, so the keycap's own title
   says so rather than spending the line on a gesture the keyboard never
   performs. Session-scoped on purpose: a module flag, nothing stored. */

const STEWARD_HOLD_TITLE = "press and hold to file — enter files instantly";
const STEWARD_HOLD_HINT = "▸ hold to file · release early to cancel";

let stewardHintDone = false;
let stewardHintOn = false;

/* the panel is rebuilt on every refresh, so the node is re-mounted rather than
   remembered — one owner for the markup, one flag for whether it belongs there */
function stewardHintMount() {
  if (!stewardHintOn || !stewardShellBody) return;
  if (stewardShellBody.querySelector(".steward-hint")) return;
  const panel = stewardShellBody.querySelector(".steward-shell-panel");
  if (!panel) return;
  const hint = document.createElement("p");
  hint.className = "steward-hint";
  hint.textContent = STEWARD_HOLD_HINT;
  const anchor = panel.querySelector(".steward-shell-list") || panel.querySelector(".steward-shell-empty");
  if (anchor) anchor.after(hint);
  else panel.appendChild(hint);

  /* the panel is a short scroller on small screens, and a hint below its fold
     teaches nobody. Only the panel's own scrollTop moves — never the page. */
  const overflow = hint.getBoundingClientRect().bottom - panel.getBoundingClientRect().bottom;
  if (overflow > 0) panel.scrollTop += overflow;
}

function stewardHintShow() {
  if (stewardHintDone || stewardHintOn) return;
  stewardHintOn = true;
  stewardHintMount();
}

/* shown once, dismissed for good: the first filed hold or the first close ends it */
function stewardHintDismiss() {
  if (!stewardHintOn && stewardHintDone) return;
  stewardHintDone = true;
  stewardHintOn = false;
  stewardShellBody?.querySelector(".steward-hint")?.remove();
}

/* ---- press and hold · the fill is the charge ----

   Pointer-only ceremony. The fill is a ::before scaleX under a 640ms linear
   transition; JS only owns the arm timer and the character. Keyboard activation
   (Enter/Space) files the hold instantly with no charge — a click event with
   detail 0 is a keyboard activation, which is how the two paths stay separate
   without swallowing the button's native semantics. */

function stewardChargeTimeout(fn, ms) {
  const timer = setTimeout(() => {
    stewardChargeTimers.delete(timer);
    fn();
  }, ms);
  stewardChargeTimers.add(timer);
  return timer;
}

function stewardChargeReset() {
  if (!stewardCharge) return;
  clearTimeout(stewardCharge.timer);
  stewardChargeTimers.delete(stewardCharge.timer);
  /* dropping the class hands the fill back to its 180ms drain transition */
  stewardCharge.key.classList.remove("is-charging", "is-armed");
  stewardCharge = null;
}

/* a charge that is abandoned rather than released — the shell closing, a
   re-render, a cancelled pointer — must also hand the character back. Without
   this he keeps the charging pose forever, waiting for a release that cannot
   come. */
function stewardChargeSettle() {
  if (!stewardDock) return;
  const state = stewardDock.getAttribute("data-state");
  if (state !== "charging" && state !== "armed") return;
  stewardSet(stewardRestState);
}

function stewardChargeCancelAll() {
  const wasCharging = Boolean(stewardCharge);
  stewardChargeReset();
  stewardChargeTimers.forEach((timer) => clearTimeout(timer));
  stewardChargeTimers.clear();
  if (wasCharging) stewardChargeSettle();
}

function stewardChargeBegin(key, target) {
  if (key.disabled) return;
  stewardChargeReset();
  key.classList.add("is-charging");
  stewardCharge = { key, target, armed: false, timer: 0 };
  stewardSet("charging", "holding still while you decide.");
  stewardCharge.timer = stewardChargeTimeout(() => {
    if (!stewardCharge || stewardCharge.key !== key) return;
    stewardCharge.armed = true;
    key.classList.add("is-armed");
    stewardSet("armed", "ready. let go.");
  }, STEWARD_CHARGE_MS);
}

function stewardStamp(key) {
  const row = key.closest(".steward-shell-row");
  if (!row) return;
  row.querySelector(".steward-stamp")?.remove();
  const stamp = document.createElement("span");
  stamp.className = "steward-stamp mono-num";
  stamp.textContent = "HELD";
  row.appendChild(stamp);
  stewardChargeTimeout(() => stamp.remove(), 1400);
}

function stewardChargeRelease(key) {
  const charge = stewardCharge;
  if (!charge || charge.key !== key) return;
  const { armed, target } = charge;
  stewardChargeReset();
  if (!armed) {
    /* early release — the fill drains and nothing is filed */
    stewardSet(stewardRestState, "nothing held. i was not finished.");
    stewardBlink();
    return;
  }
  /* review-risk candidates keep their refusal: the ceremony is cancelled at
     release and the refusal line plays instead of the stamp. The real control
     is still driven, so both surfaces stay in one state exactly as before. */
  const refuses = target?.dataset.reviewRisk === "review";
  target?.click();
  stewardSyncHold(key, target);
  /* the gesture has been performed — the words have done their job */
  stewardHintDismiss();
  if (!refuses) stewardStamp(key);
}

function stewardHoldInstant(key, target) {
  target?.click();
  stewardSyncHold(key, target);
  stewardHintDismiss();
}

function stewardBindHold(key, target) {
  key.addEventListener("pointerdown", (event) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    stewardChargeBegin(key, target);
  });
  key.addEventListener("pointerup", () => stewardChargeRelease(key));
  key.addEventListener("pointerleave", () => {
    if (!stewardCharge || stewardCharge.key !== key) return;
    stewardChargeReset();
    stewardSet(stewardRestState, "nothing held. i was not finished.");
    stewardBlink();
  });
  key.addEventListener("pointercancel", () => {
    if (!stewardCharge || stewardCharge.key !== key) return;
    stewardChargeReset();
    stewardChargeSettle();
  });
  key.addEventListener("click", (event) => {
    /* detail 0 = keyboard activation; a pointer gesture was already handled */
    if (event.detail !== 0) return;
    stewardHoldInstant(key, target);
  });
}

/* ---- the one status line ----

   The trend sentence and the delta line used to be two paragraphs stacked under
   the candidates. They are one mono line at the foot of the ASK panel now: what
   moved since the previous reading, and how far the history has come. Nothing
   is lost from the product — the long trend sentence still lives in CH01's
   console panel, which is where it was always written in full. */

const STEWARD_READING_GOAL = 7;

function stewardStatusLine() {
  const count = validSnapshots(stewardData.history).length;
  /* below two readings there is no "since last" to report — the count is the news */
  if (count === 0) return "▸ no readings yet · 0/2 readings";
  if (count === 1) return "▸ baseline set · 1/2 readings";
  const { change } = deriveSummary(stewardData.latest, stewardData.history);
  const move = change === 0
    ? "no change"
    : `${change > 0 ? "+" : "−"}${stewardGb(Math.abs(change))} gb`;
  /* the goal never sits behind the count: a longer history raises its own bar */
  return `▸ ${move} since last · ${count}/${Math.max(STEWARD_READING_GOAL, count)} readings`;
}

function stewardRenderStatus() {
  if (!stewardStatusEl) return;
  stewardStatusEl.textContent = stewardStatusLine();
  stewardStatusEl.hidden = false;
}

function stewardRenderShell() {
  if (!stewardShellBody) return;
  /* fresh nodes each render — no charge timer may outlive the markup it drives */
  stewardChargeCancelAll();
  const items = stewardCandidates();

  stewardShellBody.innerHTML = `
    <div class="steward-shell-panel">
      <p class="steward-shell-head"><span class="steward-caret" aria-hidden="true">▮</span> Reclaim bay · top ${items.length}</p>
      ${items.length ? `
        <ul class="steward-shell-list">
          ${items.map((item, index) => {
            const id = String(item?.id || `reclaim-${index}`);
            const label = String(item?.label || "Cleanup opportunity");
            return `
              <li class="steward-shell-row">
                <span class="steward-shell-name" title="${escapeHtml(label)}">${escapeHtml(label)}</span>
                <span class="steward-shell-size">${formatBytes(item?.bytes)}</span>
                <button class="steward-key steward-shell-hold" type="button" data-steward-hold="${escapeHtml(id)}" aria-pressed="false" title="${STEWARD_HOLD_TITLE}" aria-label="Hold ${escapeHtml(label)} for review"><span data-hold-label>hold</span></button>
                <button class="steward-key steward-shell-show" type="button" data-steward-show="${escapeHtml(id)}" aria-label="Show ${escapeHtml(label)} in the reclaim bay"><span>show me</span></button>
              </li>
            `;
          }).join("")}
        </ul>
      ` : `<p class="steward-shell-empty">nothing clears the evidence threshold.</p>`}
    </div>
  `;

  /* the status line reads the same data and is redrawn on the same beat */
  stewardRenderStatus();

  /* a refresh mid-shell rebuilds the panel; the hint outlives the markup it sat in */
  stewardHintMount();

  /* fresh nodes each render — no listener or timer survives a refresh */
  stewardShellBody.querySelectorAll("[data-steward-hold]").forEach((key) => {
    const id = key.dataset.stewardHold;
    const target = stewardReviewButton(id);
    if (!target) {
      key.disabled = true;
      return;
    }
    stewardSyncHold(key, target);
    stewardBindHold(key, target);
  });

  stewardShellBody.querySelectorAll("[data-steward-show]").forEach((key) => {
    key.addEventListener("click", () => {
      const id = key.dataset.stewardShow;
      const details = document.querySelector(`.recommendation[data-reclaim-id="${CSS.escape(id)}"]`);
      stewardShellClose(false);
      if (details) {
        details.open = true;
        details.querySelector("summary")?.focus({ preventScroll: true });
      }
      document.querySelector("#storage")?.scrollIntoView({
        behavior: motionReduced() ? "auto" : "smooth",
        block: "start",
      });
    });
  });
}

function stewardShellOpen() {
  if (!stewardShellEl || !stewardDock || stewardShellOpenState) return;
  stewardShellOpenState = true;
  stewardDock.setAttribute("data-shell", "open");
  stewardShellEl.removeAttribute("inert");
  stewardShellEl.removeAttribute("aria-hidden");
  stewardBadge?.setAttribute("aria-expanded", "true");
  stewardConvoCheck();
  stewardModesCheck();
  stewardHintShow();
  /* the tab he was last on is where he opens — a module variable, per session */
  stewardTabApply(stewardTab);
  /* the panel is only clipped, never visibility-hidden, so it can take focus at
     once. The tablist is the shell's entry point, so focus lands on the tab
     that is actually selected rather than on whatever button comes first. */
  const entry = stewardTabKeys.find((key) => key.getAttribute("aria-selected") === "true");
  (entry || stewardShellEl.querySelector("button:not([disabled])"))?.focus({ preventScroll: true });
}

function stewardShellClose(returnFocus = true) {
  if (!stewardShellEl || !stewardDock || !stewardShellOpenState) return;
  stewardChargeCancelAll();
  /* a consent panel left open is a question with no one in front of it —
     closing the shell answers it the safe way: no */
  stewardConsentCancel(false);
  stewardModePopClose(false);
  stewardHintDismiss();
  stewardShellOpenState = false;
  const hadFocus = stewardShellEl.contains(document.activeElement);
  stewardDock.setAttribute("data-shell", "closed");
  stewardShellEl.setAttribute("inert", "");
  stewardShellEl.setAttribute("aria-hidden", "true");
  stewardBadge?.setAttribute("aria-expanded", "false");
  if (returnFocus && hadFocus) stewardBadge?.focus();
}

function stewardShellToggle() {
  if (stewardShellOpenState) stewardShellClose();
  else stewardShellOpen();
}

/* ---------- Steward · the conversation (tier 3, local assistant) ----------

   Everything the server says lands in a text node. Nothing from an envelope is
   ever concatenated into markup, ever used as a label, and ever used as a
   selector without being matched against a hardcoded mirror first. The local
   server is trusted today; this code has to stay safe when it is not.       */

const STEWARD_TURN_LIMIT = 6;
const STEWARD_EXPRESSION_MS = 7000;
const STEWARD_ASK_TIMEOUT_MS = 20000;
const STEWARD_ASK_MAX = 500;

const STEWARD_ASK_FAILURE = "the local brief is still here. try again.";
const STEWARD_ASK_OFFLINE = "assistant offline. the brief is the source of truth.";
const STEWARD_ASK_UNCONFIGURED = "provider not configured. set the api key and restart the server.";

/* provider → receipt. An unknown provider gets no receipt at all: the line is a
   privacy claim, and a claim we cannot make from our own table is not made.
   The cloud rows are prefixes — the model comes off the envelope and is written
   as text, never as a label the code trusts. */
const STEWARD_RECEIPTS = new Map([
  ["local", "local · nothing left this mac"],
  ["openai", "openai"],
  ["anthropic", "claude"],
]);
const STEWARD_RECEIPT_SENT = "sent redacted measurements";
const STEWARD_RECEIPT_FALLBACK = " · cloud unavailable, local answered";
const STEWARD_RECEIPT_MODEL_MAX = 40;

/* the word line while a cloud call is in flight — he says where it went */
const STEWARD_ASK_CLOUD_LINES = {
  openai: "asking openai. nothing else leaves.",
  anthropic: "asking claude. nothing else leaves.",
};

/* measured is the unmarked case — everything else says so in front of the words */
const STEWARD_EPISTEMIC = {
  inferred: { mark: "~", label: "inferred" },
  unavailable: { mark: "·", label: "unavailable" },
  simulated: { mark: "≈", label: "simulated" },
};

const STEWARD_EXPRESSIONS = new Set(["calm", "pleased", "watchful", "concerned"]);

/* the client-side mirror of the server allowlist. A next step that is not on
   this list renders nothing — no button, no message, no console noise. */
const STEWARD_RECEIPT_TARGETS = {
  "disk.history": ".trend-panel",
  coverage: ".coverage-panel",
  events: "#timeline",
};
const STEWARD_CHANNEL_TARGETS = new Set(["today", "storage", "learn", "routines", "timeline", "trust"]);
const STEWARD_RECLAIM_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const STEWARD_RECLAIM_ID_MAX = 40;
const STEWARD_LESSON_TARGET = /^(?:current|day-(?:[1-9]|[12][0-9]|30))$/;

const stewardConvo = stewardDock?.querySelector("[data-steward-convo]");
const stewardLogEl = stewardDock?.querySelector("[data-steward-log]");
const stewardPromptForm = stewardDock?.querySelector("[data-steward-prompt]");
const stewardInput = stewardDock?.querySelector("[data-steward-input]");
const stewardAskKey = stewardDock?.querySelector("[data-steward-ask]");

const stewardTurns = [];
let stewardAskInFlight = false;
let stewardAskOffline = false;
let stewardConvoChecked = false;
let stewardExpressionTimer = null;

/* ---- the expression · a temporary read on the eyes ----
   data-state belongs to the telemetry. This attribute never touches it: it
   moves the eyes for seven seconds and then gets out of the way. */

function stewardExpress(expression) {
  if (!stewardDock || !STEWARD_EXPRESSIONS.has(expression)) return;
  clearTimeout(stewardExpressionTimer);
  stewardDock.setAttribute("data-expression", expression);
  stewardExpressionTimer = setTimeout(() => {
    stewardDock.removeAttribute("data-expression");
  }, STEWARD_EXPRESSION_MS);
}

/* the fallback read is ours, not the server's — it is deliberately outside the
   allowlist above so no envelope can ask for amber eyes it has not earned.
   Same seven seconds, same timer, then the eyes go back to the telemetry. */
function stewardExpressFallback() {
  if (!stewardDock) return;
  clearTimeout(stewardExpressionTimer);
  stewardDock.setAttribute("data-expression", "fallback");
  stewardExpressionTimer = setTimeout(() => {
    stewardDock.removeAttribute("data-expression");
  }, STEWARD_EXPRESSION_MS);
}

/* ---- the next step · code owns the label and the destination ---- */

function stewardScrollTo(node) {
  if (!node) return;
  node.scrollIntoView({ behavior: motionReduced() ? "auto" : "smooth", block: "start" });
}

function stewardResolveNextStep(nextStep) {
  if (!nextStep || typeof nextStep !== "object") return null;
  const actionId = typeof nextStep.actionId === "string" ? nextStep.actionId : "";
  const targetId = typeof nextStep.targetId === "string" ? nextStep.targetId : "";

  if (actionId === "show_receipt") {
    if (!Object.hasOwn(STEWARD_RECEIPT_TARGETS, targetId)) return null;
    const node = document.querySelector(STEWARD_RECEIPT_TARGETS[targetId]);
    if (!node) return null;
    return {
      label: "SHOW ME",
      run: () => {
        stewardShellClose(false);
        stewardScrollTo(node);
      },
    };
  }

  if (actionId === "open_channel") {
    if (!STEWARD_CHANNEL_TARGETS.has(targetId)) return null;
    const node = document.getElementById(targetId);
    if (!node) return null;
    return {
      label: "OPEN",
      run: () => {
        stewardShellClose(false);
        stewardScrollTo(node);
      },
    };
  }

  if (actionId === "open_reclaim_item") {
    /* shape first, then presence — an id the deck never rendered is not openable */
    if (targetId.length > STEWARD_RECLAIM_ID_MAX || !STEWARD_RECLAIM_ID.test(targetId)) return null;
    const details = document.querySelector(`.recommendation[data-reclaim-id="${CSS.escape(targetId)}"]`);
    if (!details) return null;
    return {
      label: "OPEN",
      run: () => {
        stewardShellClose(false);
        details.open = true;
        details.querySelector("summary")?.focus({ preventScroll: true });
        stewardScrollTo(details);
      },
    };
  }

  if (actionId === "show_lesson") {
    if (!STEWARD_LESSON_TARGET.test(targetId)) return null;
    const learn = document.querySelector("#learn");
    if (!learn) return null;
    if (targetId === "current") {
      return {
        label: "OPEN",
        run: () => {
          stewardShellClose(false);
          stewardScrollTo(learn);
        },
      };
    }
    const day = Number(targetId.slice(4));
    const choice = document.querySelector(`[data-lesson-choice][data-lesson-number="${CSS.escape(String(day))}"]`);
    if (!choice) return null;
    return {
      label: "OPEN",
      run: () => {
        stewardShellClose(false);
        /* the ladder owns lesson selection — this only drives the real control */
        choice.click();
        stewardScrollTo(document.querySelector("#learn") || learn);
      },
    };
  }

  return null;
}

/* ---- the log ---- */

function stewardMark(text) {
  const mark = document.createElement("span");
  mark.className = "steward-turn-mark";
  mark.setAttribute("aria-hidden", "true");
  mark.textContent = text;
  return mark;
}

function stewardScrollLog() {
  if (!stewardLogEl) return;
  stewardLogEl.scrollTop = stewardLogEl.scrollHeight;
}

function stewardOpenTurn(text) {
  if (!stewardLogEl) return null;
  const turn = document.createElement("div");
  turn.className = "steward-turn";
  const line = document.createElement("p");
  line.className = "steward-turn-you";
  line.append(stewardMark("▸ "), document.createTextNode(`you · ${text}`));
  turn.appendChild(line);
  stewardLogEl.appendChild(turn);
  stewardTurns.push(turn);
  /* the memory and the DOM are trimmed together — six turns, nothing stored */
  while (stewardTurns.length > STEWARD_TURN_LIMIT) stewardTurns.shift()?.remove();
  stewardScrollLog();
  return turn;
}

function stewardReplyLine(turn, text, epistemicState) {
  if (!turn) return;
  const line = document.createElement("p");
  line.className = "steward-turn-reply";
  line.appendChild(stewardMark("▸ "));
  const flag = Object.hasOwn(STEWARD_EPISTEMIC, epistemicState) ? STEWARD_EPISTEMIC[epistemicState] : null;
  if (flag) {
    const badge = document.createElement("span");
    badge.className = "steward-turn-epistemic";
    badge.textContent = flag.mark;
    badge.title = `${flag.label} — not a direct measurement`;
    badge.setAttribute("role", "img");
    badge.setAttribute("aria-label", `${flag.label} answer`);
    line.append(badge, document.createTextNode(" "));
  }
  /* the only place a server string is written, and it is written as text */
  line.appendChild(document.createTextNode(text));
  turn.appendChild(line);
  if (liveRegion) liveRegion.textContent = text;
  stewardScrollLog();
}

/* the receipt is a privacy claim, so every part of it is either a code-owned
   string or the server's own model stamp written as text. An envelope that
   names a provider this table does not know gets no receipt at all. */
function stewardReceiptLine(turn, envelope) {
  const provider = typeof envelope?.provider === "string" ? envelope.provider : "";
  const base = STEWARD_RECEIPTS.get(provider);
  if (!turn || !base) return;
  let receipt = base;
  if (provider !== "local") {
    const model = String(envelope?.model || "").trim().slice(0, STEWARD_RECEIPT_MODEL_MAX);
    receipt = model
      ? `${base} · ${model} · ${STEWARD_RECEIPT_SENT}`
      : `${base} · ${STEWARD_RECEIPT_SENT}`;
  }
  /* the fallback says so on whichever provider the envelope ended up stamped with */
  if (envelope?.fallbackUsed === true) receipt += STEWARD_RECEIPT_FALLBACK;
  const line = document.createElement("p");
  line.className = "steward-receipt";
  line.textContent = receipt;
  turn.appendChild(line);
}

function stewardActionKey(turn, nextStep) {
  const action = stewardResolveNextStep(nextStep);
  if (!turn || !action) return;
  const row = document.createElement("p");
  row.className = "steward-turn-action";
  const key = document.createElement("button");
  key.type = "button";
  key.className = "steward-key";
  const label = document.createElement("span");
  label.textContent = action.label;
  key.appendChild(label);
  key.addEventListener("click", action.run);
  row.appendChild(key);
  turn.appendChild(row);
  stewardScrollLog();
}

/* ---------- Steward · the provider mode strip and the consent gate ----------

   Three rules hold this section together:
   1. Local is the default, the fallback, and the only mode this deck will ever
      select on its own. A stored cloud mode is only honoured when the stored
      consent for that same provider is also present AND the server still says
      the provider is configured.
   2. Nothing is sent to a cloud provider until the user has read, in this
      panel, exactly what leaves the machine — including the real packet, on
      request, fetched from the server and rendered as text.
   3. Every word in the panel is a constant in this file. The server supplies
      booleans, ids and numbers; it never supplies a sentence about privacy. */

const STEWARD_MODE_KEY = "steward.assistantMode";
const STEWARD_CONSENT_KEYS = {
  openai: "steward.consent.openai",
  anthropic: "steward.consent.anthropic",
};

const STEWARD_MODES = [
  { mode: "local", label: "LOCAL" },
  { mode: "openai", label: "OPENAI" },
  { mode: "anthropic", label: "CLAUDE" },
];
const STEWARD_CLOUD_MODES = new Set(["openai", "anthropic"]);
const STEWARD_PROVIDER_NAMES = { openai: "OpenAI", anthropic: "Anthropic" };
const STEWARD_MODE_UNAVAILABLE = "no api key configured";
const STEWARD_MODE_LABEL_PREFIX = "answer mode · ";

const STEWARD_CONSENT_HEAD = "▸ before this leaves the mac";
const STEWARD_CONSENT_SENTENCE = {
  openai: "questions and the redacted measurements below leave this mac and are sent to OpenAI.",
  anthropic: "questions and the redacted measurements below leave this mac and are sent to Anthropic.",
};
const STEWARD_CONSENT_SCOPE = "no project names. no file paths. no fallback to another provider.";
const STEWARD_CONSENT_RETENTION = {
  openai: "openai says api data is not used for training by default; abuse-monitoring copies may persist up to 30 days.",
  anthropic: "retention depends on the account's agreement with anthropic. not necessarily zero.",
};
const STEWARD_CONSENT_PREVIEW_KEY = "PREVIEW CONTEXT";
const STEWARD_CONSENT_PREVIEW_BUSY = "READING…";
const STEWARD_CONSENT_PREVIEW_FAIL = "context unavailable. nothing has been sent.";
const STEWARD_CONSENT_PREVIEW_EMPTY = "the packet is empty right now.";
const STEWARD_CONSENT_ALLOW = "ALLOW";
const STEWARD_CONSENT_CANCEL = "CANCEL";
const STEWARD_CONSENT_TIMEOUT_MS = 8000;
const STEWARD_CONTEXT_MAX_ROWS = 120;

const stewardShellInner = stewardDock?.querySelector(".steward-shell-inner");
const stewardModesEl = stewardDock?.querySelector("[data-steward-modes]");
const stewardModeChip = stewardDock?.querySelector("[data-steward-mode-chip]");
const stewardModeChipLabel = stewardDock?.querySelector("[data-steward-mode-chip-label]");
const stewardModePop = stewardDock?.querySelector("[data-steward-mode-pop]");
const stewardModeKeysEl = stewardDock?.querySelector("[data-steward-mode-keys]");
const stewardConsentEl = stewardDock?.querySelector("[data-steward-consent]");

let stewardMode = "local";
let stewardProviders = null;
let stewardModesChecked = false;
let stewardModePopOpen = false;
let stewardConsentPending = null;
let stewardConsentReturnKey = null;

function stewardConsentGranted(mode) {
  const key = Object.hasOwn(STEWARD_CONSENT_KEYS, mode) ? STEWARD_CONSENT_KEYS[mode] : "";
  return Boolean(key) && stewardReadStore(key) === "granted";
}

function stewardProviderReady(mode) {
  if (mode === "local") return true;
  return Boolean(stewardProviders && stewardProviders[mode] === true);
}

/* ---- the chip and its picker ----

   The mode used to own a full-width row of the shell. It is one keycap on the
   prompt row now; the same three radios live in a small deck-styled picker that
   opens above it. Nothing about the consent flow moved — it is simply opened
   from here. */

function stewardModeKeys() {
  return stewardModeKeysEl ? [...stewardModeKeysEl.querySelectorAll("[data-steward-mode]")] : [];
}

function stewardModeLabel(mode) {
  return STEWARD_MODES.find((entry) => entry.mode === mode)?.label || "LOCAL";
}

function stewardModeSync() {
  stewardModeKeys().forEach((key) => {
    const selected = key.dataset.stewardMode === stewardMode;
    key.setAttribute("aria-checked", String(selected));
    /* roving tabindex — the group is one tab stop, arrows move inside it */
    key.tabIndex = selected ? 0 : -1;
  });
  /* the chip is the picker's closed state: it always reads the live mode */
  if (stewardModeChipLabel) stewardModeChipLabel.textContent = stewardModeLabel(stewardMode);
}

/* a press anywhere outside the chip and its picker closes it — captured, so a
   control that stops propagation cannot leave the picker stranded open */
function stewardModePopOutside(event) {
  if (!stewardModesEl || stewardModesEl.contains(event.target)) return;
  stewardModePopClose(false);
}

/* the picker is a small trap while it is open: Tab cycles inside it, so focus
   never lands on a control the picker is covering */
function stewardModePopKeydown(event) {
  if (event.key === "Escape") {
    /* the picker answers Escape before the input and the shell do */
    event.stopPropagation();
    event.preventDefault();
    stewardModePopClose(true);
    return;
  }
  if (event.key !== "Tab") return;
  const keys = stewardModeKeys().filter((key) => !key.disabled);
  if (keys.length === 0) return;
  event.preventDefault();
  const at = keys.indexOf(document.activeElement);
  const next = keys[((at < 0 ? 0 : at) + (event.shiftKey ? -1 : 1) + keys.length) % keys.length];
  next.focus({ preventScroll: true });
}

function stewardModePopShow() {
  if (!stewardModePop || !stewardModeChip || stewardModePopOpen) return;
  if (stewardModesEl?.hidden) return;
  stewardModePopOpen = true;
  stewardModePop.hidden = false;
  /* the picker stands inside the shell's own clip, and an empty log would leave
     it nowhere to stand — the column reserves the room while it is open */
  stewardConvo?.classList.add("is-picking");
  stewardModeChip.setAttribute("aria-expanded", "true");
  document.addEventListener("pointerdown", stewardModePopOutside, true);
  const keys = stewardModeKeys().filter((key) => !key.disabled);
  const checked = keys.find((key) => key.dataset.stewardMode === stewardMode);
  (checked || keys[0] || stewardModeChip).focus({ preventScroll: true });
}

function stewardModePopClose(returnFocus = true) {
  if (!stewardModePop || !stewardModePopOpen) return;
  stewardModePopOpen = false;
  const hadFocus = stewardModePop.contains(document.activeElement);
  stewardModePop.hidden = true;
  stewardConvo?.classList.remove("is-picking");
  stewardModeChip?.setAttribute("aria-expanded", "false");
  document.removeEventListener("pointerdown", stewardModePopOutside, true);
  if (returnFocus && hadFocus) stewardModeChip?.focus({ preventScroll: true });
}

function stewardModePopToggle() {
  if (stewardModePopOpen) stewardModePopClose();
  else stewardModePopShow();
}

function stewardModeApply(mode) {
  stewardMode = STEWARD_MODES.some((entry) => entry.mode === mode) ? mode : "local";
  stewardWriteStore(STEWARD_MODE_KEY, stewardMode);
  stewardModeSync();
}

function stewardModeMove(step) {
  const keys = stewardModeKeys().filter((key) => !key.disabled);
  if (keys.length === 0) return;
  const at = keys.findIndex((key) => key.dataset.stewardMode === stewardMode);
  const next = keys[((at < 0 ? 0 : at) + step + keys.length) % keys.length];
  next.focus({ preventScroll: true });
  stewardModeSelect(next.dataset.stewardMode, next);
}

/* the one door into a cloud mode: consent first, switch second */
function stewardModeSelect(mode, key) {
  if (!mode || mode === stewardMode) return;
  if (!stewardProviderReady(mode)) return;
  if (mode === "local") {
    stewardConsentCancel(false);
    stewardModeApply("local");
    return;
  }
  if (stewardConsentGranted(mode)) {
    stewardModeApply(mode);
    return;
  }
  /* the picker gets out of the way before the question is asked, and the chip —
     not a key inside a panel that is now hidden — is where a no returns focus */
  stewardModePopClose(false);
  stewardConsentOpen(mode, stewardModeChip || key);
}

function stewardModesRender() {
  if (!stewardModeKeysEl || !stewardModesEl) return;
  stewardModeKeysEl.textContent = "";
  STEWARD_MODES.forEach((entry) => {
    const key = document.createElement("button");
    key.type = "button";
    key.className = "steward-key steward-mode-key";
    key.dataset.stewardMode = entry.mode;
    key.setAttribute("role", "radio");
    key.setAttribute("aria-checked", "false");
    key.setAttribute("aria-label", `${STEWARD_MODE_LABEL_PREFIX}${entry.label}`);
    const label = document.createElement("span");
    label.textContent = entry.label;
    key.appendChild(label);
    if (!stewardProviderReady(entry.mode)) {
      key.disabled = true;
      key.title = STEWARD_MODE_UNAVAILABLE;
    }
    key.addEventListener("click", () => {
      stewardModeSelect(entry.mode, key);
      /* a click — or Enter/Space on the radio — is a decision, so the picker
         closes. Arrow keys only move the selection and leave it open. */
      if (!stewardConsentPending) stewardModePopClose(true);
    });
    key.addEventListener("keydown", (event) => {
      if (event.key === "ArrowRight" || event.key === "ArrowDown") {
        event.preventDefault();
        stewardModeMove(1);
      } else if (event.key === "ArrowLeft" || event.key === "ArrowUp") {
        event.preventDefault();
        stewardModeMove(-1);
      }
    });
    stewardModeKeysEl.appendChild(key);
  });
  stewardModeSync();
  stewardModesEl.hidden = false;
}

/* ---- feature detection · one request per session ----
   No providers endpoint means an older server: the strip never appears and the
   deck behaves exactly as it did before this existed. */
async function stewardModesCheck() {
  if (stewardModesChecked || !stewardModesEl || typeof fetch !== "function") return;
  stewardModesChecked = true;
  let payload = null;
  try {
    const response = await fetch("/api/assistant/providers", { headers: { Accept: "application/json" } });
    if (!response.ok) return;
    payload = await response.json();
  } catch {
    return;
  }
  if (!payload || typeof payload !== "object") return;
  stewardProviders = {
    local: true,
    openai: payload.openai === true,
    anthropic: payload.anthropic === true,
  };
  /* a stored cloud mode is honoured only when its consent is still stored and
     the server still says it is configured — otherwise this opens on local */
  const stored = stewardReadStore(STEWARD_MODE_KEY);
  if (STEWARD_CLOUD_MODES.has(stored) && stewardProviderReady(stored) && stewardConsentGranted(stored)) {
    stewardMode = stored;
  } else {
    stewardMode = "local";
  }
  stewardModesRender();
}

/* ---- the consent panel ---- */

function stewardConsentRow(text, className) {
  const line = document.createElement("p");
  line.className = className;
  line.textContent = text;
  return line;
}

/* the packet is ids and numbers; it is flattened into one text row per leaf and
   never interpreted, never used as markup, never used as a selector */
function stewardContextRows(value, path = "", rows = []) {
  if (rows.length >= STEWARD_CONTEXT_MAX_ROWS) return rows;
  if (value === null || typeof value !== "object") {
    rows.push(`${path || "value"} · ${String(value)}`);
    return rows;
  }
  if (Array.isArray(value)) {
    value.forEach((item, index) => stewardContextRows(item, `${path}[${index}]`, rows));
    return rows;
  }
  Object.keys(value).forEach((childKey) => {
    stewardContextRows(value[childKey], path ? `${path}.${childKey}` : childKey, rows);
  });
  return rows;
}

async function stewardConsentPreview(button, well) {
  if (button.disabled) return;
  const label = button.querySelector("span") || button;
  button.disabled = true;
  label.textContent = STEWARD_CONSENT_PREVIEW_BUSY;
  well.hidden = false;
  well.textContent = "";
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STEWARD_CONSENT_TIMEOUT_MS);
  try {
    const response = await fetch("/api/assistant/context", {
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new Error("context");
    const packet = await response.json();
    const rows = stewardContextRows(packet);
    if (rows.length === 0) {
      well.textContent = STEWARD_CONSENT_PREVIEW_EMPTY;
    } else {
      rows.forEach((row) => {
        const line = document.createElement("p");
        line.className = "steward-consent-row";
        line.textContent = row;
        well.appendChild(line);
      });
    }
  } catch {
    well.textContent = STEWARD_CONSENT_PREVIEW_FAIL;
  } finally {
    clearTimeout(timer);
    label.textContent = STEWARD_CONSENT_PREVIEW_KEY;
    button.disabled = false;
  }
}

function stewardConsentClose() {
  if (!stewardConsentEl) return;
  stewardConsentPending = null;
  stewardConsentEl.textContent = "";
  stewardConsentEl.hidden = true;
  stewardShellInner?.classList.remove("is-consenting");
}

/* cancel leaves the previous mode exactly where it was — the strip is re-synced
   from stewardMode rather than from whatever the user just pressed */
function stewardConsentCancel(returnFocus = true) {
  if (!stewardConsentPending) return;
  const key = stewardConsentReturnKey;
  stewardConsentReturnKey = null;
  stewardConsentClose();
  stewardModeSync();
  if (returnFocus && key?.isConnected) key.focus({ preventScroll: true });
}

function stewardConsentAllow(mode) {
  const storeKey = Object.hasOwn(STEWARD_CONSENT_KEYS, mode) ? STEWARD_CONSENT_KEYS[mode] : "";
  if (storeKey) stewardWriteStore(storeKey, "granted");
  stewardConsentReturnKey = null;
  stewardConsentClose();
  stewardModeApply(mode);
  stewardInput?.focus({ preventScroll: true });
}

function stewardConsentOpen(mode, key) {
  if (!stewardConsentEl || !Object.hasOwn(STEWARD_CONSENT_SENTENCE, mode)) return;
  stewardConsentPending = mode;
  stewardConsentReturnKey = key || null;
  stewardConsentEl.textContent = "";
  stewardConsentEl.hidden = false;
  stewardShellInner?.classList.add("is-consenting");

  const panel = document.createElement("div");
  panel.className = "steward-consent-panel";
  panel.setAttribute("role", "group");
  panel.setAttribute("aria-label", `${STEWARD_PROVIDER_NAMES[mode]} — send data off this mac?`);

  panel.appendChild(stewardConsentRow(STEWARD_CONSENT_HEAD, "steward-consent-head"));
  panel.appendChild(stewardConsentRow(STEWARD_PROVIDER_NAMES[mode], "steward-consent-provider"));
  panel.appendChild(stewardConsentRow(STEWARD_CONSENT_SENTENCE[mode], "steward-consent-line"));

  const previewRow = document.createElement("p");
  previewRow.className = "steward-consent-actions";
  const preview = document.createElement("button");
  preview.type = "button";
  preview.className = "steward-key";
  const previewLabel = document.createElement("span");
  previewLabel.textContent = STEWARD_CONSENT_PREVIEW_KEY;
  preview.appendChild(previewLabel);
  previewRow.appendChild(preview);
  panel.appendChild(previewRow);

  const well = document.createElement("div");
  well.className = "steward-consent-well";
  well.hidden = true;
  well.tabIndex = 0;
  well.setAttribute("role", "region");
  well.setAttribute("aria-label", "the packet that would be sent");
  panel.appendChild(well);
  preview.addEventListener("click", () => stewardConsentPreview(preview, well));

  panel.appendChild(stewardConsentRow(STEWARD_CONSENT_SCOPE, "steward-consent-line"));
  panel.appendChild(stewardConsentRow(STEWARD_CONSENT_RETENTION[mode], "steward-consent-retention"));

  const actions = document.createElement("p");
  actions.className = "steward-consent-actions";
  const allow = document.createElement("button");
  allow.type = "button";
  allow.className = "steward-key steward-consent-allow";
  const allowLabel = document.createElement("span");
  allowLabel.textContent = STEWARD_CONSENT_ALLOW;
  allow.appendChild(allowLabel);
  allow.addEventListener("click", () => stewardConsentAllow(mode));
  const cancel = document.createElement("button");
  cancel.type = "button";
  cancel.className = "steward-key";
  const cancelLabel = document.createElement("span");
  cancelLabel.textContent = STEWARD_CONSENT_CANCEL;
  cancel.appendChild(cancelLabel);
  cancel.addEventListener("click", () => stewardConsentCancel(true));
  actions.append(allow, cancel);
  panel.appendChild(actions);

  /* Escape answers the question with no, and stops before the shell's own
     Escape handler so one key press does not do two things */
  panel.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    event.stopPropagation();
    event.preventDefault();
    stewardConsentCancel(true);
  });

  stewardConsentEl.appendChild(panel);
  allow.focus({ preventScroll: true });
}

/* ---- the prompt row ---- */

function stewardAskBusy(busy) {
  if (stewardInput) stewardInput.disabled = busy;
  if (stewardAskKey) stewardAskKey.disabled = busy;
  stewardConvo?.setAttribute("aria-busy", String(busy));
}

/* the row is replaced, not hidden: with no endpoint there is nothing to ask */
function stewardAskGoOffline() {
  stewardAskOffline = true;
  stewardAskBusy(false);
  /* with no endpoint there is nothing to route, so the mode chip goes too */
  stewardConsentCancel(false);
  stewardModePopClose(false);
  if (stewardModesEl) stewardModesEl.hidden = true;
  if (!stewardPromptForm?.isConnected) return;
  const note = document.createElement("p");
  note.className = "steward-offline";
  note.textContent = STEWARD_ASK_OFFLINE;
  stewardPromptForm.replaceWith(note);
}

/* the same settle the charge gesture uses — he returns to the state the
   telemetry last put him in, never to a state this path invented */
function stewardAskSettle() {
  if (!stewardDock) return;
  if (stewardDock.getAttribute("data-state") !== "scanning") return;
  stewardSet(stewardRestState);
}

async function stewardAsk(raw) {
  if (stewardAskInFlight || stewardAskOffline || !stewardLogEl) return;
  const message = String(raw || "").trim().slice(0, STEWARD_ASK_MAX);
  if (!message) return;

  if (stewardInput) stewardInput.value = "";
  /* the mode is read once, at send: a switch mid-flight cannot relabel this turn */
  const mode = stewardProviderReady(stewardMode) ? stewardMode : "local";
  const turn = stewardOpenTurn(message);
  stewardAskInFlight = true;
  stewardAskBusy(true);
  /* honest: a fetch really is in flight, and scanning is the state that says so.
     On a cloud ask the word line names the destination instead of the default. */
  stewardSet("scanning", Object.hasOwn(STEWARD_ASK_CLOUD_LINES, mode) ? STEWARD_ASK_CLOUD_LINES[mode] : "");

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), STEWARD_ASK_TIMEOUT_MS);
  let offline = false;

  try {
    const response = await fetch("/api/assistant", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      /* the body is exactly the two fields the contract allows */
      body: JSON.stringify({ message, mode }),
      signal: controller.signal,
    });

    if (response.status === 501 && mode !== "local") {
      /* the key is missing, not the assistant — say which, and fall back to the
         only mode that never needed a key */
      stewardReplyLine(turn, STEWARD_ASK_UNCONFIGURED, "unavailable");
      stewardModeApply("local");
    } else if (response.status === 501 || response.status === 404) {
      offline = true;
      stewardReplyLine(turn, STEWARD_ASK_OFFLINE, "unavailable");
    } else if (!response.ok) {
      stewardReplyLine(turn, STEWARD_ASK_FAILURE, "unavailable");
    } else {
      const envelope = await response.json();
      const text = typeof envelope?.message === "string" ? envelope.message.trim() : "";
      if (!text) {
        stewardReplyLine(turn, STEWARD_ASK_FAILURE, "unavailable");
      } else {
        stewardReplyLine(turn, text, envelope.epistemicState);
        stewardReceiptLine(turn, envelope);
        stewardActionKey(turn, envelope.nextStep);
        stewardExpress(envelope?.presentation?.expression);
        /* the honesty cue wins the eyes: a cloud ask that came back local is
           the one thing the character should not look calm about */
        if (envelope?.fallbackUsed === true) stewardExpressFallback();
      }
    }
  } catch {
    /* a dropped connection, a timeout, a body that is not json — one line, no retry */
    stewardReplyLine(turn, STEWARD_ASK_FAILURE, "unavailable");
  } finally {
    clearTimeout(timer);
    stewardAskInFlight = false;
    stewardAskSettle();
    if (offline) stewardAskGoOffline();
    else {
      stewardAskBusy(false);
      if (stewardShellOpenState) stewardInput?.focus({ preventScroll: true });
    }
  }
}

/* one request-free check, on first open: if this build cannot make the call at
   all, the row says so instead of pretending to be a prompt */
function stewardConvoCheck() {
  if (stewardConvoChecked) return;
  stewardConvoChecked = true;
  if (typeof fetch !== "function") stewardAskGoOffline();
}

function setupStewardModeChip() {
  if (!stewardModeChip || !stewardModePop) return;
  stewardModeChip.addEventListener("click", stewardModePopToggle);
  stewardModePop.addEventListener("keydown", stewardModePopKeydown);
}

function setupStewardConvo() {
  setupStewardModeChip();
  if (!stewardPromptForm) return;
  stewardPromptForm.addEventListener("submit", (event) => {
    event.preventDefault();
    stewardAsk(stewardInput?.value);
  });
  stewardInput?.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    /* first Escape leaves the field, second one closes the shell — so the key
       never throws away a half-typed question */
    event.stopPropagation();
    stewardInput.blur();
    stewardBadge?.focus({ preventScroll: true });
  });
}

/* ---- the voice bank ---- */

function stewardBand(percent) {
  const value = numberOr(percent);
  if (value >= 100) return 100;
  if (value >= 90) return 90;
  if (value >= 80) return 80;
  if (value >= 70) return 70;
  if (value >= 60) return 60;
  return 0;
}

function stewardVoiceLine({ disk, snapshots, categories, change }) {
  const stored = stewardReadStore(STEWARD_BAND_KEY);
  const previous = stored === null || stored === "" ? null : Number(stored);
  const band = stewardBand(disk.usedPercent);
  /* a band only speaks when it went up since the last visit */
  if (previous !== null && Number.isFinite(previous) && band > stewardBand(previous) && STEWARD_BAND_LINES[band]) {
    /* the deck echoes the crossing once, on the bar that shows the band */
    stewardBandCrossed = true;
    return STEWARD_BAND_LINES[band];
  }
  if (snapshots.length === 1) return "one reading. nothing to compare it to.";
  if (snapshots.length === 2) return "two readings now. i can start comparing.";
  if (categories.length > 0 && categories.every((category) => numberOr(category?.deltaBytes) === 0)) {
    return "nothing moved. that is the report.";
  }
  if (change > 5 * GIB) return `up ${stewardGb(change)} gb overnight.`;
  if (change < -5 * GIB) return `down ${stewardGb(Math.abs(change))} gb. someone was busy.`;
  return "";
}

/* ---- the daily brief ---- */

function stewardTodayKey() {
  return localDateKey(new Date(), "Europe/Belgrade");
}

function stewardBriefingDue() {
  const today = stewardTodayKey();
  return Boolean(today) && stewardReadStore(STEWARD_BRIEF_KEY) !== today;
}

function stewardMarkBriefDay() {
  const today = stewardTodayKey();
  if (today) stewardWriteStore(STEWARD_BRIEF_KEY, today);
}

/* ---- the report ---- */

/* only these three tokens carry a verdict; everything else — medium, high,
   review, or a risk the collector never wrote — is not his to call reclaimable */
const STEWARD_SAFE_RISKS = new Set(["safe", "low", "rebuildable"]);

function stewardReadDisk(latest) {
  const disk = diskState(latest);
  const items = arrayOr(latest?.reclaimable);
  const sum = (predicate) => items
    .filter((item) => predicate(safeToken(item?.risk, ["safe", "rebuildable", "low", "medium", "high", "review"], "review")))
    .reduce((total, item) => total + Math.max(0, numberOr(item?.bytes)), 0);
  const safeBytes = sum((risk) => STEWARD_SAFE_RISKS.has(risk));
  const reviewBytes = sum((risk) => !STEWARD_SAFE_RISKS.has(risk));
  return { disk, safeBytes, reviewBytes, reclaimable: safeBytes + reviewBytes };
}

function stewardDecide(context) {
  const { disk, safeBytes, reviewBytes, reclaimable, snapshots, categories, voice } = context;
  /* the one-reading pose owns the grid wherever he ends up resting */
  if (snapshots.length === 1) stewardCellOverride = STEWARD_POSE_ONE_READING;

  if (disk.availablePercent < 6) {
    stewardSet("full", voice || `${stewardGb(disk.used, 0)} of ${stewardGb(disk.capacity, 0)} gb. i cannot help you.`);
    return;
  }
  if (disk.availablePercent < 12) {
    stewardSet("watching", voice || "space is running low. worth a look this week.");
    return;
  }
  if (reclaimable > 0) {
    stewardRestState = "resting";
    /* "reclaimable" is a verdict, so only bytes he can stand behind are counted.
       When nothing clears that bar he hands the call back instead of inflating it. */
    const found = safeBytes > 0
      ? `${stewardGb(safeBytes)} gb reclaimable. i can wait.`
      : `${stewardGb(reviewBytes)} gb worth a review. your call.`;
    stewardSet("found", voice || found);
    return;
  }
  /* empty-data poses replace the generic resting pose */
  if (categories.length > 0 && categories.every((category) => numberOr(category?.deltaBytes) === 0)) {
    stewardSet("bored", voice || "nothing moved. that is the report.");
    return;
  }
  if (snapshots.length === 1) {
    stewardSet("resting", voice || "one reading. nothing to compare it to.");
    return;
  }
  stewardSet("resting", voice);
}

/* the band-crossing alert: the DISK USED bar flushes amber once, then stops.
   No red, no loop — the crossing is news, not an alarm. */
function stewardPulseBandBar() {
  const bar = document.querySelector("[data-band-bar]");
  if (!bar) return;
  bar.classList.remove("is-band-alert");
  void bar.offsetWidth;
  bar.classList.add("is-band-alert");
  stewardChargeTimeout(() => bar.classList.remove("is-band-alert"), 1400);
}

function stewardReport(data, fallbackCount) {
  if (!stewardDock) return;
  clearTimeout(stewardBriefTimer);
  clearTimeout(stewardBriefLineTimer);
  stewardData = data || {};
  stewardCellOverride = null;
  stewardBandCrossed = false;

  const latest = stewardData.latest;
  const { disk, safeBytes, reviewBytes, reclaimable } = stewardReadDisk(latest);
  stewardSetFill(disk.usedPercent);
  stewardRenderShell();

  if (fallbackCount > 0) {
    /* preview data is not telemetry — the voice bank stays quiet */
    stewardSet("preview", "scan files missing. this is a preview.");
    return;
  }

  const snapshots = validSnapshots(stewardData.history);
  const categories = arrayOr(latest?.categories);
  const summary = deriveSummary(latest, stewardData.history);
  const voice = stewardVoiceLine({ disk, snapshots, categories, change: summary.change });
  stewardWriteStore(STEWARD_BAND_KEY, String(disk.usedPercent));
  if (stewardBandCrossed) stewardPulseBandBar();

  const context = { disk, safeBytes, reviewBytes, reclaimable, snapshots, categories, voice };

  if (stewardBriefingActive) {
    stewardBriefingActive = false;
    stewardMarkBriefDay();
    const changed = categories.filter((category) => Math.abs(numberOr(category?.deltaBytes)) > 0).length;
    const line = changed === 0
      ? "morning. nothing moved overnight."
      : `morning. ${changed} thing${changed === 1 ? "" : "s"} moved overnight.`;
    /* he is the last instrument in the briefing sequence: gauge 0, tiles 90,
       movement 180, console 270, his word 360 */
    stewardSet("briefing");
    stewardBriefLineTimer = setTimeout(() => stewardShowLine(line, true), STEWARD_BRIEF_LINE_MS);
    stewardBriefTimer = setTimeout(() => stewardDecide(context), STEWARD_BRIEF_MS);
    return;
  }

  stewardDecide(context);
}

function stewardActivity() {
  if (!stewardDock) return;
  if (stewardDock.getAttribute("data-state") === "asleep") {
    /* rule 5 — real activity cancels the idle antic instantly, mid-animation */
    stewardSet(stewardRestState);
    stewardActivityStamp = Date.now();
    return;
  }
  const now = Date.now();
  if (now - stewardActivityStamp < 1000) return;
  stewardActivityStamp = now;
  stewardArmIdle();
}

function stewardBadgePress() {
  stewardShellToggle();
  const now = Date.now();
  if (stewardLastLine !== stewardRepeatLine || now - stewardRepeatStart > STEWARD_REPEAT_MS) {
    stewardRepeatLine = stewardLastLine;
    stewardRepeatStart = now;
    stewardRepeatCount = 0;
  }
  stewardRepeatCount += 1;
  if (stewardLastLine && stewardRepeatCount >= 3) {
    stewardRepeatCount = 0;
    stewardRepeatLine = "";
    stewardSet("refuse-repeat", "you asked that. answer has not changed.");
    return;
  }
  if (stewardLastLine) stewardShowLine(stewardLastLine);
  stewardArmIdle();
}

function setupSteward() {
  if (!stewardDock) return;
  stewardBadge?.addEventListener("click", stewardBadgePress);
  const options = { passive: true };
  window.addEventListener("scroll", stewardActivity, options);
  window.addEventListener("pointermove", stewardActivity, options);
  window.addEventListener("keydown", stewardActivity, options);
  window.addEventListener("pointermove", stewardGazeMove, options);
  window.addEventListener("blur", stewardGazeDrop);
  document.addEventListener("pointerleave", stewardGazeDrop);
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || !stewardShellOpenState) return;
    stewardShellClose();
  });
  setupStewardTabs();
  setupStewardConvo();
  stewardApplyCells(stewardDock.getAttribute("data-state"));
  stewardArmIdle();
}

refreshButton.addEventListener("click", () => loadBrief({ announce: true }));

setupTheme();
setupSteward();
loadBrief();
