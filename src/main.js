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
  "oklch(0.75 0.145 91)",
  "oklch(0.37 0.095 275)",
  "oklch(0.62 0.07 252)",
  "oklch(0.68 0.075 145)",
  "oklch(0.58 0.09 50)",
  "oklch(0.78 0.025 275)",
  "oklch(0.53 0.08 325)",
];

const app = document.querySelector("#app");
const freshness = document.querySelector("#data-freshness");
const refreshButton = document.querySelector("#refresh-button");
const liveRegion = document.querySelector("#live-region");
let activeRequest = null;
let navObserver = null;
let selectedLessonId = null;
let activeLessonsData = FALLBACK_DATA.lessons;

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
  const strongest = changed[0];
  const status = disk.availablePercent >= 12
    ? { label: "Comfortable for now", note: "Nothing needs cleaning this morning. The useful signal is what grows back after the reset." }
    : disk.availablePercent >= 6
      ? { label: "Worth watching", note: "There is working room, but another large toolchain download could tighten it quickly." }
      : { label: "Close to the edge", note: "Start with high-confidence, reproducible data and review every personal file separately." };
  const movement = summary.change === 0 ? "No clear net change" : summary.change > 0
    ? `${formatBytes(summary.change)} used`
    : `${formatBytes(Math.abs(summary.change))} returned`;

  return `
    <section class="page-section today-section" id="today" data-observed-section aria-labelledby="today-heading">
      <div class="brief-intro">
        <div class="brief-copy">
          <p class="salutation">Good morning.</p>
          <h1 id="today-heading">${escapeHtml(summary.headline)}</h1>
          <p class="brief-body">${escapeHtml(summary.body)}</p>
        </div>

        <aside class="space-pulse" aria-label="Current available storage">
          <p class="pulse-label">Room on the Mac</p>
          <p class="pulse-value">${formatBytes(disk.available)}</p>
          <p class="pulse-context">available of ${formatBytes(disk.capacity)}</p>
          <div class="meter" role="progressbar" aria-label="Available storage" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${disk.availablePercent.toFixed(1)}">
            <span style="--meter-value: ${disk.availablePercent.toFixed(2)}%"></span>
          </div>
          <p class="pulse-note"><strong>${escapeHtml(status.label)}.</strong> ${escapeHtml(status.note)}</p>
        </aside>
      </div>

      <dl class="brief-facts" aria-label="Today at a glance">
        <div>
          <dt>Since the last reading</dt>
          <dd>${escapeHtml(movement)}</dd>
        </div>
        <div>
          <dt>Disk in use</dt>
          <dd>${disk.usedPercent.toFixed(1)}%</dd>
        </div>
        <div>
          <dt>Observed</dt>
          <dd>${escapeHtml(formatDate(latest?.generatedAt, "short"))}, ${escapeHtml(formatClock(latest?.generatedAt))}</dd>
        </div>
        <div>
          <dt>Next quiet check</dt>
          <dd>Tomorrow at 09:00</dd>
        </div>
      </dl>

      <div class="today-evidence">
        <div>
          <div class="subsection-heading">
            <h2>What moved</h2>
            <p>${strongest ? `The clearest attribution is ${escapeHtml(strongest.label)}.` : "No category crossed the reporting threshold."}</p>
          </div>
          ${renderChangeList(changed)}
        </div>
        <aside class="steward-note">
          <p class="note-title">Steward’s note</p>
          <p>${escapeHtml(latest?.trend?.message || status.note)}</p>
          <dl>
            <div>
              <dt>Watching for</dt>
              <dd>${escapeHtml(milestoneLabel(latest?.trend?.nextMilestone))}</dd>
            </div>
            <div>
              <dt>Today’s action</dt>
              <dd>Observe only</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>
  `;
}

