const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawnSync } = require("node:child_process");
const path = require("node:path");

test("server.js parses before the application starts", () => {
  const serverPath = path.join(__dirname, "..", "server.js");
  const result = spawnSync(process.execPath, ["--check", serverPath], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout || "server.js failed syntax validation");
});
