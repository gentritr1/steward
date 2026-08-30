import { createReadStream, readFileSync } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { buildEvidencePacket } from "../server/steward-context.mjs";
import { AUTO_MODE, CLOUD_MODES, MODES, answerWithProvider, providerAvailability } from "../server/providers/select-provider.mjs";
import { estimateCostUsd } from "../server/providers/pricing.mjs";
import { routeWord } from "../server/providers/route-auto.mjs";
import { appendUsage, summarizeLedger } from "../server/usage-ledger.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(projectRoot, "src");
const dataDir = path.join(projectRoot, "public", "data");

/* ---- credentials ----

   Keys live in a .env file that is never committed and never served: the static
   allowlist below has no route to it, and this parser is the only thing that
   reads it. It sets a key only if the environment does not already have one, so
   an explicitly exported variable always wins over a file on disk, and it never
   prints, logs, or returns a value — only the names it set, which is what a
   startup line may safely say. */
export function loadEnvFile(filePath = path.join(projectRoot, ".env")) {
  let raw;
  try {
    raw = readFileSync(filePath, "utf8");
  } catch {
    /* no .env is the normal case, not an error */
    return [];
  }

  const applied = [];
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (trimmed.length === 0 || trimmed.startsWith("#")) continue;

    const separator = trimmed.indexOf("=");
    if (separator <= 0) continue;

    const key = trimmed.slice(0, separator).trim();
    const value = trimmed.slice(separator + 1).trim();
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(key)) continue;
    if (Object.hasOwn(process.env, key)) continue;

    process.env[key] = value;
    applied.push(key);
  }

  return applied;
}

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

/* the whole public surface: four exact files plus flat json under public/data.
   anything not named here is a 404 — never a 403, which would confirm it exists. */
const routes = new Map([
  ["/", path.join(projectRoot, "index.html")],
  ["/index.html", path.join(projectRoot, "index.html")],
  ["/src/main.js", path.join(srcDir, "main.js")],
  ["/src/styles.css", path.join(srcDir, "styles.css")],
]);

/* one flat json file, no subpaths, no leading dot */
const dataRoute = /^\/data\/[A-Za-z0-9][A-Za-z0-9._-]*\.json$/;

/* a route resolves to a file AND the directory that file must sit in, so a
   symlink pointing out of the tree fails the check after realpath */
function resolveRoute(pathname) {
  /* escapes are never needed by a real route, so they never reach decode */
  if (/[%\\\0]/.test(pathname)) return null;

  const direct = routes.get(pathname);
  if (direct) return { filePath: direct, baseDir: path.dirname(direct) };

  if (dataRoute.test(pathname)) {
    const filePath = path.join(dataDir, pathname.slice("/data/".length));
    return { filePath, baseDir: dataDir };
  }

  return null;
}

function notFound(response) {
  response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
}

/* ---- the assistant endpoint ---- */

/* the request body is a question, never a file, so the ceiling is small.
   the drain ceiling is what a client may still be sending after it was
   refused: past that the socket goes, before that we read and discard so the
   413 reaches the client instead of being lost to a reset connection. */
const BODY_LIMIT_BYTES = 4096;
const DRAIN_LIMIT_BYTES = BODY_LIMIT_BYTES * 8;
const MESSAGE_MAX_LENGTH = 500;
const BODY_KEYS = new Set(["message", "mode", "consent"]);

/* consent lives in the browser, because that is where it was given. AUTO is the
   one mode that has to know it server-side — it picks the provider — so the
   page states it per request, as booleans and nothing else. The shape is
   checked as strictly as the rest of the body: unknown provider, or a value
   that is not a boolean, is a bad request rather than a benefit of the doubt.
   An absent map means no consent, which routes local. */
function readConsent(value) {
  if (value === undefined) return { ok: true, consent: {} };
  if (value === null || typeof value !== "object" || Array.isArray(value)) return { ok: false };
  const consent = {};
  for (const [name, granted] of Object.entries(value)) {
    if (!CLOUD_MODES.includes(name) || typeof granted !== "boolean") return { ok: false };
    consent[name] = granted;
  }
  return { ok: true, consent };
}

/* what the ledger is told about a candidate that reached the contract.
   true  the answer returned satisfied the envelope contract.
   false a provider's candidate was rejected by it, twice, and local answered.
   null  there was no candidate to judge — an outage never produced one. */
function contractVerdict(result) {
  if (result.fallbackUsed !== true) return true;
  if (result.fallbackReason === "invalid") return false;
  return null;
}

function sendJson(response, status, payload) {
  const body = Buffer.from(JSON.stringify(payload), "utf8");
  response.writeHead(status, {
    "Cache-Control": "no-store",
    "Content-Length": body.length,
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
  }).end(body);
}

