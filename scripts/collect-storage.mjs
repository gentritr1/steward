import { execFile } from "node:child_process";
import { access, mkdir, readFile, readdir, stat, unlink, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDataRoot = path.join(projectRoot, "public", "data");
const snapshotRoot = path.join(projectRoot, "data", "snapshots");
const userHome = os.homedir();
const desktopProjectsRoot = path.join(userHome, "Desktop", "Projects");
const latestPath = path.join(publicDataRoot, "latest.json");
const historyPath = path.join(publicDataRoot, "history.json");
const gibibyte = 1024 ** 3;
const retentionDays = 90;
const scanStartedAt = Date.now();
const scanInstant = new Date();
const scanDay = new Intl.DateTimeFormat("en-CA", {
  timeZone: "Europe/Belgrade",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
}).format(scanInstant);

async function commandOutput(command, args, timeout = 180_000) {
  try {
    const result = await execFileAsync(command, args, {
      encoding: "utf8",
      maxBuffer: 32 * 1024 * 1024,
      timeout,
    });
    return result.stdout.trim();
  } catch (error) {
    if (typeof error?.stdout === "string" && error.stdout.trim()) {
      return error.stdout.trim();
    }
    return "";
  }
}

async function pathExists(targetPath) {
  try {
    await access(targetPath);
    return true;
  } catch {
    return false;
  }
}

async function readJson(targetPath, fallback) {
  try {
    return JSON.parse(await readFile(targetPath, "utf8"));
  } catch {
    return fallback;
  }
}

async function writeJson(targetPath, value) {
  await writeFile(targetPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
}

async function pruneExpiredSnapshots() {
  const cutoffMs = scanInstant.getTime() - retentionDays * 24 * 60 * 60 * 1000;
  const names = await readdir(snapshotRoot);

  await Promise.all(names.map(async (name) => {
    if (!name.endsWith(".json")) {
      return;
    }

    const snapshotPath = path.join(snapshotRoot, name);
    const snapshotStat = await stat(snapshotPath);
    if (snapshotStat.isFile() && snapshotStat.mtimeMs < cutoffMs) {
      await unlink(snapshotPath);
    }
  }));
}

async function mapWithLimit(items, limit, mapper) {
  const results = new Array(items.length);
  let nextIndex = 0;

  async function worker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await mapper(items[index], index);
    }
  }

  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

async function directoryBytes(targetPath) {
  if (!(await pathExists(targetPath))) {
    return 0;
  }

  const output = await commandOutput("du", ["-sk", targetPath]);
  const kibibytes = Number.parseInt(output.split(/\s+/)[0] ?? "0", 10);
  return Number.isFinite(kibibytes) ? kibibytes * 1024 : 0;
}

async function sumDirectoryBytes(targetPaths) {
  const values = await mapWithLimit(targetPaths, 3, directoryBytes);
  return values.reduce((total, value) => total + value, 0);
}

async function getDiskReading() {
  const preferredMount = "/System/Volumes/Data";
  const mountPoint = (await pathExists(preferredMount)) ? preferredMount : "/";
  const output = await commandOutput("df", ["-k", mountPoint]);
  const lines = output.split("\n").filter(Boolean);
  const columns = (lines.at(-1) ?? "").trim().split(/\s+/);

  if (columns.length < 5) {
    throw new Error("Could not read the data-volume capacity.");
  }

  const capacityBytes = Number.parseInt(columns[1], 10) * 1024;
  const usedBytes = Number.parseInt(columns[2], 10) * 1024;
  const availableBytes = Number.parseInt(columns[3], 10) * 1024;
  const usedPercent = Number.parseInt(columns[4].replace("%", ""), 10);

  return {
    mountPoint,
    capacityBytes,
    usedBytes,
    availableBytes,
    usedPercent,
  };
}

function homeRelative(targetPath) {
  if (targetPath === userHome) {
    return "~";
  }
  if (targetPath.startsWith(`${userHome}${path.sep}`)) {
    return `~/${path.relative(userHome, targetPath)}`;
  }
  return targetPath;
}

function formatGiB(bytes) {
  return `${(bytes / gibibyte).toFixed(bytes >= 10 * gibibyte ? 0 : 1)} GB`;
}

function localDay(isoTimestamp) {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Belgrade",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(isoTimestamp));
}

async function findDirectories(rootPath, predicateArgs) {
  if (!(await pathExists(rootPath))) {
    return [];
  }
  const output = await commandOutput("find", [rootPath, ...predicateArgs]);
  return output ? output.split("\n").filter(Boolean) : [];
}

async function getGeneratedDirectories() {
  const [nodeModules, androidBuilds, gradleHomes, libraryCandidates] = await Promise.all([
    findDirectories(desktopProjectsRoot, ["-type", "d", "-name", "node_modules", "-prune", "-print"]),
    findDirectories(desktopProjectsRoot, ["-type", "d", "-path", "*/android/app/build", "-prune", "-print"]),
    findDirectories(desktopProjectsRoot, ["-type", "d", "-name", ".gradle-user-home", "-prune", "-print"]),
    findDirectories(desktopProjectsRoot, ["-type", "d", "-name", "Library", "-prune", "-print"]),
  ]);

  const realAndroidBuilds = androidBuilds.filter(
    (targetPath) => !targetPath.includes(`${path.sep}.cxx${path.sep}`),
  );

  const unityLibraries = [];
  for (const candidate of libraryCandidates) {
    const unityProject = path.dirname(candidate);
    const projectVersion = path.join(unityProject, "ProjectSettings", "ProjectVersion.txt");
    if (await pathExists(projectVersion)) {
      unityLibraries.push(candidate);
    }
  }

  const candidates = [
    ...nodeModules.map((targetPath) => ({ type: "node-modules", targetPath })),
    ...realAndroidBuilds.map((targetPath) => ({ type: "android-build", targetPath })),
    ...gradleHomes.map((targetPath) => ({ type: "project-gradle", targetPath })),
    ...unityLibraries.map((targetPath) => ({ type: "unity-library", targetPath })),
  ];

  return mapWithLimit(candidates, 4, async (candidate) => ({
    ...candidate,
    bytes: await directoryBytes(candidate.targetPath),
  }));
}

function projectNameForPath(targetPath) {
  const relativePath = path.relative(desktopProjectsRoot, targetPath);
  return relativePath.split(path.sep)[0] || path.basename(targetPath);
}

async function getProjects(generatedDirectories) {
  if (!(await pathExists(desktopProjectsRoot))) {
    return [];
  }

  const entries = await readdir(desktopProjectsRoot, { withFileTypes: true });
  const directories = entries
    .filter((entry) => entry.isDirectory())
    .map((entry) => path.join(desktopProjectsRoot, entry.name));

  const generatedByProject = new Map();
  for (const generated of generatedDirectories) {
    const projectName = projectNameForPath(generated.targetPath);
    generatedByProject.set(projectName, (generatedByProject.get(projectName) ?? 0) + generated.bytes);
  }

  const projects = await mapWithLimit(directories, 3, async (projectPath) => {
    const projectStat = await stat(projectPath);
    const name = path.basename(projectPath);
    return {
      name,
      bytes: await directoryBytes(projectPath),
      generatedBytes: generatedByProject.get(name) ?? 0,
      hasGit: await pathExists(path.join(projectPath, ".git")),
      lastActiveAt: projectStat.mtime.toISOString(),
    };
  });

  return projects.sort((left, right) => right.bytes - left.bytes).slice(0, 12);
}

async function getOlderDeviceSupport() {
  const supportRoot = path.join(userHome, "Library", "Developer", "Xcode", "iOS DeviceSupport");
  if (!(await pathExists(supportRoot))) {
    return [];
  }

  const entries = (await readdir(supportRoot, { withFileTypes: true }))
    .filter((entry) => entry.isDirectory())
    .map((entry) => entry.name)
    .sort((left, right) => left.localeCompare(right, undefined, { numeric: true }));

  if (entries.length < 2) {
    return [];
  }

  return entries.slice(0, -1).map((name) => path.join(supportRoot, name));
}

function groupGenerated(generatedDirectories, type) {
  return generatedDirectories.filter((item) => item.type === type);
}

function sumGenerated(items) {
  return items.reduce((total, item) => total + item.bytes, 0);
}

function summarizedScope(items, fallback) {
  if (!items.length) {
    return fallback;
  }
  const countsByProject = new Map();
  for (const item of items) {
    const projectName = projectNameForPath(item.targetPath);
    countsByProject.set(projectName, (countsByProject.get(projectName) ?? 0) + 1);
  }

  const groups = [...countsByProject.entries()]
    .sort((left, right) => right[1] - left[1])
    .map(([projectName, count]) => `${projectName} (${count})`);
  const visible = groups.slice(0, 4);
  const remainder = groups.length - visible.length;
  return remainder > 0 ? `${visible.join(", ")} and ${remainder} more projects` : visible.join(", ");
}

async function getReclaimable(generatedDirectories, cacheBytes) {
  const nodeModules = groupGenerated(generatedDirectories, "node-modules");
  const androidBuilds = groupGenerated(generatedDirectories, "android-build");
  const projectGradle = groupGenerated(generatedDirectories, "project-gradle");
  const unityLibraries = groupGenerated(generatedDirectories, "unity-library");
  const olderSupportPaths = await getOlderDeviceSupport();

  const globalSpecs = [
    {
      id: "gradle-cache",
      label: "Gradle dependency cache",
      targetPaths: [path.join(userHome, ".gradle", "caches"), path.join(userHome, ".gradle", ".tmp")],
      risk: "safe",
      rebuildCost: "Dependencies download again on demand",
      evidence: "Gradle stores downloaded and derived build inputs here.",
      reversibility: "Recreated by the next Android or Gradle build.",
    },
    {
      id: "npm-cache",
      label: "npm and npx cache",
      targetPaths: [path.join(userHome, ".npm", "_cacache"), path.join(userHome, ".npm", "_npx")],
      risk: "safe",
      rebuildCost: "Packages download again on demand",
      evidence: "npm's content-addressed cache and temporary npx installs contain no project source.",
      reversibility: "Recreated by npm and npx.",
    },
    {
      id: "xcode-derived",
      label: "Xcode Derived Data",
      targetPaths: [path.join(userHome, "Library", "Developer", "Xcode", "DerivedData")],
      risk: "safe",
      rebuildCost: "The next Xcode build recompiles",
      evidence: "Derived Data is generated build and indexing output.",
      reversibility: "Recreated by Xcode.",
    },
    {
      id: "xcode-archives",
      label: "Xcode archives",
      targetPaths: [path.join(userHome, "Library", "Developer", "Xcode", "Archives")],
      risk: "review",
      rebuildCost: "Previous release artifacts may be irreplaceable",
      evidence: "Archives can contain dSYMs and release builds needed for crash reports or submission history.",
      reversibility: "Preserve unless releases are backed up and no longer needed.",
    },
    {
      id: "older-device-support",
      label: "Older Xcode device support",
      targetPaths: olderSupportPaths,
      risk: "review",
      rebuildCost: "Xcode may restore support when that OS is connected",
      evidence: "A newer device-support directory is present; older versions may be redundant.",
      reversibility: "Usually restored by Xcode or a connected device.",
    },
  ];

  const globalRows = await mapWithLimit(globalSpecs, 3, async (spec) => ({
    id: spec.id,
    label: spec.label,
    bytes: await sumDirectoryBytes(spec.targetPaths),
    risk: spec.risk,
    rebuildCost: spec.rebuildCost,
    evidence: spec.evidence,
    scope: spec.targetPaths.length ? spec.targetPaths.map(homeRelative).join(", ") : "No older copies found",
    reversibility: spec.reversibility,
  }));

  const appCaches = {
    id: "app-caches",
    label: "Application caches",
    bytes: cacheBytes.nonCodex,
    risk: "review",
    rebuildCost: "Apps may sign in, index, or download cached assets again",
    evidence: "Measured under ~/Library/Caches, excluding Steward's active Codex cache.",
    scope: "~/Library/Caches (Codex cache excluded)",
    reversibility: "Most contents return automatically; close affected apps first.",
  };

  const generatedRows = [
    {
      id: "android-builds",
      label: "Android build outputs",
      bytes: sumGenerated(androidBuilds),
      risk: "safe",
      rebuildCost: "The next native build recompiles",
      evidence: `${androidBuilds.length} android/app/build folder${androidBuilds.length === 1 ? "" : "s"} found.`,
      scope: summarizedScope(androidBuilds, "No Android build outputs found"),
      reversibility: "Recreated by the next Android build.",
    },
    {
      id: "unity-libraries",
      label: "Unity-generated libraries",
      bytes: sumGenerated(unityLibraries),
      risk: "rebuildable",
      rebuildCost: "Unity must reimport assets; large projects can take time",
      evidence: `${unityLibraries.length} Unity Library folder${unityLibraries.length === 1 ? "" : "s"} found beside ProjectSettings.`,
      scope: summarizedScope(unityLibraries, "No Unity Library folders found"),
      reversibility: "Recreated when Unity reopens each project.",
    },
    {
      id: "project-gradle",
      label: "Project-local Gradle caches",
      bytes: sumGenerated(projectGradle),
      risk: "safe",
      rebuildCost: "Dependencies and build metadata regenerate",
      evidence: `${projectGradle.length} project-local Gradle cache${projectGradle.length === 1 ? "" : "s"} found.`,
      scope: summarizedScope(projectGradle, "No project-local Gradle caches found"),
      reversibility: "Recreated by the next project build.",
    },
    {
      id: "node-modules",
      label: "Installed project packages",
      bytes: sumGenerated(nodeModules),
      risk: "review",
      rebuildCost: "Requires a valid lockfile and package reinstall",
      evidence: `${nodeModules.length} node_modules folder${nodeModules.length === 1 ? "" : "s"} found.`,
      scope: summarizedScope(nodeModules, "No node_modules folders found"),
      reversibility: "Reinstall from the matching lockfile; preserve unusual vendored dependencies.",
    },
  ];

  return [appCaches, ...globalRows, ...generatedRows]
    .filter((item) => item.bytes >= 10 * 1024 ** 2)
    .sort((left, right) => right.bytes - left.bytes);
}

await Promise.all([
  mkdir(publicDataRoot, { recursive: true }),
  mkdir(snapshotRoot, { recursive: true }),
]);

const previousHistory = await readJson(historyPath, { schemaVersion: 1, snapshots: [] });
const previousDistinctSnapshot = [...(previousHistory.snapshots ?? [])]
  .reverse()
  .find((snapshot) => localDay(snapshot.generatedAt) !== scanDay);
const disk = await getDiskReading();

const categorySpecs = [
  { id: "projects", label: "Projects", paths: [desktopProjectsRoot], kind: "work" },
  { id: "downloads", label: "Downloads", paths: [path.join(userHome, "Downloads")], kind: "personal" },
  { id: "documents", label: "Documents", paths: [path.join(userHome, "Documents")], kind: "personal" },
  { id: "music", label: "Music", paths: [path.join(userHome, "Music")], kind: "personal" },
  { id: "app-data", label: "Application data", paths: [path.join(userHome, "Library", "Application Support")], kind: "protected" },
  { id: "developer", label: "Developer tools", paths: [path.join(userHome, "Library", "Developer")], kind: "mixed" },
  { id: "app-caches", label: "Application caches", paths: [path.join(userHome, "Library", "Caches")], kind: "rebuildable" },
  { id: "codex", label: "Codex local data", paths: [path.join(userHome, ".codex")], kind: "protected" },
  { id: "build-caches", label: "Build and package caches", paths: [path.join(userHome, ".gradle"), path.join(userHome, ".npm"), path.join(userHome, ".cache")], kind: "rebuildable" },
  { id: "agent-data", label: "Other agent data", paths: [path.join(userHome, ".claude")], kind: "protected" },
];

const measuredCategories = await mapWithLimit(categorySpecs, 3, async (spec) => ({
  ...spec,
  bytes: await sumDirectoryBytes(spec.paths),
}));

const desktopBytes = await directoryBytes(path.join(userHome, "Desktop"));
const projectsBytes = measuredCategories.find((category) => category.id === "projects")?.bytes ?? 0;
measuredCategories.splice(1, 0, {
  id: "desktop-other",
  label: "Desktop, outside Projects",
  paths: [path.join(userHome, "Desktop")],
  kind: "mixed",
  bytes: Math.max(0, desktopBytes - projectsBytes),
});

const previousCategoryMap = new Map(
  Object.entries(previousDistinctSnapshot?.categoryBytes ?? {}),
);
const categories = measuredCategories.map(({ paths: _paths, ...category }) => ({
  ...category,
  deltaBytes: previousCategoryMap.has(category.id)
    ? category.bytes - previousCategoryMap.get(category.id)
    : null,
}));

const generatedDirectories = await getGeneratedDirectories();
const projects = await getProjects(generatedDirectories);
const totalCacheBytes = categories.find((category) => category.id === "app-caches")?.bytes ?? 0;
const codexCacheBytes = await directoryBytes(path.join(userHome, "Library", "Caches", "Codex"));
const reclaimable = await getReclaimable(generatedDirectories, {
  total: totalCacheBytes,
  nonCodex: Math.max(0, totalCacheBytes - codexCacheBytes),
});

const generatedAt = scanInstant.toISOString();
const previousAvailable = previousDistinctSnapshot?.availableBytes;
const availableDeltaBytes = Number.isFinite(previousAvailable)
  ? disk.availableBytes - previousAvailable
  : null;
const priorDailySnapshots = (previousHistory.snapshots ?? []).filter(
  (snapshot) => localDay(snapshot.generatedAt) !== scanDay,
);
const historyCountAfterThisScan = priorDailySnapshots.length + 1;

let headline = `${formatGiB(disk.availableBytes)} free. Baseline established.`;
let body = "I have the first reading. One more daily scan will reveal what is growing; seven will make the pattern useful.";
if (availableDeltaBytes !== null) {
  if (availableDeltaBytes <= -0.25 * gibibyte) {
    headline = `${formatGiB(Math.abs(availableDeltaBytes))} disappeared since the last reading.`;
    body = "The change list below shows the measured categories most likely to explain it. Steward will not claim a cause where coverage is incomplete.";
  } else if (availableDeltaBytes >= 0.25 * gibibyte) {
    headline = `${formatGiB(availableDeltaBytes)} returned since the last reading.`;
    body = "The machine has more room than it did at the previous scan. The timeline keeps the receipt so regrowth can be measured later.";
  } else {
    headline = "The machine held steady.";
    body = "No meaningful storage movement was measured since the previous scan.";
  }
}

const scannedBytes = categories.reduce((total, category) => total + category.bytes, 0);
const latest = {
  schemaVersion: 1,
  generatedAt,
  scanDurationMs: Date.now() - scanStartedAt,
  disk,
  summary: { headline, body },
  categories: categories.sort((left, right) => right.bytes - left.bytes),
  projects,
  reclaimable,
  coverage: {
    scannedBytes,
    unknownBytes: Math.max(0, disk.usedBytes - scannedBytes),
    coveragePercent: disk.usedBytes > 0 ? Math.min(100, (scannedBytes / disk.usedBytes) * 100) : 0,
    roots: categorySpecs.map((spec) => spec.label),
    exclusions: [
      "File contents",
      "Trash and restricted system locations",
      "iCloud-only placeholders",
      "APFS clone and purgeable-space attribution",
      "Prompt and document bodies",
    ],
  },
  trend: historyCountAfterThisScan < 2
    ? {
        state: "baseline",
        message: "Growth attribution unlocks after the next successful daily scan.",
        nextMilestone: 2,
      }
    : historyCountAfterThisScan < 7
      ? {
          state: "learning",
          message: `${historyCountAfterThisScan} readings collected. A weekly direction unlocks at 7.`,
          nextMilestone: 7,
        }
      : {
          state: "ready",
          message: "Enough readings exist for a cautious weekly growth direction.",
          nextMilestone: 30,
        },
  automation: {
    name: "Morning Steward",
    status: "active",
    cadence: "daily",
    localTime: "09:00",
    timeZone: "Europe/Belgrade",
    model: "Luna",
    reasoning: "extra-high",
    mode: "read-only",
    deletionAllowed: false,
  },
  privacy: {
    localOnly: true,
    readsFileContents: false,
    recordsPromptBodies: false,
    retentionDays,
  },
};

const historyEntry = {
  generatedAt,
  availableBytes: disk.availableBytes,
  usedBytes: disk.usedBytes,
  usedPercent: disk.usedPercent,
  categoryBytes: Object.fromEntries(categories.map((category) => [category.id, category.bytes])),
};
const snapshots = [...priorDailySnapshots, historyEntry].slice(-retentionDays);
const history = { schemaVersion: 1, snapshots };
const snapshotName = `${generatedAt.replaceAll(":", "-")}.json`;

await Promise.all([
  writeJson(latestPath, latest),
  writeJson(historyPath, history),
  writeJson(path.join(snapshotRoot, snapshotName), latest),
]);
await pruneExpiredSnapshots();

console.log(`${headline} ${reclaimable.length} reviewable storage groups found.`);
