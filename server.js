const http = require("http");
const fs = require("fs");
const path = require("path");

function loadLocalEnv() {
  const envPath = path.join(__dirname, ".env.local");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const index = trimmed.indexOf("=");
    if (index < 1) continue;
    const key = trimmed.slice(0, index).trim();
    let value = trimmed.slice(index + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) value = value.slice(1, -1);
    if (!process.env[key]) process.env[key] = value;
  }
}
loadLocalEnv();
const { createCheckout, webhook } = require("./stripe-billing");

const root = __dirname;
const port = Number(process.env.PORT || 10000);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".txt": "text/plain; charset=utf-8"
};
function headers(res, status, contentType) {
  res.writeHead(status, {
    "Content-Type": contentType,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store"
  });
}
function reply(res, result) {
  res.writeHead(result.status, {
    "Content-Type": "application/json; charset=utf-8",
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Cache-Control": "no-store",
    ...(result.headers || {})
  });
  res.end(result.body);
}
async function readJson(req) {
  const chunks = [];
  let size = 0;
  for await (const chunk of req) {
    size += chunk.length;
    if (size > 8192) throw Object.assign(new Error("Request body too large"), { statusCode: 413 });
    chunks.push(chunk);
  }
  if (!chunks.length) return {};
  const parsed = JSON.parse(Buffer.concat(chunks).toString("utf8"));
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw Object.assign(new Error("JSON body must be an object"), { statusCode: 400 });
  return parsed;
}
function safePath(urlPath) {
  let decoded;
  try { decoded = decodeURIComponent((urlPath || "/").split("?")[0]); } catch { return null; }
  if (decoded.includes(String.fromCharCode(0)) || decoded.includes(String.fromCharCode(92))) return null;
  const relative = decoded === "/" ? "index.html" : decoded.startsWith("/") ? decoded.slice(1) : decoded;
  const parts = relative.split("/");
  const publicFiles = new Set(["index.html", "main.js", "billing.js", "manifest.webmanifest", "sw.js", "faq.html", "privacy.html", "terms.html", "404.html", "robots.txt", "sitemap.xml"]);
  if (parts.some(part => part.startsWith(".")) || !publicFiles.has(relative)) return null;
  const full = path.resolve(root, relative);
  return full.startsWith(root + path.sep) ? full : null;
}
async function handler(req, res) {
  let pathname;
  try { pathname = new URL(req.url, "http://localhost").pathname; }
  catch { headers(res, 400, "text/plain; charset=utf-8"); return res.end("Bad Request"); }

  if (pathname === "/health" && req.method === "GET") {
    headers(res, 200, "application/json; charset=utf-8");
    return res.end(JSON.stringify({ ok: true, app: "Hotel Easy Pass Traveler" }));
  }
  if (pathname === "/api/config" && req.method === "GET") {
    headers(res, 200, "application/json; charset=utf-8");
    return res.end(JSON.stringify({
      supabaseUrl: process.env.SUPABASE_URL || "",
      supabaseAnonKey: process.env.SUPABASE_ANON_KEY || "",
      billingReady: !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET && process.env.STRIPE_PRICE_UNLOCK && process.env.SUPABASE_SERVICE_ROLE_KEY)
    }));
  }
  if (pathname === "/api/stripe/checkout") {
    if (req.method !== "POST") { headers(res, 405, "application/json; charset=utf-8"); return res.end(JSON.stringify({ error: "Method not allowed" })); }
    try { await readJson(req); }
    catch (error) { headers(res, error.statusCode || 400, "application/json; charset=utf-8"); return res.end(JSON.stringify({ ok: false, error: error.message })); }
    return reply(res, await createCheckout(req));
  }
  if (pathname === "/api/stripe/webhook") {
    if (req.method !== "POST") { headers(res, 405, "application/json; charset=utf-8"); return res.end(JSON.stringify({ error: "Method not allowed" })); }
    return reply(res, await webhook(req));
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    headers(res, 405, "text/plain; charset=utf-8");
    return res.end("Method Not Allowed");
  }
  const file = safePath(req.url);
  if (!file) { headers(res, 403, "text/plain; charset=utf-8"); return res.end("Forbidden"); }
  fs.stat(file, (err, stat) => {
    if (err || !stat.isFile()) {
      headers(res, 404, "text/html; charset=utf-8");
      return res.end("<h1>404</h1><p>Hotel Easy Pass page not found.</p>");
    }
    const ext = path.extname(file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(file).pipe(res);
  });
}
const server = http.createServer((req, res) => {
  handler(req, res).catch(error => {
    console.error("Hotel Easy Pass request failed:", error.message);
    if (!res.headersSent) { headers(res, 500, "application/json; charset=utf-8"); res.end(JSON.stringify({ error: "Server error" })); }
    else res.destroy();
  });
});
server.listen(port, "0.0.0.0", () => console.log("Hotel Easy Pass listening on port " + port));