function readBody(request) {
  return new Promise((resolve) => {
    const chunks = [];
    let size = 0;
    let overflow = false;
    /* the request stream auto-destroys on end, so "did we cut the socket?" has
       to be recorded here rather than read back off request.destroyed later */
    let cut = false;

    request.on("data", (chunk) => {
      size += chunk.length;
      if (size > BODY_LIMIT_BYTES) {
        /* stop holding it the moment it is too big — the cap is about memory.
           what is already in flight is still read and discarded, so the 413
           reaches the client instead of dying with a reset connection. */
        overflow = true;
        chunks.length = 0;
        if (size > DRAIN_LIMIT_BYTES) {
          cut = true;
          request.destroy();
          resolve({ ok: false, reason: "too-large", cut });
        }
        return;
      }
      chunks.push(chunk);
    });

    request.on("end", () => {
      resolve(overflow
        ? { ok: false, reason: "too-large", cut }
        : { ok: true, text: Buffer.concat(chunks).toString("utf8") });
    });
    request.on("error", () => resolve({ ok: false, reason: "aborted", cut }));
  });
}

async function handleAssistant(request, response) {
  /* GET /api/assistant is not a route; it is a 404 like anything unlisted */
  if (request.method !== "POST") {
    notFound(response);
    return;
  }

  const body = await readBody(request);
  if (!body.ok) {
    /* a socket we cut, or a client that vanished, has nowhere to send a status */
    if (body.cut || body.reason === "aborted") return;
    sendJson(response, 413, { error: "request body too large" });
    return;
  }

  const contentType = String(request.headers["content-type"] ?? "");
  if (!/^application\/json\s*(?:;|$)/i.test(contentType)) {
    sendJson(response, 400, { error: "expected application/json" });
    return;
  }

  let parsed;
  try {
    parsed = JSON.parse(body.text);
  } catch {
    sendJson(response, 400, { error: "malformed json" });
    return;
  }

  if (parsed === null || typeof parsed !== "object" || Array.isArray(parsed)) {
    sendJson(response, 400, { error: "expected a json object" });
    return;
  }

  for (const key of Object.keys(parsed)) {
    if (!BODY_KEYS.has(key)) {
      sendJson(response, 400, { error: "unexpected field" });
      return;
    }
  }

  if (typeof parsed.message !== "string" || parsed.message.trim().length === 0 || parsed.message.length > MESSAGE_MAX_LENGTH) {
    sendJson(response, 400, { error: "message must be 1 to 500 characters" });
    return;
  }

  if (typeof parsed.mode !== "string") {
    sendJson(response, 400, { error: "mode is required" });
    return;
  }

  /* a mode this build does not implement is a bad request; a mode it implements
     but has no credential for is a missing capability. the two are different
     statuses because they call for different fixes. */
  if (!MODES.includes(parsed.mode)) {
    sendJson(response, 400, { error: "unsupported mode" });
    return;
  }

  const consent = readConsent(parsed.consent);
  if (!consent.ok) {
    sendJson(response, 400, { error: "consent must map a known provider to a boolean" });
    return;
  }

  try {
    const packet = await buildEvidencePacket(dataDir);
    /* measured here, around the answer and nothing else — not read off a wire */
    const started = performance.now();
    const result = await answerWithProvider({
      mode: parsed.mode,
      message: parsed.message,
      packet,
      consent: consent.consent,
    });
    const latencyMs = Math.round(performance.now() - started);

    if (result.error === "not_configured") {
      sendJson(response, 501, { error: "provider not configured", provider: result.provider });
      return;
    }
    if (result.error) {
      /* the provider refused this server, not this person. no answer is invented. */
      sendJson(response, 502, { error: "provider unavailable", provider: result.provider });
      return;
    }

    const { envelope, provider, model, fallbackUsed, traceId, requestedProvider, fallbackReason } = result;
    const payload = { ...envelope, provider, model, fallbackUsed, traceId };
    /* say who was asked and why the answer came from somewhere else. the
       contract errors behind a fallback stay server-side: they quote the
       provider's own prose back, and that is not something to echo to a page. */
    if (fallbackUsed) {
      payload.requestedProvider = requestedProvider;
      payload.fallbackReason = fallbackReason;
    }

    /* tokens belong to whoever was ASKED. on a fallback the answer is stamped
       local — that is who wrote the sentence — but the tokens, and therefore
       the price, belong to the cloud model that produced the candidate the
       contract rejected. The ledger records the model that spent them. */
    const billedModel = result.requestedModel ?? model;
    /* the cost is inferred from a configured rate card, never measured, and it
       is computed once — here — so the stamp on the answer and the line in the
       ledger are the same number rather than two estimates of one. */
    const estCostUsd = result.usage ? estimateCostUsd(billedModel, result.usage) : null;

    /* the routing stamps ride only on an AUTO turn. an explicitly chosen mode
       had no route to resolve, and stamping one would be an invented fact. */
    if (parsed.mode === AUTO_MODE) {
      payload.route = result.route ?? null;
      payload.routeReason = result.routeReason ?? null;
      payload.estCostUsd = estCostUsd;
    }

    /* the line is written before the reply goes out, so "it answered" and "it
       was accounted for" cannot come apart under a client that reads the ledger
       the instant it has the answer. It cannot fail the request: appendUsage
       swallows everything and returns a boolean nobody is required to read.
       AUTO is logged whichever way it routed — a local route is the routing
       result that matters most, and it is the one that costs nothing. */
    if (parsed.mode === AUTO_MODE || CLOUD_MODES.includes(parsed.mode)) {
      await appendUsage({
        traceId,
        mode: parsed.mode,
        route: result.route ?? routeWord(provider),
        provider,
        model: billedModel,
        effort: result.effort ?? null,
        tokensIn: result.usage?.inputTokens ?? null,
        /* neither adapter reads a cached-token count today. null is "not
           reported", which is not the same claim as zero. */
        tokensCached: result.usage?.cachedTokens ?? null,
        tokensOut: result.usage?.outputTokens ?? null,
        latencyMs,
        valid: contractVerdict(result),
        fallbackUsed,
        routeReason: result.routeReason ?? `explicit:${routeWord(parsed.mode) ?? parsed.mode}`,
        estCostUsd,
      });
    }

    sendJson(response, 200, payload);
  } catch {
    /* never surface the reason: it would describe local files */
    sendJson(response, 500, { error: "assistant unavailable" });
  }
}

