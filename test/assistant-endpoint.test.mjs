import assert from "node:assert/strict";
import net from "node:net";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import { buildEvidencePacket } from "../server/steward-context.mjs";
import { validateEnvelope } from "../server/steward-contract.mjs";
import { startServer } from "../scripts/dev-server.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(projectRoot, "public", "data");

let server;

before(async () => {
  /* This suite exercises the endpoint's refusal paths, and it must reach the
     same verdict on a machine that happens to have keys exported as on one that
     does not — so the keys are removed for the life of this process. The dev
     server reads .env only from its CLI entry point, never on import, so an
     imported server starts from exactly this environment and nothing else.
     Cloud modes are deliberately never driven end-to-end here: that would open
     a socket. The router is covered against mock transports at module level in
     provider-router.test.mjs. */
  delete process.env.OPENAI_API_KEY;
  delete process.env.ANTHROPIC_API_KEY;
  /* port 0, never 4173: this suite must not touch a dev server the user is running */
  server = await startServer(0);
});

after(() => {
  server?.close();
});

/* raw sockets, so the content-type, the body, and the content-length are
   exactly what the test says they are — fetch() would fix them up */
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
    /* a refused oversize body may end in a reset; whatever arrived still counts */
    socket.on("error", (error) => (raw ? finish() : reject(error)));
    socket.on("close", finish);
  });
}

test("POST /api/assistant in local mode returns a valid stamped envelope", async () => {
  const response = await request({ body: JSON.stringify({ message: "how much free space do i have?", mode: "local" }) });
  assert.equal(response.status, 200);
  assert.match(response.headers, /cache-control: no-store/);
  assert.match(response.headers, /content-type: application\/json/);

  const payload = JSON.parse(response.body);
  assert.equal(payload.provider, "local");
  assert.equal(payload.model, "deterministic-v1");
  assert.equal(payload.fallbackUsed, false);
  assert.match(payload.traceId, /^[0-9a-f]{12}$/);

  const { provider, model, fallbackUsed, traceId, ...envelope } = payload;
  const packet = await buildEvidencePacket(dataDir);
  const result = validateEnvelope(envelope, {
    knownEvidenceIds: packet.evidenceIds,
    knownReclaimIds: packet.reclaimItems.map((item) => item.id),
  });
  assert.deepEqual(result.errors, []);
});

test("an unrecognised question still answers, and still validates", async () => {
  const response = await request({ body: JSON.stringify({ message: "asdfjkl", mode: "local" }) });
  assert.equal(response.status, 200);
  const payload = JSON.parse(response.body);
  assert.equal(payload.epistemicState, "unavailable");
  assert.deepEqual(payload.evidenceIds, []);
  assert.equal(payload.nextStep, null);
});

/* an implemented provider with no credential is a missing capability (501);
   a mode this build does not implement is a bad request (400). neither one
   ever answers locally while wearing a cloud provider's name. */
for (const mode of ["openai", "anthropic"]) {
  test(`${mode} with no key is refused, never quietly answered locally`, async () => {
    const response = await request({ body: JSON.stringify({ message: "how much free space?", mode }) });
    assert.equal(response.status, 501);
    assert.deepEqual(JSON.parse(response.body), { error: "provider not configured", provider: mode });
  });
}

test("a mode this build does not implement is a bad request", async () => {
  const response = await request({ body: JSON.stringify({ message: "how much free space?", mode: "gemini" }) });
  assert.equal(response.status, 400);
  assert.deepEqual(JSON.parse(response.body), { error: "unsupported mode" });
});

test("GET /api/assistant/providers reports booleans and never key material", async () => {
  const response = await request({ method: "GET", target: "/api/assistant/providers", contentType: null, body: "" });
  assert.equal(response.status, 200);
  assert.match(response.headers, /cache-control: no-store/);

  const payload = JSON.parse(response.body);
  assert.deepEqual(payload, { local: true, openai: false, anthropic: false });
  for (const value of Object.values(payload)) assert.equal(typeof value, "boolean");
});

test("GET /api/assistant/context serves the redacted packet the adapters receive", async () => {
  const response = await request({ method: "GET", target: "/api/assistant/context", contentType: null, body: "" });
  assert.equal(response.status, 200);
  assert.match(response.headers, /cache-control: no-store/);

  const payload = JSON.parse(response.body);
  assert.deepEqual(Object.keys(payload).sort(), ["evidence", "evidenceIds", "generatedAt", "reclaimItems"]);
  /* it is the same builder the endpoint answers from, so the two cannot drift */
  const packet = await buildEvidencePacket(dataDir);
  assert.deepEqual(payload.evidenceIds, packet.evidenceIds);
  /* redacted by construction: numbers, slugs, and units only */
  for (const entry of Object.values(payload.evidence)) {
    assert.equal(typeof entry.value, "number");
    assert.deepEqual(Object.keys(entry).sort(), ["kind", "unit", "value"]);
  }
  for (const item of payload.reclaimItems) {
    assert.match(item.id, /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  }
});

test("the two new GET routes are GET-only", async () => {
  assert.equal((await request({ target: "/api/assistant/providers", body: "{}" })).status, 404);
  assert.equal((await request({ target: "/api/assistant/context", body: "{}" })).status, 404);
});

test("a body over 4096 bytes is refused", async () => {
  const oversize = JSON.stringify({ message: "a".repeat(5000), mode: "local" });
  assert.ok(Buffer.byteLength(oversize) > 4096);
  const response = await request({ body: oversize });
  assert.equal(response.status, 413);
});

test("a non-json content type is refused", async () => {
  const response = await request({
    contentType: "text/plain",
    body: JSON.stringify({ message: "how much free space?", mode: "local" }),
  });
  assert.equal(response.status, 400);
});

test("garbage json is refused", async () => {
  const response = await request({ body: '{"message": "hi", ' });
  assert.equal(response.status, 400);
});

const badBodies = [
  ["a missing message", JSON.stringify({ mode: "local" })],
  ["an empty message", JSON.stringify({ message: "   ", mode: "local" })],
  ["a message over 500 characters", JSON.stringify({ message: "a".repeat(501), mode: "local" })],
  ["a non-string message", JSON.stringify({ message: 42, mode: "local" })],
  ["a missing mode", JSON.stringify({ message: "how much free space?" })],
  ["an unexpected field", JSON.stringify({ message: "how much free space?", mode: "local", apiKey: "sk-test" })],
  ["a json array", JSON.stringify([{ message: "how much free space?", mode: "local" }])],
  ["a bare string", JSON.stringify("how much free space?")],
];

for (const [label, body] of badBodies) {
  test(`rejects ${label}`, async () => {
    assert.equal((await request({ body })).status, 400);
  });
}

test("GET /api/assistant is not a route", async () => {
  assert.equal((await request({ method: "GET", contentType: null, body: "" })).status, 404);
});

test("no other /api path exists", async () => {
  assert.equal((await request({ target: "/api/keys", body: "{}" })).status, 404);
  assert.equal((await request({ method: "GET", target: "/api/", contentType: null, body: "" })).status, 404);
});

test("the static surface still behaves exactly as before", async () => {
  assert.equal((await request({ method: "GET", target: "/", contentType: null, body: "" })).status, 200);
  assert.equal((await request({ method: "GET", target: "/data/latest.json", contentType: null, body: "" })).status, 200);
  assert.equal((await request({ method: "GET", target: "/package.json", contentType: null, body: "" })).status, 404);
  assert.equal((await request({ method: "GET", target: "/data/../package.json", contentType: null, body: "" })).status, 404);
});
