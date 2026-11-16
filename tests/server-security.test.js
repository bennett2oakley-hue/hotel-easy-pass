const { test } = require("node:test");
const assert = require("node:assert/strict");
const { spawn } = require("node:child_process");
const http = require("node:http");

function request(port, method, path) {
  return new Promise((resolve, reject) => {
    const req = http.request({ hostname: "127.0.0.1", port, method, path }, res => {
      let body = "";
      res.setEncoding("utf8");
      res.on("data", chunk => body += chunk);
      res.on("end", () => resolve({ status: res.statusCode, headers: res.headers, body }));
    });
    req.on("error", reject);
    req.end();
  });
}

test("static server enforces safe methods, paths, and security headers", async () => {
  const port = 20000 + Math.floor(Math.random() * 20000);
  const child = spawn(process.execPath, ["server.js"], { env: { ...process.env, PORT: String(port) }, stdio: "ignore" });
  try {
    let ready = false;
    for (let i = 0; i < 40 && !ready; i++) {
      try { await request(port, "GET", "/health"); ready = true; } catch { await new Promise(r => setTimeout(r, 50)); }
    }
    assert.equal(ready, true, "server should start");
    const home = await request(port, "GET", "/");
    assert.equal(home.status, 200);
    assert.equal(home.headers["x-content-type-options"], "nosniff");
    assert.equal(home.headers["x-frame-options"], "DENY");
    assert.equal(home.headers["content-security-policy"].includes("frame-ancestors 'none'"), true);

    const post = await request(port, "POST", "/");
    assert.equal(post.status, 405);
    assert.equal(post.headers.allow, "GET, HEAD");

    const dotfile = await request(port, "GET", "/.env");
    assert.equal(dotfile.status, 403);

    const malformed = await request(port, "GET", "/%E0%A4%A");
    assert.equal(malformed.status, 400);

    // A decoded NUL must be rejected before filesystem access.
    const nulPath = await request(port, "GET", "/%00");
    assert.equal(nulPath.status, 403);

    const traversal = await request(port, "GET", "/..%2F..%2Fetc%2Fpasswd");
    assert.equal([403, 404].includes(traversal.status), true);
  } finally {
    child.kill("SIGTERM");
  }
});
