# Spec — session-checkpoint (Codex skill)

Status: SPEC — approved for drafting 2026-08-30; not yet installed.
Install target: `~/.codex/skills/session-checkpoint/SKILL.md`
Origin: architecture audit item 4 ("highest-value new skill"). Steward's own
data shows long sessions have a median around 71 minutes
(`public/data/workflow-insights.json`), which is long enough to lose state in.

## Purpose

One command that captures where a working session actually stands — so a
session can be dropped and resumed, or handed to another agent, without
re-deriving anything. Read-only by default. Nothing leaves the machine.

## Invocation

`/session-checkpoint` (no args) — print the checkpoint block.
`/session-checkpoint --save` — also append it to `.checkpoints/` in the
project root (see Persistence).
`/session-checkpoint --run-tests` — additionally run the project's test
command and include its live result. Without this flag the skill NEVER runs
tests; it reports only what already ran this session, or `not run`.

## The checkpoint block (fixed template — all six fields, always)

```
CHECKPOINT · <project name> · <ISO local datetime>

objective     <current objective in one line, plus decisions made this
               session as short bullets — from the conversation, not guessed>
git           <branch> · <n> changed files · <ahead>/<behind> vs <upstream>
               (or "no upstream" / "not a git repo")
tests         <command> → <pass/fail counts> at <time>  |  not run
risks         <unresolved risks, one line each; "none surfaced" is valid>
next step     <the exact next action, imperative, one line>
durability    committed & pushed | committed, NOT pushed (<n> ahead)
              | uncommitted work present (<n> files)
```

Rules for filling it:
- **objective / decisions / risks / next step** come from the session
  conversation. If the skill cannot state one honestly, it writes `unclear —
  ask` rather than inventing one.
- **git** facts come from commands, never from memory: `git rev-parse
  --abbrev-ref HEAD`, `git status --porcelain` (count + paths only),
  `git rev-list --left-right --count @{upstream}...HEAD`.
- **durability** is computed, not narrated: porcelain output non-empty →
  "uncommitted work present"; else ahead-count > 0 → "NOT pushed"; else
  "committed & pushed".
- Dates are always absolute (ISO), never "today"/"earlier".

## Privacy rules (hard)

- Read-only by default: the only commands are `git` reads and (with
  `--run-tests`) the project's own test command. No fetch, no push, no
  network, no installs.
- File PATHS and counts may appear in the checkpoint; file CONTENTS and
  diffs never do. `git diff` is not among the allowed commands.
- The checkpoint block contains no secrets by construction: it is built
  only from command output listed above plus conversation summary lines.

## Persistence (`--save`)

- Appends to `<project>/.checkpoints/<YYYY-MM-DD-HHMM>.md`.
- On first save in a repo, the skill checks whether `.checkpoints/` is
  gitignored and, if not, says so and asks before writing (checkpoints
  mention objectives and risks — the user decides whether those are
  repo history).

## SKILL.md to install (verbatim)

```markdown
---
name: session-checkpoint
description: "Capture where the current working session stands: objective and decisions, git state, test results, unresolved risks, exact next step, and whether work is committed/pushed/local-only. Read-only by default; never includes file contents or diffs; never uses the network. Use at natural pause points, before ending a long session, or before handing work to another agent."
---

# Session Checkpoint

When invoked, produce the checkpoint block below. Fill every field. Facts
about git come from running the listed read-only commands now — never from
memory of earlier output. Objective, decisions, risks, and next step come
from this session's conversation; write `unclear — ask` rather than invent.

Allowed commands: `git rev-parse --abbrev-ref HEAD`, `git status
--porcelain`, `git rev-list --left-right --count @{upstream}...HEAD`,
`git log --oneline -5`. With `--run-tests` only: the project's own test
command. Nothing else. No network. No file contents or diffs ever — paths
and counts only.

Template:

CHECKPOINT · <project> · <ISO local datetime>
objective     <one line + decision bullets>
git           <branch> · <n> changed files · <ahead>/<behind> vs <upstream>
tests         <command> → <result> at <time> | not run
risks         <one per line | none surfaced>
next step     <imperative, one line>
durability    committed & pushed | committed, NOT pushed (<n> ahead) | uncommitted work present (<n> files)

With `--save`: append the block to `.checkpoints/<YYYY-MM-DD-HHMM>.md` in
the project root; if `.checkpoints/` is not gitignored, say so and ask
before the first write. Dates always absolute.
```

## Acceptance criteria

- Invoked in the steward repo mid-session, the block's git and durability
  lines match `git status` / `git rev-list` run by hand.
- `tests` says `not run` when no tests ran this session and no flag given.
- No command outside the allowlist appears in the transcript of a run.
- A checkpoint saved with `--save` contains no file contents (spot-check:
  grep the saved file for any line of source code from the session's diffs
  — zero matches).
