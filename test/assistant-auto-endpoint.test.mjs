/* AUTO and the usage endpoint, end to end over a real socket, with no keys.

   This is the keyless reality the product ships in: nothing is configured, so
   every route resolves local with an honest reason, and the ledger records the
   turns anyway — which is the only way routing efficacy is ever learnable.

   The ledger is pointed at a temp file for the life of this process, so the
   suite never writes to the project's own data/usage/. */

import assert from "node:assert/strict";
import { mkdtempSync, readFileSync } from "node:fs";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import { rm } from "node:fs/promises";
import test, { after, before } from "node:test";

import { LEDGER_FIELDS } from "../server/usage-ledger.mjs";
import { PRICING } from "../server/providers/pricing.mjs";
import { startServer } from "../scripts/dev-server.mjs";

const QUESTION_KNOWN = "how much free space do i have?";
const QUESTION_UNKNOWN = "so what do you honestly make of all this, Beatrice?";

let server;
let directory;
let ledgerFile;
const savedLedger = process.env.STEWARD_USAGE_LEDGER;

before(async () => {
  /* the verdict must be the same on a machine that has keys exported as on one
     that does not — this suite is about the keyless path */
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  directory = mkdtempSync(path.join(os.tmpdir(), "steward-auto-"));
  ledgerFile = path.join(directory, "usage", "ledger.jsonl");
  process.env.STEWARD_USAGE_LEDGER = ledgerFile;
  /* port 0, never 4173 or 4180: this suite must not touch a running dev server */
  server = await startServer(0);
});

after(async () => {
  server?.close();
  if (savedLedger === undefined) delete process.env.STEWARD_USAGE_LEDGER;
  else process.env.STEWARD_USAGE_LEDGER = savedLedger;
  await rm(directory, { recursive: true, force: true });
});

function request({ method = "POST", target = "/api/assistant", contentType = "application/json", body = "" }) {
  return new Promise((resolve, reject) => {
    const payload = Buffer.from(body, "utf8");
    let raw = "";
    let settled = false;

    const finish = () => {
      if (settled) return;
      settled = true;
      const [head, ...rest] = raw.split("\r\n\r\n");
      const status = Number(/^HTTP\/1\.1 (\d{3})/.exec(head)?.[1] ?? 0);
      resolve({ status, headers: head.toLowerCase(), body: rest.join("\r\n\r\n") });
    };

    const socket = net.connect(server.address().port, "127.0.0.1", () => {
      const lines = [`${method} ${target} HTTP/1.1`, "Host: 127.0.0.1", "Connection: close"];
      if (contentType !== null) lines.push(`Content-Type: ${contentType}`);
      lines.push(`Content-Length: ${payload.length}`);
      socket.write(`${lines.join("\r\n")}\r\n\r\n`);
      if (payload.length > 0) socket.write(payload);
    });

    socket.setEncoding("utf8");
    socket.on("data", (chunk) => { raw += chunk; });
    socket.on("error", (error) => (raw ? finish() : reject(error)));
    socket.on("close", finish);
  });
}

function ledgerLines() {
  try {
    return readFileSync(ledgerFile, "utf8").trim().split("\n").filter(Boolean).map((line) => JSON.parse(line));
  } catch {
    return [];
  }
}

/* runs first, deliberately: the ledger does not exist yet */
test("GET /api/assistant/usage answers zeros before anything has been asked", async () => {
  const response = await request({ method: "GET", target: "/api/assistant/usage", contentType: null, body: "" });
  assert.equal(response.status, 200);
  assert.match(response.headers, /cache-control: no-store/);
  const payload = JSON.parse(response.body);
  assert.equal(payload.entries, 0);
  assert.deepEqual(payload.totals, { calls: 0, tokensIn: 0, tokensOut: 0, estCostUsd: 0, fallbacks: 0, invalid: 0 });
  assert.equal(payload.pricesAsOf, PRICING.pricesAsOf);
});