function renderChangeList(categories) {
  if (categories.length === 0) {
    return `
      <div class="empty-state">
        <p><strong>A quiet reading.</strong> Steward found no category-level movement worth interrupting you for.</p>
      </div>
    `;
  }

  return `
    <ol class="change-list">
      ${categories.map((category, index) => {
        const delta = numberOr(category?.deltaBytes);
        const direction = delta > 0 ? "grew" : "shrank";
        const directionClass = delta > 0 ? "growth" : "reduction";
        return `
          <li>
            <span class="change-rank" aria-hidden="true">${index + 1}</span>
            <span class="change-name">
              <strong>${escapeHtml(category?.label || "Unnamed category")}</strong>
              <span>${escapeHtml(kindLabel(category?.kind))}</span>
            </span>
            <span class="change-value ${directionClass}">${escapeHtml(direction)} ${formatBytes(Math.abs(delta))}</span>
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
    <section class="page-section" id="storage" data-observed-section aria-labelledby="storage-heading">
      <header class="section-header">
        <div>
          <p class="section-name">Storage story</p>
          <h2 id="storage-heading">Where the weight lives</h2>
        </div>
        <p>Composition explains the current state. Change explains whether it deserves attention.</p>
      </header>

      <div class="storage-layout">
        <figure class="composition-figure">
          <figcaption>
            <span>Observed composition</span>
            <strong>${formatBytes(categoryTotal)}</strong>
          </figcaption>
          ${renderCompositionBar(categories, categoryTotal)}
          ${renderCategoryLegend(categories, categoryTotal)}
        </figure>

        <div class="trend-panel">
          <div class="trend-heading">
            <div>
              <p>Free-space trace</p>
              <h3>${escapeHtml(titleCase(latest?.trend?.state || "watching"))}</h3>
            </div>
            <span>${validSnapshots(history).length} readings</span>
          </div>
          ${renderHistoryChart(history)}
        </div>
      </div>

      ${projects.length ? `
        <div class="project-slice">
          <div class="subsection-heading subsection-heading-split">
            <div>
              <h3>Project footprint</h3>
              <p>Generated files are separated from the work they came from.</p>
            </div>
            <p class="quiet-label">Largest observed projects</p>
          </div>
          <div class="project-table" role="table" aria-label="Largest project storage footprints">
            <div class="project-table-head" role="row">
              <span role="columnheader">Project</span>
              <span role="columnheader">Total</span>
              <span role="columnheader">Rebuildable</span>
              <span role="columnheader">Source control</span>
            </div>
            ${projects.slice(0, 6).map((project) => `
              <div class="project-row" role="row">
                <strong role="cell">${escapeHtml(project?.name || "Unnamed project")}</strong>
                <span role="cell">${formatBytes(project?.bytes)}</span>
                <span role="cell">${formatBytes(project?.generatedBytes)}</span>
                <span role="cell">${project?.hasGit ? "Git detected" : "Not detected"}</span>
              </div>
            `).join("")}
          </div>
        </div>
      ` : ""}

      ${renderRecommendations(latest?.reclaimable)}
    </section>
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
    `<span data-ram-slot="${index}" aria-hidden="true"></span>`
  )).join("");
  const swapSlots = Array.from({ length: 4 }, (_, index) => (
    `<span data-swap-slot="${index}" aria-hidden="true"></span>`
  )).join("");

  return `
    <figure class="memory-lab" data-memory-lab data-pressure="light">
      <figcaption>
        <div>
          <p>Try it · simplified model</p>
          <h3 id="memory-lab-heading">${escapeHtml(interaction?.title || "Set your workbench")}</h3>
        </div>
        <span>Example, not a live reading</span>
      </figcaption>

      <p class="lab-prompt">${escapeHtml(interaction?.prompt || "Change the workload and watch where active work goes.")}</p>

      <div class="workload-presets" role="group" aria-label="Example workloads">
        ${presets.map((preset, index) => `
          <button
            class="workload-preset"
            type="button"
            data-memory-preset="${Math.min(12, Math.max(1, numberOr(preset?.value)))}"
            aria-pressed="${index === 0 ? "true" : "false"}"
          >${escapeHtml(preset?.label || "Workload")}</button>
        `).join("")}
      </div>

      <label class="workload-control">
        <span>
          <strong>Workload intensity</strong>
          <output data-workload-output>${initialValue} ${escapeHtml(interaction?.unit || "points")}</output>
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
              <p>The workbench</p>
              <h4 id="ram-zone-title">RAM</h4>
            </div>
            <strong data-ram-count>4 / 8</strong>
          </header>
          <div class="resource-slots ram-slots" aria-hidden="true">${ramSlots}</div>
          <p>Fast, temporary room for what is active now.</p>
        </section>

        <div class="memory-handoff" aria-hidden="true">
          <span></span>
          <p>overflow</p>
        </div>

        <section class="resource-zone storage-zone" aria-labelledby="storage-zone-title">
          <header>
            <div>
              <p>The cabinet</p>
              <h4 id="storage-zone-title">SSD storage</h4>
            </div>
            <strong>persistent</strong>
          </header>
          <div class="storage-shelves" aria-hidden="true">
            <span></span><span></span><span></span><span></span><span></span>
          </div>
          <div class="swap-tray">
            <div>
              <span>Swap tray</span>
              <strong data-swap-count>0 / 4</strong>
            </div>
            <div class="resource-slots swap-slots" aria-hidden="true">${swapSlots}</div>
          </div>
          <p>Files remain here; swap temporarily borrows a small part.</p>
        </section>
      </div>

      <div class="memory-reading" data-memory-reading>
        <strong>Light memory pressure.</strong>
        <span>The active work fits comfortably on the RAM workbench.</span>
      </div>
    </figure>
  `;
}

