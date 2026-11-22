const fs = require("fs");
const path = require("path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const required = ["index.html", "server.js", "stripe-billing.js", "billing.js", "main.js", "manifest.webmanifest", "sw.js", "privacy.html", "terms.html", "package.json", "package-lock.json", "supabase/stripe_entitlements.sql"];
for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error("Missing traveler app file: " + file);
  if (!fs.statSync(full).size) throw new Error("Traveler app file is empty: " + file);
}
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const main = fs.readFileSync(path.join(root, "main.js"), "utf8");
const manifest = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");
for (const marker of ["TRAVELER PASS", "Your trip, without the clutter", "Premium Traveler Pass", "Nearby"]) {
  if (!index.includes(marker) && !main.includes(marker)) throw new Error("Traveler app missing expected marker: " + marker);
}
if (index.includes("owner.html") || index.includes("Hotel Owner Hub")) throw new Error("Traveler app must not include owner app navigation.");
if (!main.includes("function render")) throw new Error("Traveler app renderer is missing.");
if (!main.includes("trackEvent")) throw new Error("Traveler app analytics instrumentation is missing.");
if (!manifest.includes("name")) throw new Error("Traveler PWA manifest is missing its app name.");
for (const file of ["server.js", "stripe-billing.js", "billing.js", "main.js"]) new vm.Script(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
const start = main.indexOf("function readStoredJSON("), end = main.indexOf("const state = {");
if (start < 0 || end < 0) throw new Error("Safe browser-storage reader is missing.");
const storageSandbox = { localStorage: { getItem: () => "{invalid json" }, console: { warn: () => {} }, JSON };
vm.runInNewContext(main.slice(start, end) + "\nglobalThis.readStoredJSON = readStoredJSON;", storageSandbox);
if (!storageSandbox.readStoredJSON("broken", { recovered: true }).recovered) throw new Error("Invalid browser storage should recover safely.");
console.log("Hotel Easy Pass Traveler smoke tests passed.");
