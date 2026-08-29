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

test("a cloud mode is refused, never quietly answered locally", async () => {
  const response = await request({ body: JSON.stringify({ message: "how much free space?", mode: "openai" }) });
  assert.equal(response.status, 501);
  assert.deepEqual(JSON.parse(response.body), { error: "cloud modes not configured" });
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
