const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT || 10000);
const publicFiles = new Set([
  "index.html", "dashboard.html", "dashboard.js", "faq.html",
  "privacy.html", "terms.html", "manifest.webmanifest", "sw.js",
  "404.html", "robots.txt", "sitemap.xml"
]);
const types = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
  ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".txt": "text/plain; charset=utf-8"
};
function send(res, status, type, body) {
  res.writeHead(status, {
    "Content-Type": type,
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Cache-Control": "no-store"
  });
  res.end(body);
}
function resolvePublicPath(requestUrl) {
  let pathname;
  try { pathname = decodeURIComponent(new URL(requestUrl, "http://localhost").pathname); }
  catch { return { error: 400 }; }
  if (pathname.includes(String.fromCharCode(0))) return { error: 400 };
  if (pathname.split("/").some(part => part.startsWith("."))) return { error: 403 };
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
  if (!publicFiles.has(relative)) return { error: 403 };
  const full = path.resolve(root, relative);
  if (!full.startsWith(root + path.sep)) return { error: 403 };
  return { file: full };
}
const server = http.createServer((req, res) => {
  if (req.method === "GET" && new URL(req.url, "http://localhost").pathname === "/health") {
    return send(res, 200, "application/json; charset=utf-8", JSON.stringify({ ok: true, app: "Hotel Easy Pass Owner" }));
  }
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "text/plain; charset=utf-8", "Method Not Allowed");
  }
  const resolved = resolvePublicPath(req.url);
  if (resolved.error) return send(res, resolved.error, "text/plain; charset=utf-8", resolved.error === 403 ? "Forbidden" : "Bad Request");
  fs.stat(resolved.file, (error, stat) => {
    if (error || !stat.isFile()) return send(res, 404, "text/html; charset=utf-8", "<h1>404</h1><p>Hotel Easy Pass Owner page not found.</p>");
    const ext = path.extname(resolved.file).toLowerCase();
    res.writeHead(200, {
      "Content-Type": types[ext] || "application/octet-stream",
      "X-Content-Type-Options": "nosniff",
      "X-Frame-Options": "DENY",
      "Referrer-Policy": "strict-origin-when-cross-origin",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    });
    if (req.method === "HEAD") return res.end();
    fs.createReadStream(resolved.file).pipe(res);
  });
});
server.listen(port, "0.0.0.0", () => console.log("Hotel Easy Pass Owner listening on port " + port));
