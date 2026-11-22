const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
const required = ["index.html", "server.js", "dashboard.html", "dashboard.js", "manifest.webmanifest", "sw.js", "privacy.html", "terms.html", "package.json", "package-lock.json"];
for (const file of required) {
  const full = path.join(root, file);
  if (!fs.existsSync(full)) throw new Error("Missing required file: " + file);
  if (!fs.statSync(full).size) throw new Error("Required file is empty: " + file);
}
const index = fs.readFileSync(path.join(root, "index.html"), "utf8");
const dashboard = fs.readFileSync(path.join(root, "dashboard.html"), "utf8");
const dashboardJs = fs.readFileSync(path.join(root, "dashboard.js"), "utf8");
const manifest = fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8");
for (const marker of ["HOTEL EASY PASS · OWNER", "Owner Command Center", "Staff Scheduler", "Property profile", "Create a guest offer", "Room Condition Record"]) {
  if (!index.includes(marker)) throw new Error("Owner app missing expected feature: " + marker);
}
if (index.includes("traveler.html") || index.includes("TRAVELER PASS")) throw new Error("Owner app must not include traveler app navigation or shell.");
if (!dashboard.includes("Product Analytics")) throw new Error("Owner analytics dashboard is missing.");
if (!dashboardJs.includes("hep_events")) throw new Error("Owner analytics instrumentation is missing.");
if (!manifest.includes("name")) throw new Error("Owner PWA manifest is missing its app name.");
new vm.Script(fs.readFileSync(path.join(root, "server.js"), "utf8"), { filename: "server.js" });
new vm.Script(dashboardJs, { filename: "dashboard.js" });
console.log("Hotel Easy Pass Owner smoke tests passed.");
console.log("Checked " + required.length + " owner application files.");
