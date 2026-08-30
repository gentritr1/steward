import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";

import { loadEnvFile } from "../scripts/dev-server.mjs";

async function withEnvFile(contents, run) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "steward-env-"));
  const filePath = path.join(dir, ".env");
  try {
    await writeFile(filePath, contents);
    await run(filePath);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function withCleanKeys(names, run) {
  const saved = Object.fromEntries(names.map((name) => [name, process.env[name]]));
  for (const name of names) delete process.env[name];
  try {
    return run();
  } finally {
    for (const [name, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[name];
      else process.env[name] = value;
    }
  }
}

test("a missing .env is the normal case, not an error", () => {
  assert.deepEqual(loadEnvFile(path.join(os.tmpdir(), "steward-no-such-file-.env")), []);
});

test("keys are read, comments and blank lines are not", async () => {
  await withEnvFile(
    [
      "# a comment",
      "",
      "  STEWARD_TEST_ONE=alpha  ",
      "STEWARD_TEST_TWO=beta=with=equals",
      "   ",
      "# STEWARD_TEST_COMMENTED=nope",
      "not a pair",
      "1BAD_NAME=nope",
    ].join("\n"),
    async (filePath) => {
      await withCleanKeys(["STEWARD_TEST_ONE", "STEWARD_TEST_TWO", "STEWARD_TEST_COMMENTED", "1BAD_NAME"], () => {
        const applied = loadEnvFile(filePath);
        assert.deepEqual(applied, ["STEWARD_TEST_ONE", "STEWARD_TEST_TWO"]);
        assert.equal(process.env.STEWARD_TEST_ONE, "alpha");
        /* only the first `=` splits, so a value may contain more of them */
        assert.equal(process.env.STEWARD_TEST_TWO, "beta=with=equals");
        assert.equal(Object.hasOwn(process.env, "STEWARD_TEST_COMMENTED"), false);
        assert.equal(Object.hasOwn(process.env, "1BAD_NAME"), false);
      });
    },
  );
});

test("an exported variable always wins over the file", async () => {
  await withEnvFile("STEWARD_TEST_ONE=from-the-file\n", async (filePath) => {
    await withCleanKeys(["STEWARD_TEST_ONE"], () => {
      process.env.STEWARD_TEST_ONE = "from-the-shell";
      const applied = loadEnvFile(filePath);
      assert.deepEqual(applied, [], "an already-set key is reported as untouched");
      assert.equal(process.env.STEWARD_TEST_ONE, "from-the-shell");
    });
  });
});

test("the return value carries names, never values", async () => {
  await withEnvFile("STEWARD_TEST_SECRET=sk-do-not-print-me\n", async (filePath) => {
    await withCleanKeys(["STEWARD_TEST_SECRET"], () => {
      const applied = loadEnvFile(filePath);
      assert.deepEqual(applied, ["STEWARD_TEST_SECRET"]);
      /* the startup line prints this array; it must not be able to leak a key */
      assert.equal(applied.join(", ").includes("sk-do-not-print-me"), false);
    });
  });
});
