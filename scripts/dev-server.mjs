import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const requestedPort = Number.parseInt(process.env.STEWARD_PORT ?? "4173", 10);
const port = Number.isFinite(requestedPort) ? requestedPort : 4173;

const contentTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
]);

function resolveRequestPath(urlPath) {
  if (urlPath.startsWith("/data/")) {
    return path.join(projectRoot, "public", urlPath);
  }

  if (urlPath === "/" || urlPath === "/index.html") {
    return path.join(projectRoot, "index.html");
  }

  return path.join(projectRoot, urlPath);
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? "/", `http://${request.headers.host ?? "localhost"}`);
  const filePath = path.resolve(resolveRequestPath(decodeURIComponent(requestUrl.pathname)));

  if (!filePath.startsWith(projectRoot + path.sep)) {
    response.writeHead(403).end("Forbidden");
    return;
  }

  try {
    const fileStat = await stat(filePath);
    if (!fileStat.isFile()) {
      throw new Error("Not a file");
    }

    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": contentTypes.get(path.extname(filePath)) ?? "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
    });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }).end("Not found");
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Steward is available at http://127.0.0.1:${port}`);
});
