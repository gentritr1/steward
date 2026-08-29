import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataRoot = path.join(projectRoot, "public", "data");

async function readJson(name) {
  const raw = await readFile(path.join(dataRoot, name), "utf8");
  return JSON.parse(raw);
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

const [latest, history, workflow, events, lessons] = await Promise.all([
  readJson("latest.json"),
  readJson("history.json"),
  readJson("workflow-insights.json"),
  readJson("events.json"),
  readJson("lessons.json"),
]);

assert(latest.schemaVersion === 1, "latest.json must use schemaVersion 1");
assert(Number.isFinite(latest.disk?.availableBytes), "latest.json requires disk.availableBytes");
assert(Array.isArray(latest.categories), "latest.json requires categories[]");
assert(Array.isArray(latest.reclaimable), "latest.json requires reclaimable[]");
assert(Array.isArray(history.snapshots), "history.json requires snapshots[]");
assert(Array.isArray(workflow.patterns), "workflow-insights.json requires patterns[]");
assert(Array.isArray(workflow.opportunities), "workflow-insights.json requires opportunities[]");
assert(Array.isArray(events.events), "events.json requires events[]");

assert(lessons.schemaVersion === 1, "lessons.json must use schemaVersion 1");
assert(lessons.startsOn === "2026-08-29", "lessons.json must start on 2026-08-29");
assert(lessons.cadence === "daily", "lessons.json must use a daily cadence");
assert(Array.isArray(lessons.lessons), "lessons.json requires lessons[]");
assert(lessons.lessons.length >= 7, "lessons.json must contain at least the seven-lesson foundation");

const lessonIds = new Set();

for (const [index, lesson] of lessons.lessons.entries()) {
  const prefix = `lessons.json lesson ${index + 1}`;

  assert(typeof lesson.id === "string" && lesson.id.length > 0, `${prefix} requires id`);
  assert(!lessonIds.has(lesson.id), `${prefix} id must be unique`);
  lessonIds.add(lesson.id);

  assert(lesson.dayOffset === index, `${prefix} requires sequential dayOffset ${index}`);
  assert(typeof lesson.title === "string" && lesson.title.length > 0, `${prefix} requires title`);
  assert(typeof lesson.deck === "string" && lesson.deck.length > 0, `${prefix} requires deck`);
  assert(Number.isInteger(lesson.readMinutes) && lesson.readMinutes > 0, `${prefix} requires positive readMinutes`);
  assert(typeof lesson.summary === "string" && lesson.summary.length > 0, `${prefix} requires summary`);
  assert(Array.isArray(lesson.concepts) && lesson.concepts.length === 3, `${prefix} requires exactly three concepts`);

  for (const [conceptIndex, concept] of lesson.concepts.entries()) {
    for (const field of ["term", "analogy", "definition", "example"]) {
      assert(
        typeof concept[field] === "string" && concept[field].length > 0,
        `${prefix} concept ${conceptIndex + 1} requires ${field}`,
      );
    }
  }

  assert(typeof lesson.misconception === "string" && lesson.misconception.length > 0, `${prefix} requires misconception`);
  assert(typeof lesson.takeaway === "string" && lesson.takeaway.length > 0, `${prefix} requires takeaway`);

  if (lesson.interaction !== undefined) {
    assert(
      lesson.interaction.kind === "workbench-simulation",
      `${prefix} interaction.kind must be workbench-simulation when provided`,
    );
    assert(typeof lesson.interaction.title === "string" && lesson.interaction.title.length > 0, `${prefix} interaction requires title`);
    assert(typeof lesson.interaction.prompt === "string" && lesson.interaction.prompt.length > 0, `${prefix} interaction requires prompt`);
    assert(typeof lesson.interaction.unit === "string" && lesson.interaction.unit.length > 0, `${prefix} interaction requires unit`);
    assert(
      Array.isArray(lesson.interaction.presets) && lesson.interaction.presets.length > 0,
      `${prefix} interaction requires presets[]`,
    );

    for (const [presetIndex, preset] of lesson.interaction.presets.entries()) {
      assert(typeof preset.id === "string" && preset.id.length > 0, `${prefix} preset ${presetIndex + 1} requires id`);
      assert(typeof preset.label === "string" && preset.label.length > 0, `${prefix} preset ${presetIndex + 1} requires label`);
      assert(Number.isFinite(preset.value), `${prefix} preset ${presetIndex + 1} requires numeric value`);
    }
  }
}

const firstLessonPresets = Object.fromEntries(
  lessons.lessons[0].interaction?.presets.map((preset) => [preset.id, preset.value]) ?? [],
);

assert(lessons.lessons[0].id === "ram-and-storage", "The first lesson must teach RAM and storage");
assert(lessons.lessons[0].interaction?.kind === "workbench-simulation", "The first lesson requires a workbench simulation");
assert(firstLessonPresets.browser === 4, "The browser workbench preset must equal 4");
assert(firstLessonPresets.design === 7, "The design workbench preset must equal 7");
assert(firstLessonPresets.video === 11, "The video workbench preset must equal 11");

const lessonSource = JSON.stringify(lessons);
assert(!lessonSource.includes("/Users/"), "lessons.json must not expose local user paths");

console.log("Steward data files are valid.");
