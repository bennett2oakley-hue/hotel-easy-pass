const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const required = [
  "index.html",
  "traveler.html",
  "owner.html",
  "dashboard.html",
  "dashboard.js",
  "main.js",
  "manifest.webmanifest",
  "sw.js",
  "privacy.html",
  "terms.html",
  "package.json",
  "package-lock.json"
];

for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error("Missing required file: " + file);
  const stat = fs.statSync(full);
  if (stat.size === 0) throw new Error("Required file is empty: " + file);
}

const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const manifest = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");
const main = fs.readFileSync(path.join(root, "main.js"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
const dashboardJs = fs.readFileSync(path.join(root, "dashboard.js"), "utf8");
const pkg = fs.readFileSync(path.join(root, "package.json"), "utf8");

for (const marker of ["Hotel Easy Pass", "traveler.html", "owner.html"]) {
  if (!index.includes(marker)) throw new Error("index.html missing expected marker: " + marker);
}
if (!manifest.includes("name")) throw new Error("manifest.webmanifest is missing an app name");
if (!main.includes("function render")) throw new Error("main.js does not contain the expected app renderer");
if (!main.includes("trackEvent")) throw new Error("main.js is missing product analytics instrumentation");
if (!dashboard.includes("Product Analytics")) throw new Error("dashboard.html is missing the analytics dashboard");
if (!dashboardJs.includes("hep_events")) throw new Error("dashboard.js is missing local analytics support");
if (!pkg.includes('"test"')) throw new Error("package.json is missing the test script");

console.log("Hotel Easy Pass smoke tests passed.");
console.log("Checked " + required.length + " required application files plus analytics instrumentation.");
