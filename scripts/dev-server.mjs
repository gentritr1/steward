import { createReadStream } from "node:fs";
import { realpath, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const srcDir = path.join(projectRoot, "src");
const dataDir = path.join(projectRoot, "public", "data");

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

async function handle(request, response) {
  let pathname;
  try {
    pathname = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`).pathname;
  } catch {
    notFound(response);
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

/* `node scripts/dev-server.mjs` still starts the server; importing it does not */
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const requestedPort = Number.parseInt(process.env.STEWARD_PORT ?? "4173", 10);
  const port = Number.isFinite(requestedPort) ? requestedPort : 4173;
  startServer(port).then(() => {
    console.log(`Steward is available at http://127.0.0.1:${port}`);
  });
}
