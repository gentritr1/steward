import { cp, mkdir, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const outputRoot = path.join(projectRoot, "dist");

await rm(outputRoot, { recursive: true, force: true });
await mkdir(outputRoot, { recursive: true });

await Promise.all([
  cp(path.join(projectRoot, "index.html"), path.join(outputRoot, "index.html")),
  cp(path.join(projectRoot, "src"), path.join(outputRoot, "src"), { recursive: true }),
  cp(path.join(projectRoot, "public"), outputRoot, { recursive: true }),
]);

console.log(`Built Steward at ${outputRoot}`);