/* which providers this server could reach, as three booleans. never a key,
   never a fragment of one, never a length. */
function handleProviders(request, response) {
  if (request.method !== "GET") {
    notFound(response);
    return;
  }
  sendJson(response, 200, providerAvailability());
}

/* what the assistant has spent, in aggregate and only in aggregate. the ledger
   itself is never served, never listed, and has no route: this endpoint reads
   it and returns counts, token totals and estimated dollars per route. Every
   dollar here is inferred from a configured rate card — pricesAsOf says which —
   and the UI is required to mark it `~` rather than measured. */
async function handleUsage(request, response) {
  if (request.method !== "GET") {
    notFound(response);
    return;
  }
  try {
    sendJson(response, 200, await summarizeLedger());
  } catch {
    sendJson(response, 500, { error: "usage unavailable" });
  }
}

/* the evidence packet exactly as an adapter would receive it, so "preview
   context" in the UI shows the real thing rather than a description of it.
   It is safe to serve because it is redacted by construction: nothing that
   builds it ever copies a name, a label, a path, or a line of prose. */
async function handleContext(request, response) {
  if (request.method !== "GET") {
    notFound(response);
    return;
  }
  try {
    sendJson(response, 200, await buildEvidencePacket(dataDir));
  } catch {
    sendJson(response, 500, { error: "context unavailable" });
  }
}

async function handle(request, response) {
  let pathname;
  try {
    pathname = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname;
  } catch {
    notFound(response);
    return;
  }

  /* the api surface is four exact routes; everything else under /api/ is a
     404, and the static rules below are left exactly as they were */
  if (pathname.startsWith("/api/")) {
    if (pathname === "/api/assistant") await handleAssistant(request, response);
    else if (pathname === "/api/assistant/providers") handleProviders(request, response);
    else if (pathname === "/api/assistant/context") await handleContext(request, response);
    else if (pathname === "/api/assistant/usage") await handleUsage(request, response);
    else notFound(response);
    return;
  }

  const route = resolveRoute(pathname);
  if (!route) {
    notFound(response);
    return;
  }

  try {
    /* realpath first: the served path must be the real path, inside the project
       root and inside the directory its own route class owns */
    const rootReal = await realpath(projectRoot);
    const baseReal = await realpath(route.baseDir);
    const fileReal = await realpath(route.filePath);

    if (!baseReal.startsWith(rootReal + path.sep) && baseReal !== rootReal) throw new Error("Base escaped root");
    if (path.dirname(fileReal) !== baseReal) throw new Error("File escaped its directory");

    const fileStat = await stat(fileReal);
    if (!fileStat.isFile()) throw new Error("Not a file");

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes.get(path.extname(fileReal)) ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(fileReal).pipe(response);
  } catch {
    notFound(response);
  }
}

export function createServer() {
  return http.createServer(handle);
}

export function startServer(port = 4173) {
  const server = createServer();
  return new Promise((resolve) => {
    server.listen(port, "127.0.0.1", () => resolve(server));
  });
}

/* `node scripts/dev-server.mjs` still starts the server; importing it does not.
   .env is read here and not at import, so a test that imports startServer gets
   the environment it set up, never whatever happens to be on this machine. */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const applied = loadEnvFile();
  const requestedPort = Number.parseInt(process.env.STEWARD_PORT ?? "4173", 10);
  const port = Number.isFinite(requestedPort) ? requestedPort : 4173;
  startServer(port).then(() => {
    console.log(`Steward is available at http://127.0.0.1:${port}`);
    /* names only. a value never reaches this line. */
    if (applied.length > 0) console.log(`loaded from .env: ${applied.join(", ")}`);
    const available = providerAvailability();
    console.log(`providers: ${Object.entries(available).map(([name, ok]) => `${name} ${ok ? "yes" : "no"}`).join(", ")}`);
  });
}
