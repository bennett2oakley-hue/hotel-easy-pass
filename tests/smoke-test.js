const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const required = [
  "index.html",
  "traveler.html",
  "owner.html",
  "main.js",
  "manifest.webmanifest",
  "sw.js",
  "privacy.html",
  "terms.html"
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

for (const marker of ["Hotel Easy Pass", "traveler.html", "owner.html"]) {
  if (!index.includes(marker)) throw new Error("index.html missing expected marker: " + marker);
}
if (!manifest.includes("name")) throw new Error("manifest.webmanifest is missing an app name");
if (!main.includes("DOMContentLoaded")) throw new Error("main.js does not contain expected app bootstrap");

console.log("Hotel Easy Pass smoke tests passed.");
console.log(`Checked ${required.length} required application files.`);
