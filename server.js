const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = path.resolve(__dirname);
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

function securityHeaders() {
  return {
    "X-Content-Type-Options": "nosniff",
    "X-Frame-Options": "DENY",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(self), microphone=(), geolocation=()",
    "Content-Security-Policy": "frame-ancestors 'none'; base-uri 'self'; object-src 'none'",
    "Cross-Origin-Resource-Policy": "same-origin"
  };
}

function send(res, status, headers, body) {
  res.writeHead(status, { ...securityHeaders(), ...headers });
  res.end(body);
}

function resolvePublicFile(requestUrl) {
  let pathname;
  try {
    pathname = new URL(requestUrl, "http://localhost").pathname;
    pathname = decodeURIComponent(pathname);
  } catch {
    return { error: 400 };
  }
  if (pathname.includes("\\0") || pathname.split("/").some(part => part.startsWith("."))) {
    return { error: 403 };
  }
  const relative = pathname === "/" ? "index.html" : pathname.replace(/^\\/+/, "");
  const full = path.resolve(root, relative);
  if (full !== root && !full.startsWith(root + path.sep)) return { error: 403 };
  return { file: full };
}

const server = http.createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" }, "Method Not Allowed");
  }

  const resolved = resolvePublicFile(req.url || "/");
  if (resolved.error) {
    return send(res, resolved.error, { "Content-Type": "text/plain; charset=utf-8" }, resolved.error === 403 ? "Forbidden" : "Bad Request");
  }

  fs.stat(resolved.file, (err, stat) => {
    if (err || !stat.isFile()) {
      return send(res, 404, { "Content-Type": "text/html; charset=utf-8" }, "<h1>404</h1><p>Hotel Easy Pass page not found.</p>");
    }
    const ext = path.extname(resolved.file).toLowerCase();
    const headers = {
      "Content-Type": types[ext] || "application/octet-stream",
      "Cache-Control": ext === ".html" ? "no-cache" : "public, max-age=3600"
    };
    if (req.method === "HEAD") return send(res, 200, headers, "");
    const stream = fs.createReadStream(resolved.file);
    stream.on("error", () => {
      if (!res.headersSent) send(res, 500, { "Content-Type": "text/plain; charset=utf-8" }, "Server Error");
      else res.destroy();
    });
    res.writeHead(200, { ...securityHeaders(), ...headers });
    stream.pipe(res);
  });
});

server.listen(port, "0.0.0.0", () => {
  console.log("Hotel Easy Pass listening on port " + port);
});
