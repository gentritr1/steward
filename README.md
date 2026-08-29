# Steward

Steward is a private, local-first operations brief for your Mac. Draft 1 records a daily disk-storage snapshot, explains meaningful changes, identifies reproducible data that may be reclaimable, and surfaces privacy-safe workflow patterns from recent agent work.

The **Learn** section adds a seven-day visual Field Guide. It begins with RAM versus SSD storage, introduces the proper technical terms after a plain-language analogy, and clearly labels every interactive model as an example rather than live machine data.

Scheduled scans are read-only. Steward never deletes files automatically.

## Daily brief

The active **Morning Steward** automation uses Luna with extra-high reasoning and refreshes the brief every day at 09:00 in the Mac's local time. It also adds a Field Guide lesson when the current calendar day is missing, preserving the published archive. Because the scan reads local files, the Mac must be awake and Codex must be running when the task is due. A missed local run can be refreshed manually with `npm run collect`.

## Run locally

```sh
npm run collect
npm run dev
```

Open `http://127.0.0.1:4173`.

## Verify

```sh
npm test
```

## Local data

- `public/data/latest.json` — the latest storage reading and recommendations
- `public/data/history.json` — up to 90 daily readings
- `public/data/workflow-insights.json` — aggregated task-pattern signals, never prompt bodies
- `public/data/events.json` — cleanup and intervention receipts
- `public/data/lessons.json` — the seven-day educational lesson feed
- `data/snapshots/` — timestamped raw snapshots used to maintain history; snapshots older than 90 days are removed by the collector

The collector records directory sizes, project names, and classification metadata. It does not read document contents or delete anything.

For a separate-agent visual exploration, use `ART_DIRECTION_PROMPT.md` without changing the production dashboard first.