function renderConceptExplorer(lesson) {
  const concepts = arrayOr(lesson?.concepts);
  return `
    <figure class="concept-explorer" data-concept-explorer>
      <figcaption>
        <p>From familiar idea to exact term</p>
        <h3>Move between the three layers</h3>
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
          <p><strong>Example</strong> ${escapeHtml(concept?.example || "Example unavailable.")}</p>
        </div>
      `).join("")}
    </figure>
  `;
}

function renderLessonVisual(lesson) {
  return lesson?.interaction?.kind === "workbench-simulation"
    ? renderMemoryLab(lesson)
    : renderConceptExplorer(lesson);
}

function renderCourseRows(lessons, allLessons, currentLesson, selectedLesson, currentOffset) {
  return lessons.map((lesson) => {
    const offset = numberOr(lesson?.dayOffset);
    const lessonNumber = allLessons.findIndex((item) => item.id === lesson.id) + 1;
    const isAvailable = offset <= currentOffset;
    const isCurrent = lesson.id === currentLesson.id;
    const isSelected = lesson.id === selectedLesson.id;
    const wait = offset - currentOffset;
    const timing = isCurrent ? "Today" : isAvailable ? "Archive" : wait === 1 ? "Tomorrow" : `In ${wait} days`;
    const label = `Lesson ${lessonNumber}: ${lesson?.title || "Untitled"}`;
    return `
      <li data-course-state="${isCurrent ? "current" : isAvailable ? "available" : "future"}">
        ${isAvailable ? `
          <button type="button" data-lesson-choice="${escapeHtml(lesson.id)}" aria-pressed="${isSelected}">
            <span>${escapeHtml(label)}</span>
            <small>${timing} · ${numberOr(lesson?.readMinutes, 4)} min</small>
          </button>
        ` : `
          <span>
            <span>${escapeHtml(label)}</span>
            <small>${timing} · ${numberOr(lesson?.readMinutes, 4)} min</small>
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
      <section class="page-section" id="learn" data-observed-section aria-labelledby="learn-heading">
        <header class="section-header">
          <div><p class="section-name">Steward’s field guide</p><h2 id="learn-heading">The first lesson is being prepared</h2></div>
          <p>A short, visual explanation will appear here without changing anything on the Mac.</p>
        </header>
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

  return `
    <section class="page-section learn-section" id="learn" data-observed-section aria-labelledby="learn-heading">
      <header class="section-header learn-header">
        <div>
          <p class="section-name">Steward’s field guide</p>
          <h2 id="learn-heading">One useful idea each morning</h2>
        </div>
        <p>Plain language first. The proper technical term follows once the idea has somewhere to land.</p>
      </header>

      <article class="daily-lesson" aria-labelledby="lesson-title">
        <div class="lesson-editorial">
          <div class="lesson-meta">
            <span>${viewingToday ? "Today’s lesson" : "From the archive"}</span>
            <span>Day ${selectedIndex + 1} of ${schedule.lessons.length}</span>
            <span>${numberOr(selected?.readMinutes, 4)} min</span>
          </div>
          <p class="lesson-deck">${escapeHtml(selected?.deck || "A compact explanation for the curious.")}</p>
          <h3 id="lesson-title" tabindex="-1">${escapeHtml(selected?.title || "Untitled lesson")}</h3>
          <p class="lesson-summary">${escapeHtml(selected?.summary || "This lesson is not available yet.")}</p>

          <div class="technical-vocabulary">
            <p class="vocabulary-heading">What your Mac calls it</p>
            <dl class="lesson-concepts">
              ${arrayOr(selected?.concepts).map((concept) => `
                <div>
                  <dt>
                    <span>${escapeHtml(concept?.analogy || "Familiar idea")}</span>
                    <strong>${escapeHtml(concept?.term || "Technical term")}</strong>
                  </dt>
                  <dd>
                    <p>${escapeHtml(concept?.definition || "Definition unavailable.")}</p>
                    <p class="concept-example"><span>Example:</span> ${escapeHtml(concept?.example || "Example unavailable.")}</p>
                  </dd>
                </div>
              `).join("")}
            </dl>
          </div>

          <aside class="misconception-note">
            <strong>An easy mix-up</strong>
            <p>${escapeHtml(selected?.misconception || "No common misconception recorded.")}</p>
          </aside>

          <div class="lesson-takeaway">
            <span>Keep this</span>
            <p>${escapeHtml(selected?.takeaway || "Notice the signal before choosing an action.")}</p>
          </div>
        </div>

        <div class="lesson-visual-column">
          ${renderLessonVisual(selected)}
        </div>
      </article>

      <footer class="lesson-course" aria-labelledby="course-heading">
        <div>
          <p>${extendedArchive ? "Lesson archive" : "Seven-day foundation"}</p>
          <h3 id="course-heading">${extendedArchive ? "Recent field notes" : "The machine, explained from the inside out"}</h3>
        </div>
        <ol>
          ${renderCourseRows(courseLessons, schedule.lessons, schedule.current, selected, currentOffset)}
        </ol>
        ${earlierLessons.length ? `
          <details class="lesson-archive-more">
            <summary>Earlier lessons <span>${earlierLessons.length}</span></summary>
            <ol>${renderCourseRows(earlierLessons, schedule.lessons, schedule.current, selected, currentOffset)}</ol>
          </details>
        ` : ""}
      </footer>
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
        return `<span title="${escapeHtml(category?.label)} — ${formatBytes(category?.bytes)}" style="--segment-width: ${percent.toFixed(3)}%; --segment-color: ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}"></span>`;
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
        const deltaText = delta === 0 ? "no measured change" : `${delta > 0 ? "grew" : "shrank"} ${formatBytes(Math.abs(delta))}`;
        return `
          <li>
            <span class="category-swatch" aria-hidden="true" style="--swatch-color: ${CATEGORY_COLORS[index % CATEGORY_COLORS.length]}"></span>
            <span class="category-main">
              <strong>${escapeHtml(category?.label || "Unnamed category")}</strong>
              <span>${escapeHtml(kindLabel(category?.kind))} · ${Math.round((numberOr(category?.bytes) / total) * 100)}%</span>
            </span>
            <span class="category-size">${formatBytes(category?.bytes)}</span>
            <span class="category-delta ${delta > 0 ? "growth" : delta < 0 ? "reduction" : "steady"}">${escapeHtml(deltaText)}</span>
          </li>
        `;
      }).join("")}
    </ul>
  `;
}

function renderHistoryChart(history) {
  const snapshots = validSnapshots(history);
  if (snapshots.length < 2) {
    return `<div class="empty-state compact"><p>One reading is not a trend. Steward will draw this after tomorrow’s check.</p></div>`;
  }

  const width = 620;
  const height = 182;
  const padX = 12;
  const padTop = 16;
  const padBottom = 26;
  const values = snapshots.map((snapshot) => snapshot.availableBytes);
  const rawMin = Math.min(...values);
  const rawMax = Math.max(...values);
  const spread = Math.max(rawMax - rawMin, GIB);
  const min = Math.max(0, rawMin - spread * 0.12);
  const max = rawMax + spread * 0.12;
  const chartHeight = height - padTop - padBottom;
  const usableWidth = width - padX * 2;
  const points = snapshots.map((snapshot, index) => {
    const x = padX + (index / (snapshots.length - 1)) * usableWidth;
    const normalized = (snapshot.availableBytes - min) / (max - min || 1);
    const y = padTop + (1 - normalized) * chartHeight;
    return { x, y, snapshot };
  });
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${point.x.toFixed(1)} ${point.y.toFixed(1)}`).join(" ");
  const first = snapshots[0];
  const last = snapshots.at(-1);

  return `
    <div class="history-chart">
      <svg viewBox="0 0 ${width} ${height}" role="img" aria-labelledby="history-title history-description" preserveAspectRatio="none">
        <title id="history-title">Available disk space over time</title>
        <desc id="history-description">Available space changed from ${formatBytes(first.availableBytes)} on ${formatDate(first.generatedAt, "short")} to ${formatBytes(last.availableBytes)} on ${formatDate(last.generatedAt, "short")}.</desc>
        <line class="chart-gridline" x1="${padX}" y1="${height - padBottom}" x2="${width - padX}" y2="${height - padBottom}" />
        <line class="chart-gridline" x1="${padX}" y1="${padTop + chartHeight / 2}" x2="${width - padX}" y2="${padTop + chartHeight / 2}" />
        <path class="chart-line" d="${path}" />
        ${points.map((point, index) => `<circle class="chart-point ${index === points.length - 1 ? "is-current" : ""}" cx="${point.x.toFixed(1)}" cy="${point.y.toFixed(1)}" r="${index === points.length - 1 ? 4.5 : 2.5}"><title>${formatDate(point.snapshot.generatedAt, "short")}: ${formatBytes(point.snapshot.availableBytes)} available</title></circle>`).join("")}
      </svg>
      <div class="chart-axis" aria-hidden="true">
        <span>${escapeHtml(formatDate(first.generatedAt, "short"))}</span>
        <strong>${formatBytes(last.availableBytes)} now</strong>
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
    <div class="recommendations">
      <div class="subsection-heading subsection-heading-split">
        <div>
          <h3>Reclaim, with receipts</h3>
          <p>Each suggestion expands into the evidence and exact boundary behind it.</p>
        </div>
        <p class="quiet-label">Nothing is selected automatically</p>
      </div>
      ${recommendations.length ? `
        <div class="recommendation-list">
          ${recommendations.map((item, index) => {
            const risk = safeToken(item?.risk, ["safe", "rebuildable", "low", "medium", "high", "review"], "review");
            return `
              <details class="recommendation" ${index === 0 ? "open" : ""}>
                <summary>
                  <span class="summary-main">
                    <strong>${escapeHtml(item?.label || "Cleanup opportunity")}</strong>
                    <span>${formatBytes(item?.bytes)} possible</span>
                  </span>
                  <span class="risk-badge risk-${risk}">${escapeHtml(risk === "review" ? "Needs review" : `${titleCase(risk)} risk`)}</span>
                </summary>
                <div class="recommendation-body">
                  <dl class="evidence-list">
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
                    <div>
                      <dt>Exact scope</dt>
                      <dd><code>${escapeHtml(item?.scope || "Scope unavailable")}</code></dd>
                    </div>
                  </dl>
                  <button class="button button-secondary review-action" type="button" aria-pressed="false" data-review-action>
                    Add to review
                  </button>
                </div>
              </details>
            `;
          }).join("")}
        </div>
      ` : `<div class="empty-state"><p><strong>No cleanup proposal today.</strong> Steward found nothing that clears its evidence threshold.</p></div>`}
    </div>
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
    <section class="page-section" id="routines" data-observed-section aria-labelledby="routines-heading">
      <header class="section-header">
        <div>
          <p class="section-name">Routines</p>
          <h2 id="routines-heading">What your work keeps asking for</h2>
        </div>
        <p>Patterns are suggestions, not conclusions. Steward reads task shape and frequency—not private file contents.</p>
      </header>

      <div class="automation-status">
        <div class="automation-copy">
          <span class="automation-symbol" aria-hidden="true">
            <svg viewBox="0 0 24 24" width="22" height="22">
              <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-width="1.6" />
              <path d="M12 7.3v5l3.3 1.9" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </span>
          <div>
            <p>The quiet part</p>
            <h3>Daily observation at ${escapeHtml(automationTime)}</h3>
            <span>${escapeHtml(automationZone)} · ${escapeHtml(automationModel)} ${escapeHtml(automationReasoning)} · reports and recommends · never deletes</span>
          </div>
        </div>
        <div class="automation-next" data-state="${automationStatus}">
          <span class="status-dot" aria-hidden="true"></span>
          <span>${automationActive ? "Active" : "Paused"}</span>
        </div>
      </div>

      <div class="routines-layout">
        <div class="pattern-column">
          <div class="subsection-heading">
            <h3>Signals from ${taskCount} tasks</h3>
            <p>A ${days}-day view of the work that repeated enough to notice.</p>
          </div>
          ${patterns.length ? `
            <ul class="pattern-list">
              ${patterns.map((pattern) => {
                const share = Math.min(1, Math.max(0, numberOr(pattern?.share, taskCount ? numberOr(pattern?.count) / taskCount : 0)));
                return `
                  <li>
                    <div class="pattern-line">
                      <strong>${escapeHtml(pattern?.label || "Unnamed pattern")}</strong>
                      <span>${numberOr(pattern?.count)} times · ${Math.round(share * 100)}%</span>
                    </div>
                    <div class="pattern-meter" aria-hidden="true"><span style="--pattern-value: ${(share * 100).toFixed(2)}%"></span></div>
                    <p>${escapeHtml(pattern?.description || "No description available.")}</p>
                  </li>
                `;
              }).join("")}
            </ul>
          ` : `<div class="empty-state"><p>More sessions are needed before a routine can be named responsibly.</p></div>`}
        </div>

        <div class="opportunity-column">
          <div class="subsection-heading">
            <h3>Worth automating next</h3>
            <p>Small, reversible helpers suggested by the evidence.</p>
          </div>
          ${opportunities.length ? `
            <div class="opportunity-list">
              ${opportunities.map((opportunity) => {
                const confidence = safeToken(opportunity?.confidence, ["low", "medium", "high"], "low");
                const state = safeToken(opportunity?.state, ["ready", "idea", "candidate", "paused", "active"], "idea");
                return `
                  <article class="opportunity">
                    <div class="opportunity-heading">
                      <h4>${escapeHtml(opportunity?.title || "Automation opportunity")}</h4>
                      <span class="state-label state-${state}">${escapeHtml(titleCase(state))}</span>
                    </div>
                    <p>${escapeHtml(opportunity?.summary || "No summary available.")}</p>
                    <dl>
                      <div><dt>Evidence</dt><dd>${escapeHtml(opportunity?.evidence || "Not recorded")}</dd></div>
                      <div><dt>Confidence</dt><dd>${escapeHtml(titleCase(confidence))}</dd></div>
                      <div><dt>Time back</dt><dd>${escapeHtml(opportunity?.timeSaved || "Not estimated")}</dd></div>
                    </dl>
                    <button class="text-action" type="button" aria-pressed="false" data-opportunity-action>Keep on the radar</button>
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

  return `
    <section class="page-section" id="timeline" data-observed-section aria-labelledby="timeline-heading">
      <header class="section-header">
        <div>
          <p class="section-name">Timeline</p>
          <h2 id="timeline-heading">A record you can audit</h2>
        </div>
        <p>Observations and approved cleanups share one chronology, with the boundary between them kept explicit.</p>
      </header>

      ${events.length ? `
        <ol class="timeline-list">
          ${events.map((event) => {
            const type = safeToken(event?.type, ["cleanup", "observation", "warning", "automation"], "observation");
            const reclaimed = numberOr(event?.reclaimedBytes);
            return `
              <li>
                <div class="timeline-marker marker-${type}" aria-hidden="true"></div>
                <time datetime="${escapeHtml(event?.occurredAt)}">
                  <span>${escapeHtml(formatDate(event?.occurredAt, "short"))}</span>
                  <span>${escapeHtml(formatClock(event?.occurredAt))}</span>
                </time>
                <div class="timeline-copy">
                  <div>
                    <h3>${escapeHtml(event?.title || "Untitled event")}</h3>
                    <span class="event-type">${escapeHtml(titleCase(type))}</span>
                  </div>
                  <p>${escapeHtml(event?.summary || "No summary recorded.")}</p>
                  ${event?.details ? `<p class="timeline-details">${escapeHtml(Array.isArray(event.details) ? event.details.join(" ") : event.details)}</p>` : ""}
                </div>
                <div class="timeline-effect">
                  ${reclaimed > 0 ? `<strong>${formatBytes(reclaimed)}</strong><span>reclaimed</span>` : `<strong>Read only</strong><span>no files changed</span>`}
                </div>
              </li>
            `;
          }).join("")}
        </ol>
      ` : `<div class="empty-state"><p>The timeline begins after the first completed observation.</p></div>`}
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
    <section class="page-section trust-section" id="trust" data-observed-section aria-labelledby="trust-heading">
      <header class="section-header">
        <div>
          <p class="section-name">Trust &amp; scope</p>
          <h2 id="trust-heading">What Steward knows—and what it does not</h2>
        </div>
        <p>Coverage is reported as a measurement, never disguised as certainty.</p>
      </header>

      <div class="trust-layout">
        <div class="coverage-panel">
          <p class="coverage-value">${percent.toFixed(1)}%</p>
          <h3>of addressable storage scanned</h3>
          <div class="coverage-meter" role="progressbar" aria-label="Addressable storage scanned" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${percent.toFixed(1)}">
            <span style="--coverage-value: ${percent.toFixed(2)}%"></span>
          </div>
          <dl>
            <div><dt>Measured</dt><dd>${formatBytes(scanned)}</dd></div>
            <div><dt>Unknown or protected</dt><dd>${formatBytes(unknown)}</dd></div>
          </dl>
        </div>

        <div class="scope-details">
          <div>
            <h3>Included in the observation</h3>
            ${roots.length ? `<ul>${roots.map((root) => `<li><code>${escapeHtml(root)}</code></li>`).join("")}</ul>` : `<p>Scan roots have not been reported yet.</p>`}
          </div>
          <div>
            <h3>Deliberately outside the view</h3>
            ${exclusions.length ? `<ul>${exclusions.map((exclusion) => `<li>${escapeHtml(exclusion)}</li>`).join("")}</ul>` : `<p>No exclusions were reported.</p>`}
          </div>
        </div>
      </div>

      <div class="trust-contract">
        <div>
          <strong>Local by default</strong>
          <p>Scan history and workflow summaries stay on this Mac.</p>
        </div>
        <div>
          <strong>Metadata, not meaning</strong>
          <p>Routine detection uses task labels, timing, and repetition—not document contents.</p>
        </div>
        <div>
          <strong>Approval before action</strong>
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
        <p>${escapeHtml(formatDate(data.latest?.generatedAt))}</p>
        <span>One-minute operational brief</span>
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
      document.querySelector("#lesson-title")?.focus();
      liveRegion.textContent = "Archived lesson opened.";
    });
  });
}

function setupLearnInteractions() {
  setupMemoryLab();
  setupConceptExplorers();
  setupLessonChoices();
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
  activeRequest = new AbortController();
  const { signal } = activeRequest;

  refreshButton.disabled = true;
  refreshButton.classList.add("is-loading");
  refreshButton.querySelector("span").textContent = "Reading…";
  freshness.classList.add("is-reading");
  freshness.querySelector("span:last-child").textContent = "Reading local snapshots";
  app.setAttribute("aria-busy", "true");

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
      button.textContent = selected ? "Add to review" : "Added for review";
      liveRegion.textContent = selected ? "Removed from review." : "Added to review. No cleanup has been run.";
    });
  });

  document.querySelectorAll("[data-opportunity-action]").forEach((button) => {
    button.addEventListener("click", () => {
      const selected = button.getAttribute("aria-pressed") === "true";
      button.setAttribute("aria-pressed", String(!selected));
      button.textContent = selected ? "Keep on the radar" : "On the radar";
      liveRegion.textContent = selected ? "Automation idea unmarked." : "Automation idea marked for a future draft.";
    });
  });

  setupLearnInteractions();
  setupSectionObserver();
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

refreshButton.addEventListener("click", () => loadBrief({ announce: true }));

loadBrief();