test("AUTO answers a known question locally, stamps the route, and logs one line", async () => {
  const response = await request({ body: JSON.stringify({ message: QUESTION_KNOWN, mode: "auto" }) });
  assert.equal(response.status, 200);

  const payload = JSON.parse(response.body);
  assert.equal(payload.provider, "local");
  assert.equal(payload.model, "deterministic-v1");
  assert.equal(payload.fallbackUsed, false);
  assert.equal(payload.route, "local");
  assert.equal(payload.routeReason, "known-intent:space");
  assert.equal(payload.estCostUsd, null);
  assert.equal(payload.epistemicState, "measured");

  const lines = ledgerLines();
  assert.equal(lines.length, 1);
  const line = lines[0];
  assert.deepEqual(Object.keys(line).sort(), [...LEDGER_FIELDS].sort());
  assert.equal(line.mode, "auto");
  assert.equal(line.route, "local");
  assert.equal(line.provider, "local");
  assert.equal(line.routeReason, "known-intent:space");
  assert.equal(line.traceId, payload.traceId);
  assert.equal(line.tokensIn, null);
  assert.equal(line.tokensOut, null);
  assert.equal(line.estCostUsd, null);
  assert.equal(line.valid, true);
  assert.equal(line.fallbackUsed, false);
  assert.equal(typeof line.latencyMs, "number");

  /* the question itself is nowhere in the line. the intent NAME is — it is one
     of five enum values the classifier can produce, not a fragment of what was
     typed, and "which of five branches ran" is the whole point of the record. */
  for (const phrase of ["how much", "free space", "do i have", "?"]) {
    assert.ok(!JSON.stringify(line).includes(phrase), `"${phrase}" reached the ledger`);
  }
});

test("AUTO with no keys answers an unknown question locally — never a 501", async () => {
  const response = await request({ body: JSON.stringify({ message: QUESTION_UNKNOWN, mode: "auto" }) });
  assert.equal(response.status, 200);
  const payload = JSON.parse(response.body);
  assert.equal(payload.route, "local");
  assert.equal(payload.routeReason, "no-cloud:local");
  assert.equal(payload.provider, "local");
  assert.equal(payload.estCostUsd, null);
  assert.equal(ledgerLines().length, 2);
});

test("consent for a provider with no key still cannot conjure a cloud route", async () => {
  const response = await request({
    body: JSON.stringify({ message: QUESTION_UNKNOWN, mode: "auto", consent: { openai: true, anthropic: true } }),
  });
  assert.equal(response.status, 200);
  const payload = JSON.parse(response.body);
  assert.equal(payload.route, "local");
  assert.equal(payload.routeReason, "no-cloud:local");
});

test("an explicitly chosen mode is not stamped with a route it never resolved", async () => {
  const response = await request({ body: JSON.stringify({ message: QUESTION_KNOWN, mode: "local" }) });
  assert.equal(response.status, 200);
  const payload = JSON.parse(response.body);
  for (const key of ["route", "routeReason", "estCostUsd"]) {
    assert.equal(Object.hasOwn(payload, key), false, `local mode was stamped with "${key}"`);
  }
  /* and an explicit local turn is not the ledger's business */
  assert.equal(ledgerLines().length, 3);
});

const badConsents = [
  ["a non-object", JSON.stringify({ message: QUESTION_KNOWN, mode: "auto", consent: "yes" })],
  ["an array", JSON.stringify({ message: QUESTION_KNOWN, mode: "auto", consent: ["openai"] })],
  ["a provider this build does not have", JSON.stringify({ message: QUESTION_KNOWN, mode: "auto", consent: { gemini: true } })],
  ["a non-boolean value", JSON.stringify({ message: QUESTION_KNOWN, mode: "auto", consent: { openai: "granted" } })],
  ["a smuggled key", JSON.stringify({ message: QUESTION_KNOWN, mode: "auto", consent: { openai: { apiKey: "sk-test" } } })],
];

for (const [label, body] of badConsents) {
  test(`consent as ${label} is a bad request`, async () => {
    assert.equal((await request({ body })).status, 400);
  });
}

test("the usage endpoint aggregates the turns, and is GET-only", async () => {
  const response = await request({ method: "GET", target: "/api/assistant/usage", contentType: null, body: "" });
  assert.equal(response.status, 200);
  const payload = JSON.parse(response.body);
  assert.equal(payload.entries, 3);
  assert.equal(payload.totals.calls, 3);
  assert.equal(payload.byRoute.local.calls, 3);
  assert.equal(payload.byRoute.openai.calls, 0);
  assert.equal(payload.totals.estCostUsd, 0);
  /* aggregates only: no line, no question, no trace of one */
  assert.deepEqual(Object.keys(payload).sort(), ["byRoute", "entries", "pricesAsOf", "totals", "unreadable"]);
  assert.equal((await request({ target: "/api/assistant/usage", body: "{}" })).status, 404);
});

test("auto is an accepted mode and gemini still is not", async () => {
  assert.equal((await request({ body: JSON.stringify({ message: QUESTION_KNOWN, mode: "gemini" }) })).status, 400);
  assert.equal((await request({ body: JSON.stringify({ message: QUESTION_KNOWN, mode: "auto" }) })).status, 200);
});
