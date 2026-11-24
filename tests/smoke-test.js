const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const required = [
  "index.html",
  "server.js",
  "stripe-billing.js",
  "billing.js",
  "supabase/stripe_entitlements.sql",
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


const vm = require("node:vm");
for (const file of ["server.js", "stripe-billing.js", "billing.js", "main.js"]) {
  new vm.Script(fs.readFileSync(path.join(root, file), "utf8"), { filename: file });
}
const readStoredJSONSource = main.slice(main.indexOf("function readStoredJSON("), main.indexOf("const state = {"));
if (!readStoredJSONSource.includes("function readStoredJSON(")) throw new Error("Missing safe storage reader");
const storageSandbox = {
  localStorage: { getItem: () => "{invalid json" },
  console: { warn: () => {} },
  JSON
};
vm.runInNewContext(readStoredJSONSource + "\nglobalThis.readStoredJSON = readStoredJSON;", storageSandbox);
if (storageSandbox.readStoredJSON("broken", { recovered: true }).recovered !== true) {
  throw new Error("Invalid local storage should fall back safely");
}

/* ---- Intent-aware traveller tools: the trip type must drive which tools render ---- */
const registryStart = main.indexOf("/* ---------- Intent-aware traveller tools");
const registryEnd = main.indexOf("function renderDashboard() {");
if (registryStart < 0) throw new Error("main.js is missing the intent-to-tools mapping");
if (registryEnd < 0 || registryEnd <= registryStart) throw new Error("main.js is missing renderDashboard()");

const mappingSandbox = {
  state: { traveler: { tripType: "", needs: [] } },
  esc: (value) => String(value ?? ""),
  console
};
vm.runInNewContext(
  main.slice(registryStart, registryEnd) +
  "\nglobalThis.__intentMap = { TRIP_TOOL_SETS, ALL_TOOL_KEYS, TOOL_SECTIONS, resolveTripTools };",
  mappingSandbox
);
const { TRIP_TOOL_SETS, ALL_TOOL_KEYS, TOOL_SECTIONS, resolveTripTools } = mappingSandbox.__intentMap;

// Each trip intent maps to exactly the tools that apply to it.
const EXPECTED_TOOLS = {
  Business: ["workSpace", "quietSpace", "budget", "tip"],
  Emergency: ["emergency", "directions", "essentials", "hotelContact", "tip"],
  Family: ["familyNeeds", "activities", "checklists"],
  Leisure: ["nearby", "budget", "marketplace", "checklists", "rewards"]
};
for (const tripType of Object.keys(EXPECTED_TOOLS)) {
  const mapped = TRIP_TOOL_SETS[tripType];
  if (!mapped) throw new Error("The intent-to-tools mapping is missing the " + tripType + " trip type");
  const expected = EXPECTED_TOOLS[tripType];
  if (mapped.length !== expected.length || mapped.some((key, index) => key !== expected[index])) {
    throw new Error(
      "The " + tripType + " trip should map to [" + expected.join(", ") +
      "] but maps to [" + mapped.join(", ") + "]"
    );
  }
}

// Every mapped tool must exist, carry a nav entry and render its own nav target.
const toolIds = new Set();
for (const key of Object.keys(TOOL_SECTIONS)) {
  const tool = TOOL_SECTIONS[key];
  if (!tool || typeof tool.html !== "function") throw new Error("Tool " + key + " is missing a renderer");
  if (!tool.id) throw new Error("Tool " + key + " is missing a section id");
  if (!tool.nav || !tool.nav.icon || !tool.nav.label) throw new Error("Tool " + key + " is missing its nav entry");
  if (toolIds.has(tool.id)) throw new Error("Two tools share the section id " + tool.id);
  toolIds.add(tool.id);
  if (!tool.html([]).includes('id="' + tool.id + '"')) {
    throw new Error("Tool " + key + " does not render its own #" + tool.id + " nav target");
  }
}

// The four intents must genuinely produce different dashboards.
const signatures = Object.keys(EXPECTED_TOOLS).map(tripType => EXPECTED_TOOLS[tripType].join(","));
if (new Set(signatures).size !== signatures.length) {
  throw new Error("Every trip type must map to a distinct tool set");
}

// resolveTripTools() must read the stored trip profile.
mappingSandbox.state.traveler = { tripType: "Emergency", needs: [] };
const emergency = resolveTripTools();
if (emergency.type !== "Emergency") throw new Error("resolveTripTools() did not read the stored trip type");
if (emergency.keys.join(",") !== EXPECTED_TOOLS.Emergency.join(",")) {
  throw new Error(
    "An Emergency trip should resolve to [" + EXPECTED_TOOLS.Emergency.join(", ") +
    "] but resolved to [" + emergency.keys.join(", ") + "]"
  );
}

// A profile saved before trip types existed must fall back to the full tool set.
mappingSandbox.state.traveler = { tripType: "", needs: [] };
const fallback = resolveTripTools();
if (fallback.keys.join(",") !== ALL_TOOL_KEYS.join(",")) {
  throw new Error("A profile without a trip type should fall back to every tool");
}

// A stated need promotes its tool and adds a matching search.
mappingSandbox.state.traveler = { tripType: "Leisure", needs: ["shopping"] };
const withNeed = resolveTripTools();
if (withNeed.keys[0] !== "nearby") throw new Error("A stated need should promote its tool to the front");
if (!withNeed.searches.nearby || !withNeed.searches.nearby.length) {
  throw new Error("A stated need should add a matching search");
}

// renderDashboard() must actually drive its sections and navigation from the mapping.
const dashboardSource = main.slice(registryEnd, main.indexOf("function scrollToId(", registryEnd));
if (!dashboardSource.includes("resolveTripTools()")) {
  throw new Error("renderDashboard() does not use the intent-to-tools mapping");
}
if (!dashboardSource.includes("toolSections")) {
  throw new Error("renderDashboard() does not render the resolved tool sections");
}
if (!dashboardSource.includes("navItems.map")) {
  throw new Error("The dashboard navigation is not derived from the intent's tools");
}

// The on-screen copy must describe what is actually shown.
if (!main.includes("built around the tools that fit your trip")) {
  throw new Error("The traveller copy does not describe the intent-aware dashboard");
}
if (main.includes("You won't be shown irrelevant choices")) {
  throw new Error("main.js still promises the traveller is never shown irrelevant choices");
}

console.log("Hotel Easy Pass smoke tests passed.");
console.log("Checked " + required.length + " required application files plus analytics instrumentation and the intent-to-tools mapping.");
