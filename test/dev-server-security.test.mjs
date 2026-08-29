import assert from "node:assert/strict";
import { mkdtemp, rm, symlink, unlink, writeFile } from "node:fs/promises";
import net from "node:net";
import os from "node:os";
import path from "node:path";
import test, { after, before } from "node:test";
import { fileURLToPath } from "node:url";

import { startServer } from "../scripts/dev-server.mjs";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dataDir = path.join(projectRoot, "public", "data");

let server;

before(async () => {
  /* port 0 = an ephemeral port, so the test never fights a dev server on 4173 */
  server = await startServer(0);
});

after(() => {
  server?.close();
});

/* fetch() normalises `/data/../package.json` away before it reaches the wire,
   so the request target is written by hand — otherwise the traversal cases
   would be testing the client, not the server. */
function rawStatus(requestPath) {
  return new Promise((resolve, reject) => {
    const socket = net.connect(server.address().port, "127.0.0.1", () => {
      socket.write(`GET ${requestPath} HTTP/1.1\r\nHost: 127.0.0.1\r\nConnection: close\r\n\r\n`);
    });
    let response = "";
    socket.setEncoding("utf8");
    socket.on("data", (chunk) => { response += chunk; });
    socket.on("error", reject);
    socket.on("close", () => {
      const match = /^HTTP\/1\.1 (\d{3})/.exec(response);
      resolve(match ? Number(match[1]) : 0);
    });
  });
}

const allowed = ["/", "/index.html", "/src/main.js", "/src/styles.css", "/data/latest.json"];

for (const route of allowed) {
  test(`allows ${route}`, async () => {
    assert.equal(await rawStatus(route), 200);
  });
}

const blocked = [
  "/scripts/dev-server.mjs",
  "/package.json",
  "/.git/config",
  "/.env",
  "/data/../package.json",
  "/data/%2e%2e/package.json",
  "/src/../scripts/build.mjs",
  "//etc/passwd",
  "/data/sub/x.json",
];

for (const route of blocked) {
  test(`blocks ${route}`, async () => {
    assert.equal(await rawStatus(route), 404);
  });
}

test("blocks a symlink inside public/data that points out of the project", async () => {
  const linkPath = path.join(dataDir, "escape.json");
  let outsideDir = null;
  let linked = false;
  try {
    outsideDir = await mkdtemp(path.join(os.tmpdir(), "steward-escape-"));
    const outsideFile = path.join(outsideDir, "secret.json");
    /* a real, readable file outside the tree — so a 404 proves the containment
       check fired, not that the target was simply missing */
    await writeFile(outsideFile, '{"secret":true}\n');
    try {
      await symlink(outsideFile, linkPath);
      linked = true;
    } catch {
      /* platforms without symlink permission have nothing to assert here */
      return;
    }
    assert.equal(await rawStatus("/data/escape.json"), 404);
  } finally {
    if (linked) await unlink(linkPath).catch(() => {});
    if (outsideDir) await rm(outsideDir, { recursive: true, force: true }).catch(() => {});
  }
});
