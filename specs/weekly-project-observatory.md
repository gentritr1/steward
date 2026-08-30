# Spec — Weekly Project Observatory (Codex automation)

Status: SPEC — approved for drafting 2026-08-30; NOT installed. Installing
creates a scheduled weekly run that spends Luna xhigh tokens — it goes live
only on an explicit "install" from the owner.
Install target: `~/.codex/automations/project-observatory/automation.toml`
Origin: architecture audit item 5.

## Purpose

Once a week, sweep the machine's project folders and report — metadata only —
what is at risk or going stale: uncommitted work, branches ahead of their
remote, stale prototypes, reclaimable generated storage, and projects with no
version control at all. Alert only on actionable changes; a quiet week gets
one quiet line. Observe-only, same ethic as Steward itself: it never deletes,
moves, installs, commits, or pushes anything.

## What it inspects (metadata only — never file contents)

Roots: `/Users/gentlegen/Desktop` (top-level directories; skip hidden dirs
and `steward-*` worktrees of repos it already visited).

Per git project:
- branch, ahead/behind vs upstream (`git rev-list --left-right --count`),
  "no upstream" flagged
- uncommitted change count (`git status --porcelain` line count) and the
  age of the oldest modification among changed paths (mtime)
- last commit age (`git log -1 --format=%cI`)
- generated-storage size: `node_modules`, `dist`, `build`, `.next`,
  `DerivedData`, `target` (du, apparent size, per dir)

Per non-git directory that looks like a project (has package.json,
*.xcodeproj, pyproject.toml, go.mod, Cargo.toml, or index.html):
- flagged as "no version control", with last-modified age and size

Explicitly never: file contents, diffs, filenames inside src trees beyond
the marker files above, anything under ~/Library, no network calls other
than none at all (`git fetch` is NOT run — ahead/behind is measured against
the last-fetched state and labeled "as of last fetch").

## Alerting — calibration first, thresholds second

Numeric thresholds must be tuned against reality, not guessed. Therefore:

- **Runs 1–2 are calibration runs**: report EVERY finding, and annotate
  which ones the draft thresholds below would have alerted on. No finding
  is suppressed. The owner then adjusts the thresholds in the prompt.
- **From run 3**: alert only on findings crossing the (by then tuned)
  thresholds; everything else collapses into one summary line per project.

Draft thresholds (POLICY DEFAULTS, not measurements — expect to tune):
- uncommitted work whose oldest change is > 7 days old
- branch ≥ 5 commits ahead of upstream, or ahead at all for > 7 days
- no upstream configured on a repo with > 10 commits
- generated storage > 2 GB in a project untouched for > 30 days
- non-git project modified within the last 14 days (active work, no VCS)
- stale prototype: no commit and no file modification for > 60 days
  (informational once, then muted unless its size grows)

## Output

1. `public/data/observatory.json` in the steward repo — so Steward can grow
   a surface for it later. Schema:

```json
{
  "generatedAt": "ISO",
  "asOfFetch": true,
  "roots": ["/Users/gentlegen/Desktop"],
  "projects": [{
    "name": "", "path": "", "vcs": "git|none",
    "branch": "", "ahead": 0, "behind": 0, "upstream": true,
    "uncommitted": 0, "oldestChangeDays": 0, "lastCommitDays": 0,
    "generatedBytes": 0, "lastModifiedDays": 0
  }],
  "alerts": [{ "project": "", "kind": "", "detail": "", "threshold": "" }],
  "calibration": true
}
```

   Implementer check before first write: confirm `npm run validate` in
   steward tolerates an unknown file in `public/data/` (if it hard-fails on
   unexpected files, add `observatory.json` to its known set first).

2. A concise report: alerts first (one line each, with the number that
   crossed the threshold), then one line per healthy project, then the
   token/output budget it used. Quiet weeks: "all projects quiet · <n>
   scanned · <date>".

## automation.toml to install (verbatim, pending owner "install")

```toml
version = 1
id = "project-observatory"
kind = "cron"
name = "Weekly Project Observatory"
prompt = """<the behavior above, condensed: roots, metadata-only rules, the
never-list, calibration-then-thresholds, both outputs. Written at install
time from this spec; the never-list and metadata-only rules are copied
verbatim, not summarized.>"""
status = "ACTIVE"
rrule = "RRULE:FREQ=WEEKLY;BYDAY=MO;BYHOUR=9;BYMINUTE=30"
model = "gpt-5.6-luna"
reasoning_effort = "xhigh"
execution_environment = "local"
cwds = ["/Users/gentlegen/Desktop"]
```

Schedule rationale: Monday 09:30 local — after the daily Morning Steward
(09:00) so the observatory reads a fresh Steward snapshot, weekly per the
audit (background work is where Luna xhigh is the right default). A strict
output cap belongs in the prompt ("report ≤ 60 lines").

Note: `target = { type = "project", ... }` is set at install time to the
correct project association — verified then, not copied from another
automation.

## Guardrails (hard, copied into the prompt verbatim at install)

- Never delete, move, rename, install, commit, push, or modify anything,
  anywhere — the ONLY write is `public/data/observatory.json` in steward.
- Never read file contents; metadata commands only (git reads, ls, du,
  stat). Never send paths deeper than project-level plus the marker files.
- No network: no git fetch, no API calls beyond the model run itself.
- If a root is missing or a command fails, report the gap; never guess.

## Acceptance criteria

- First (calibration) run: every Desktop project appears exactly once in
  observatory.json; numbers for one hand-checked repo (steward) match
  `git status`/`git rev-list`/`du` run manually; `calibration: true`.
- The transcript of a run contains no file-content reads and no writes
  outside `public/data/observatory.json`.
- `npm run validate` in steward still passes after the file is written.
- A simulated quiet week (thresholds raised) produces the single quiet line.
