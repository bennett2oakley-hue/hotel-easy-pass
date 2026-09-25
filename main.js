const APP_NAME = "Hotel Easy Pass";
let deferredInstallPrompt = null;

const state = {
  hotel: JSON.parse(localStorage.getItem("hep_hotel") || "null") || { name: "", address: "", checkIn: "", checkOut: "", room: "" },
  rewards: JSON.parse(localStorage.getItem("hep_rewards") || "[]"),
  notes: JSON.parse(localStorage.getItem("hep_notes") || "[]"),
  checklist: JSON.parse(localStorage.getItem("hep_checklist") || "[]"),
  packing: JSON.parse(localStorage.getItem("hep_packing") || "[]")
};

const defaultChecklist = [
  "Confirm reservation",
  "Check check-in time",
  "Save hotel address",
  "Check room before unpacking",
  "Locate exits",
  "Save checkout time",
  "Check room before leaving"
];

const defaultPacking = ["ID / wallet", "Phone + charger", "Medications", "Toiletries", "Clothes", "Travel documents"];

function persist() {
  localStorage.setItem("hep_hotel", JSON.stringify(state.hotel));
  localStorage.setItem("hep_rewards", JSON.stringify(state.rewards));
  localStorage.setItem("hep_notes", JSON.stringify(state.notes));
  localStorage.setItem("hep_checklist", JSON.stringify(state.checklist));
  localStorage.setItem("hep_packing", JSON.stringify(state.packing));
}

function maps(search) { trackEvent("maps_search", { query: search });
  window.open("https://www.google.com/maps/search/?api=1&query=" + encodeURIComponent(search), "_blank");
}

function esc(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#039;");
}

function money(value) {
  return Number(value || 0).toLocaleString(undefined, { style: "currency", currency: "USD" });
}

function render() {
  trackEvent("app_open");
  const checklist = state.checklist.length ? state.checklist : defaultChecklist.map(text => ({ text, done: false }));
  const packing = state.packing.length ? state.packing : defaultPacking.map(text => ({ text, done: false }));
  if (!state.checklist.length) state.checklist = checklist;
  if (!state.packing.length) state.packing = packing;
  persist();

  document.getElementById("app").innerHTML = `
    <div class="hep">
      <header class="hero">
        <div class="logo" aria-hidden="true">🏨</div>
        <div>
          <div class="eyebrow">TRAVEL SMARTER</div>
          <h1>Hotel Easy Pass</h1>
          <p>Your pocket travel command center.</p><div class="hero-pills"><span>✓ Free core tools</span><span>✓ No account required</span></div>
        </div>
      </header>

      <nav class="nav" aria-label="Main navigation">
        <button onclick="scrollToId('stay')">🏨 Stay</button>
        <button onclick="scrollToId('explore')">📍 Explore</button>
        <button onclick="scrollToId('money')">💰 Money</button>
        <button onclick="scrollToId('tools')">🧳 Tools</button>
      </nav>

      <section class="welcome">
        <div>
          <span class="badge">ALL-IN-ONE TRAVEL TOOLKIT</span>
          <h2>Everything you need for a smoother hotel stay.</h2>
          <p>Keep your stay details, nearby essentials, rewards, notes, budget and travel checklists together on your phone.</p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button class="primary" onclick="scrollToId('stay')">🏨 Start My Stay</button><button class="secondary" onclick="shareApp()">↗ Share</button><button id="installAppBtn" class="secondary" style="display:none" onclick="installApp()">📲 Install App</button></div>
      </section>

      <section class="onboarding" id="welcomePanel">
        <div>
          <span class="badge">FREE TRAVEL TOOLKIT</span>
          <h2>Plan it. Save it. Find it. Share it.</h2>
          <p>Hotel Easy Pass puts the useful stuff travelers need most in one fast, phone-friendly place.</p>
        </div>
        <button class="primary" onclick="dismissWelcome()">Get Started</button>
      </section>

      <section class="card stay-card" id="stay">
        <div class="section-head">
          <div><span class="kicker">YOUR STAY</span><h2>🏨 Hotel Dashboard</h2></div>
          <button class="ghost" onclick="clearHotel()">Clear</button>
        </div>
        <div class="form two">
          <input id="hotelName" value="${esc(state.hotel.name)}" placeholder="Hotel name">
          <input id="room" value="${esc(state.hotel.room)}" placeholder="Room #">
          <input id="checkIn" type="datetime-local" value="${esc(state.hotel.checkIn)}">
          <input id="checkOut" type="datetime-local" value="${esc(state.hotel.checkOut)}">
        </div>
        <input id="hotelAddress" value="${esc(state.hotel.address)}" placeholder="Hotel address">
        <div class="button-row">
          <button class="primary" onclick="saveHotel()">Save Stay</button>
          <button class="secondary" onclick="openHotelMap()">📍 Directions</button><button class="secondary" onclick="shareTrip()">↗ Share Trip</button>
        </div>
        <div id="staySummary" class="stay-summary"></div>
      </section>

      <section class="quick-grid" id="explore">
        <button onclick="maps('restaurants near me')">🍔<span>Food</span></button>
        <button onclick="maps('attractions near me')">🎟️<span>Attractions</span></button>
        <button onclick="maps('grocery stores near me')">🛒<span>Groceries</span></button>
        <button onclick="maps('gas stations near me')">⛽<span>Gas</span></button>
        <button onclick="maps('pharmacy near me')">💊<span>Pharmacy</span></button>
        <button onclick="maps('coffee near me')">☕<span>Coffee</span></button>
        <button onclick="maps('laundromat near me')">🧺<span>Laundry</span></button>
        <button onclick="maps('bank ATM near me')">🏧<span>ATM</span></button>
        <button onclick="maps('urgent care near me')">🩺<span>Urgent Care</span></button>
      </section>

      <section class="card">
        <div class="section-head"><div><span class="kicker">DISCOVER</span><h2>🔎 Nearby Finder</h2></div></div>
        <p>Search for a place, service, restaurant, attraction or deal and open the results in Maps.</p><div class="popular-searches"><strong>Popular right now</strong><div class="chips"><button onclick="quickSearch('best cheap restaurants')">🍔 Cheap restaurants</button><button onclick="quickSearch('free things to do')">🎟️ Free things to do</button><button onclick="quickSearch('grocery store')">🛒 Groceries</button><button onclick="quickSearch('gas station')">⛽ Gas</button></div></div>
        <div class="search-row">
          <input id="dealSearch" placeholder="Try: pizza, museum, discounts, grocery...">
          <button class="primary" onclick="searchDeals()">Search</button>
        </div>
        <div class="chips">
          <button onclick="quickSearch('cheap eats')">Cheap eats</button>
          <button onclick="quickSearch('family activities')">Family fun</button>
          <button onclick="quickSearch('free attractions')">Free attractions</button>
          <button onclick="quickSearch('hotel discounts')">Hotel deals</button>
        </div>
      </section>

      <section class="card revenue-card">
        <div class="section-head"><div><span class="kicker">BOOK & SAVE</span><h2>✈️ Travel Marketplace</h2></div><span class="partner-badge">PARTNER READY</span></div>
        <p>Compare hotels, activities and travel services. Partner links can be connected here so Hotel Easy Pass can earn when users book.</p>
        <div class="market-grid">
          <a class="market-item" data-partner="booking" href="https://www.booking.com/" target="_blank" rel="noopener noreferrer"><strong>🏨 Hotels</strong><small>Find a stay</small></a>
          <a class="market-item" data-partner="viator" href="https://www.viator.com/" target="_blank" rel="noopener noreferrer"><strong>🎟️ Experiences</strong><small>Things to do</small></a>
          <a class="market-item" data-partner="skyscanner" href="https://www.skyscanner.com/" target="_blank" rel="noopener noreferrer"><strong>✈️ Flights</strong><small>Compare flights</small></a>
          <a class="market-item" data-partner="resortpass" href="https://www.resortpass.com/" target="_blank" rel="noopener noreferrer"><strong>🏖️ Day Passes</strong><small>Hotels & pools</small></a>
        </div>
        <button class="wide primary" onclick="scrollToId('stay');trackEvent('marketplace_cta')">🏨 Have a hotel? Build your stay dashboard</button>
        <div class="affiliate-note"><strong>Affiliate disclosure:</strong> These are ordinary outbound links until approved partner tracking is connected. If an affiliate relationship is activated later, Hotel Easy Pass may earn a commission on qualifying bookings at no extra cost to you. Prices are set by the partner.</div>
      </section>

      <section class="card trip-command" id="command">
        <div class="section-head"><div><span class="kicker">YOUR TRIP, AT A GLANCE</span><h2>🧭 Trip Command Center</h2></div></div>
        <div class="command-grid">
          <div><strong>1</strong><span>Save your hotel</span></div>
          <div><strong>2</strong><span>Find nearby essentials</span></div>
          <div><strong>3</strong><span>Track your budget</span></div>
          <div><strong>4</strong><span>Share the plan</span></div>
        </div>
        <button class="wide primary" onclick="scrollToId('explore');trackEvent('command_cta')">📍 Explore near me</button>
      </section>

      <section class="card my-trip" id="myTrip">
        <div class="section-head"><div><span class="kicker">YOUR LIVE TRIP</span><h2>🧭 My Trip</h2></div><span id="tripStatusBadge" class="partner-badge">READY</span></div>
        <div id="myTripSummary" class="my-trip-summary"></div>
        <div class="trip-actions">
          <button class="primary" onclick="openHotelMap()">📍 Open Hotel</button>
          <button class="secondary" onclick="shareTrip()">↗ Share Trip</button>
        </div>
        <div class="trip-stats">
          <div><strong id="tripBudgetStat">$0</strong><span>trip spend</span></div>
          <div><strong id="tripPackingStat">0%</strong><span>packed</span></div>
          <div><strong id="tripNotesStat">0</strong><span>notes</span></div>
        </div>
        <button class="ghost wide" onclick="startAnotherTrip()">＋ Start another trip</button>
      </section>

      <section class="card" id="money">
        <div class="section-head"><div><span class="kicker">SAVE & TRACK</span><h2>💰 Trip Budget</h2></div></div>
        <div class="budget-grid">
          <input id="hotelCost" type="number" min="0" step="0.01" placeholder="Hotel">
          <input id="foodCost" type="number" min="0" step="0.01" placeholder="Food">
          <input id="gasCost" type="number" min="0" step="0.01" placeholder="Gas">
          <input id="funCost" type="number" min="0" step="0.01" placeholder="Activities">
          <input id="otherCost" type="number" min="0" step="0.01" placeholder="Other">
          <input id="budgetLimit" type="number" min="0" step="0.01" placeholder="Trip budget limit">
        </div>
        <button class="wide primary" onclick="calculateBudget()">Calculate trip cost</button>
        <div id="budgetResult" class="result"></div>
      </section>

      <section class="card">
        <div class="section-head"><div><span class="kicker">REWARDS</span><h2>🎯 Rewards Wallet</h2></div></div>
        <p>Keep reward balances handy without storing passwords or payment information.</p>
        <div class="form two">
          <input id="rewardName" placeholder="Hotel or rewards program">
          <input id="rewardPoints" type="number" min="0" placeholder="Points">
        </div>
        <button class="wide primary" onclick="addReward()">Add Rewards</button>
        <div id="rewards"></div>
      </section>

      <section class="card" id="tools">
        <div class="section-head"><div><span class="kicker">READY, SET, GO</span><h2>🧳 Travel Tools</h2></div></div>

        <div class="tool-block">
          <h3>✅ Hotel Stay Checklist</h3>
          <div id="checklist"></div>
          <button class="secondary wide" onclick="resetChecklist()">Reset checklist</button>
        </div>

        <div class="tool-block">
          <h3>🎒 Packing Checklist</h3>
          <div id="packing"></div>
          <div class="search-row">
            <input id="packingItem" placeholder="Add packing item">
            <button class="primary" onclick="addPacking()">Add</button>
          </div>
        </div>

        <div class="tool-block">
          <h3>💵 Tip Calculator</h3>
          <div class="budget-grid">
            <input id="tipBill" type="number" min="0" step="0.01" placeholder="Bill amount">
            <input id="tipPercent" type="number" min="0" step="1" value="20" placeholder="Tip %">
            <input id="tipPeople" type="number" min="1" step="1" value="1" placeholder="People">
          </div>
          <button class="wide primary" onclick="calculateTip()">Calculate tip</button>
          <div id="tipResult" class="result"></div>
        </div>
      </section>

      <section class="card">
        <div class="section-head"><div><span class="kicker">MEMORY BANK</span><h2>📝 Trip Notes</h2></div></div>
        <textarea id="noteText" placeholder="Save directions, plans, reminders, check-in details or anything you don't want to forget..."></textarea>
        <button class="wide primary" onclick="addNote()">Save Note</button>
        <div id="notes"></div>
      </section>

      <section class="card emergency">
        <span class="kicker">QUICK HELP</span>
        <h2>🚨 Nearby Essentials</h2>
        <p>Open local results for important services.</p>
        <div class="essential-grid">
          <button onclick="maps('hospital near me')">🏥 Hospital</button>
          <button onclick="maps('urgent care near me')">🩺 Urgent Care</button>
          <button onclick="maps('police station near me')">🚓 Police</button>
          <button onclick="maps('24 hour pharmacy near me')">💊 Pharmacy</button>
        </div>
        <a class="call911" href="tel:911">Emergency: 911</a>
      </section>

      <footer>
        <strong>Hotel Easy Pass</strong>
        <p>Travel easier. Save smarter. Keep the trip together.</p>
        <small>Information stays on this device unless you choose to open or share something.</small><div style="margin-top:12px"><a href="./privacy.html">Privacy</a> · <a href="./terms.html">Terms</a> · <a href="./MONETIZATION.md">Partner & revenue notes</a></div>
      </footer>
    </div>
  `;

  renderStaySummary();
  renderCountdown();
  renderMyTrip();
  updateWelcome();
  renderRewards();
  renderNotes();
  renderChecklist();
  renderPacking();
}

function scrollToId(id) { document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" }); }

function dismissWelcome() {
  localStorage.setItem("hep_welcomed", "1");
  updateWelcome();
}

function updateWelcome() {
  const panel = document.getElementById("welcomePanel");
  if (panel) panel.style.display = localStorage.getItem("hep_welcomed") === "1" ? "none" : "flex";
}

function getTripStatus() {
  const now = Date.now();
  const start = state.hotel.checkIn ? new Date(state.hotel.checkIn).getTime() : 0;
  const end = state.hotel.checkOut ? new Date(state.hotel.checkOut).getTime() : 0;
  if (!start && !end) return { key: "ready", label: "READY", text: "Add your hotel dates to activate your trip dashboard." };
  if (start && now < start) return { key: "upcoming", label: "UPCOMING", text: "Your trip is coming up. Get your essentials ready." };
  if (end && now < end) return { key: "active", label: "CHECKED IN", text: "You're in the middle of your saved stay." };
  return { key: "complete", label: "COMPLETE", text: "This stay has passed. Start another trip whenever you're ready." };
}

function renderMyTrip() {
  const summary = document.getElementById("myTripSummary");
  const badge = document.getElementById("tripStatusBadge");
  if (!summary || !badge) return;
  const status = getTripStatus();
  badge.textContent = status.label;
  const h = state.hotel;
  const completedPacking = state.packing.filter(item => item.done).length;
  const packingPct = state.packing.length ? Math.round(completedPacking / state.packing.length * 100) : 0;
  const fields = ["hotelCost","foodCost","gasCost","funCost","otherCost"];
  const savedBudget = JSON.parse(localStorage.getItem("hep_budget") || "null");
  const total = savedBudget?.total ?? 0;
  document.getElementById("tripBudgetStat").textContent = money(total);
  document.getElementById("tripPackingStat").textContent = packingPct + "%";
  document.getElementById("tripNotesStat").textContent = String(state.notes.length);
  summary.innerHTML = `
    <div class="trip-status">${status.text}</div>
    <div class="trip-main"><strong>${esc(h.name || "No hotel saved yet")}</strong>${h.room ? `<span>Room ${esc(h.room)}</span>` : ""}</div>
    ${h.address ? `<div class="trip-line">📍 ${esc(h.address)}</div>` : "<div class=\"trip-line muted\">Save your hotel address for one-tap directions.</div>"}
    ${h.checkIn ? `<div class="trip-line">🕐 ${esc(new Date(h.checkIn).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}))}${h.checkOut ? ` → ${esc(new Date(h.checkOut).toLocaleString([], {dateStyle:"medium",timeStyle:"short"}))}` : ""}</div>` : ""}
  `;
}

function startAnotherTrip() {
  if (!confirm("Start a new trip? Your saved rewards, notes and packing list will stay on this device.")) return;
  state.hotel = { name: "", address: "", checkIn: "", checkOut: "", room: "" };
  localStorage.removeItem("hep_budget");
  persist();
  trackEvent("start_another_trip");
  render();
  scrollToId("stay");
}

function renderCountdown() {
  const box = document.getElementById("staySummary");
  if (!box) return;
  const h = state.hotel;
  if (!h.checkIn) return;
  const diff = new Date(h.checkIn).getTime() - Date.now();
  let text = "";
  if (diff > 0) {
    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    text = `<div class="countdown">⏱️ Check-in in <strong>${days ? days + "d " : ""}${hours}h</strong></div>`;
  } else if (h.checkOut && new Date(h.checkOut).getTime() > Date.now()) {
    text = '<div class="countdown">🏨 You are currently in your saved stay.</div>';
  }
  const existing = box.querySelector(".countdown");
  if (!existing && text) box.insertAdjacentHTML("beforeend", text);
}

async function trackEvent(name, details = {}) {
  const events = JSON.parse(localStorage.getItem("hep_events") || "[]");
  events.push({ name, details, at: new Date().toISOString() });
  localStorage.setItem("hep_events", JSON.stringify(events.slice(-100)));
}

function showInstallButton() {
  const existing = document.getElementById("installAppBtn");
  if (existing) existing.style.display = "block";
}

async function installApp() {
  if (!deferredInstallPrompt) {
    alert("If Install App is not offered, open your browser menu and choose Add to Home screen.");
    return;
  }
  deferredInstallPrompt.prompt();
  try { await deferredInstallPrompt.userChoice; } catch (_) {}
  deferredInstallPrompt = null;
  const btn = document.getElementById("installAppBtn");
  if (btn) btn.style.display = "none";
  trackEvent("install_prompt");
}

async function shareTrip() {
  const h = state.hotel;
  const text = [h.name && `Hotel: ${h.name}`, h.room && `Room: ${h.room}`, h.address && `Address: ${h.address}`, h.checkIn && `Check-in: ${new Date(h.checkIn).toLocaleString()}`, h.checkOut && `Check-out: ${new Date(h.checkOut).toLocaleString()}`].filter(Boolean).join("\n");
  if (!text) return alert("Save your hotel stay first.");
  if (navigator.share) { try { await navigator.share({title: APP_NAME + " Trip", text}); } catch (_) {} }
  else if (navigator.clipboard) { await navigator.clipboard.writeText(text); alert("Trip details copied. Paste them into Messenger or text."); }
}

function saveHotel() {
  state.hotel = {
    name: document.getElementById("hotelName").value.trim(),
    room: document.getElementById("room").value.trim(),
    checkIn: document.getElementById("checkIn").value,
    checkOut: document.getElementById("checkOut").value,
    address: document.getElementById("hotelAddress").value.trim()
  };
  persist();
  renderStaySummary();
  renderCountdown();
  trackEvent("save_stay");
}

function clearHotel() {
  if (!confirm("Clear the saved hotel stay details?")) return;
  state.hotel = { name: "", address: "", checkIn: "", checkOut: "", room: "" };
  persist();
  render();
}

function openHotelMap() {
  if (!state.hotel.address) return maps("hotels near me");
  maps(state.hotel.address);
}

function renderStaySummary() {
  const box = document.getElementById("staySummary");
  const h = state.hotel;
  if (!h.name && !h.address && !h.checkIn && !h.checkOut) {
    box.innerHTML = '<span class="muted">Add your hotel details above to create your stay dashboard.</span>';
    return;
  }
  const formatDate = value => value ? new Date(value).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "Not set";
  box.innerHTML = `
    <div><strong>${esc(h.name || "Hotel stay")}</strong>${h.room ? ` <span class="room">Room ${esc(h.room)}</span>` : ""}</div>
    <small>Check-in: ${esc(formatDate(h.checkIn))} · Check-out: ${esc(formatDate(h.checkOut))}</small>
    ${h.address ? `<small>📍 ${esc(h.address)}</small>` : ""}
  `;
}

function quickSearch(term) { trackEvent("nearby_search", { term }); maps(term + " near me"); }

function searchDeals() {
  trackEvent("deal_search");
  const value = document.getElementById("dealSearch").value.trim();
  maps(value ? value + " near me" : "deals near me");
}

function addReward() { trackEvent("reward_added");
  const name = document.getElementById("rewardName").value.trim();
  if (!name) return;
  state.rewards.push({ name, points: document.getElementById("rewardPoints").value || "0" });
  persist();
  document.getElementById("rewardName").value = "";
  document.getElementById("rewardPoints").value = "";
  renderRewards();
}

function deleteReward(index) { state.rewards.splice(index, 1); persist(); renderRewards(); }

function renderRewards() {
  const box = document.getElementById("rewards");
  if (!state.rewards.length) { box.innerHTML = '<p class="empty">No rewards added yet.</p>'; return; }
  box.innerHTML = state.rewards.map((item, index) => `
    <div class="saved-item"><div><strong>${esc(item.name)}</strong><small>${esc(item.points)} points</small></div>
    <button class="delete" onclick="deleteReward(${index})">Delete</button></div>`).join("");
}

function addNote() { trackEvent("note_added");
  const text = document.getElementById("noteText").value.trim();
  if (!text) return;
  state.notes.unshift({ text, date: new Date().toLocaleDateString() });
  persist();
  document.getElementById("noteText").value = "";
  renderNotes();
}

function deleteNote(index) { state.notes.splice(index, 1); persist(); renderNotes(); }

function renderNotes() {
  const box = document.getElementById("notes");
  if (!state.notes.length) { box.innerHTML = '<p class="empty">No trip notes saved yet.</p>'; return; }
  box.innerHTML = state.notes.map((item, index) => `
    <div class="saved-item note"><div><small>${esc(item.date)}</small><p>${esc(item.text)}</p></div>
    <button class="delete" onclick="deleteNote(${index})">Delete</button></div>`).join("");
}

function calculateBudget() { trackEvent("budget_calculated");
  const fields = ["hotelCost","foodCost","gasCost","funCost","otherCost"];
  const total = fields.reduce((sum, id) => sum + (Number(document.getElementById(id).value) || 0), 0);
  const limit = Number(document.getElementById("budgetLimit").value) || 0;
  const difference = limit - total;
  localStorage.setItem("hep_budget", JSON.stringify({ total, limit, difference }));
  renderMyTrip();
  document.getElementById("budgetResult").innerHTML = limit
    ? `<strong>Total: ${money(total)}</strong><br><small>${difference >= 0 ? "You are " + money(difference) + " under budget." : "You are " + money(Math.abs(difference)) + " over budget."}</small>`
    : `<strong>Estimated trip total: ${money(total)}</strong>`;
}

function calculateTip() { trackEvent("tip_calculated");
  const bill = Number(document.getElementById("tipBill").value) || 0;
  const percent = Number(document.getElementById("tipPercent").value) || 0;
  const people = Math.max(1, Number(document.getElementById("tipPeople").value) || 1);
  const tip = bill * percent / 100;
  const total = bill + tip;
  document.getElementById("tipResult").innerHTML = `Tip: <strong>${money(tip)}</strong><br>Total: <strong>${money(total)}</strong><br>Each: <strong>${money(total / people)}</strong>`;
}

function toggleCheck(index) { state.checklist[index].done = !state.checklist[index].done; persist(); renderChecklist(); }

function renderChecklist() {
  const box = document.getElementById("checklist");
  box.innerHTML = state.checklist.map((item, index) => `
    <label class="check ${item.done ? "done" : ""}"><input type="checkbox" ${item.done ? "checked" : ""} onchange="toggleCheck(${index})"> ${esc(item.text)}</label>
  `).join("");
}

function resetChecklist() { state.checklist = defaultChecklist.map(text => ({ text, done: false })); persist(); renderChecklist(); }

function addPacking() { trackEvent("packing_item_added");
  const input = document.getElementById("packingItem");
  const text = input.value.trim();
  if (!text) return;
  state.packing.push({ text, done: false });
  input.value = "";
  persist();
  renderPacking();
}

function togglePacking(index) { state.packing[index].done = !state.packing[index].done; persist(); renderPacking(); }

function deletePacking(index) { state.packing.splice(index, 1); persist(); renderPacking(); }

function renderPacking() {
  const box = document.getElementById("packing");
  box.innerHTML = state.packing.map((item, index) => `
    <div class="packing-row"><label class="check ${item.done ? "done" : ""}"><input type="checkbox" ${item.done ? "checked" : ""} onchange="togglePacking(${index})"> ${esc(item.text)}</label>
    <button class="delete" onclick="deletePacking(${index})">×</button></div>`).join("");
}

async function shareApp() {
  trackEvent("share_app");
  const shareData = { title: APP_NAME, text: "Try Hotel Easy Pass, a pocket travel command center.", url: location.href };
  if (navigator.share) { try { await navigator.share(shareData); } catch (_) {} }
  else if (navigator.clipboard) { await navigator.clipboard.writeText(location.href); alert("App link copied. You can paste it into a text or Messenger."); }
  else alert("Copy the page address to share Hotel Easy Pass.");
}

if (window.matchMedia?.("(display-mode: standalone)").matches) trackEvent("pwa_open");

const style = document.createElement("style");
style.textContent = `
*{box-sizing:border-box}
html{scroll-behavior:smooth}
body{margin:0;font-family:system-ui,-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;background:#eef8f7;color:#173b3b}
button,input,textarea{font:inherit}button{cursor:pointer}
.hep{max-width:820px;margin:auto;padding-bottom:35px}
.hero{background:linear-gradient(135deg,#087f78,#12a89d);color:white;padding:28px 20px;display:flex;align-items:center;gap:15px;box-shadow:0 5px 20px rgba(0,0,0,.12)}
.logo{font-size:48px}.eyebrow,.kicker{font-size:11px;letter-spacing:2px;font-weight:800}.eyebrow{opacity:.85}
h1{margin:3px 0;font-size:30px}.hero p{margin:0;opacity:.92}.hero-pills{display:flex;flex-wrap:wrap;gap:6px;margin-top:10px}.hero-pills span{font-size:11px;font-weight:700;background:rgba(255,255,255,.16);padding:5px 8px;border-radius:99px}
.nav{position:sticky;top:0;z-index:5;display:grid;grid-template-columns:repeat(4,1fr);gap:5px;padding:7px;background:rgba(255,255,255,.96);box-shadow:0 2px 12px rgba(0,0,0,.08)}
.nav button{border:0;background:transparent;padding:9px 3px;color:#245b5a;font-weight:700}
.welcome{padding:25px 20px 12px;display:flex;gap:15px;justify-content:space-between;align-items:center}
.welcome h2{margin:8px 0}.welcome p{line-height:1.55;margin:0}.welcome .primary{box-shadow:0 6px 16px rgba(8,127,120,.18)}.badge{display:inline-block;background:#d8f1ed;color:#087f78;padding:6px 9px;border-radius:99px;font-size:10px;font-weight:800}
.quick-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;padding:10px 15px}
.quick-grid button,.essential-grid button{border:0;transition:transform .15s ease,box-shadow .15s ease;border-radius:15px;background:white;padding:14px 8px;color:#173b3b;box-shadow:0 3px 12px rgba(0,0,0,.08)}
.quick-grid button{font-size:25px}.quick-grid button:active,.market-item:active,.chips button:active{transform:scale(.98)}.quick-grid span{display:block;font-size:12px;margin-top:5px}
.card{background:white;margin:15px;padding:20px;border-radius:20px;box-shadow:0 4px 18px rgba(0,0,0,.08);scroll-margin-top:58px}
.card h2{margin:4px 0 8px}.card p{line-height:1.5}.section-head{display:flex;justify-content:space-between;align-items:start;gap:10px}.kicker{color:#087f78}
.form{display:grid;gap:9px}.form.two{grid-template-columns:1fr 1fr}
input,textarea{width:100%;border:1px solid #c8dddd;border-radius:12px;padding:13px;background:#fbffff;color:#173b3b}
textarea{min-height:120px;resize:vertical}.card>input{margin-top:9px}
.primary,.secondary,.ghost{border-radius:12px;padding:12px 16px;font-weight:800;border:0;transition:transform .15s ease,opacity .15s ease}.primary:hover,.secondary:hover,.ghost:hover{opacity:.9}.primary{background:#087f78;color:white}.secondary{background:#e4f5f1;color:#087f78}.ghost{background:#f0f6f5;color:#376160}
.wide{width:100%;margin-top:10px}.button-row{display:flex;gap:9px;margin-top:9px}.button-row button{flex:1}
.search-row{display:flex;gap:8px}.search-row button{white-space:nowrap}
.chips{display:flex;flex-wrap:wrap;gap:7px;margin-top:10px}.chips button{border:1px solid #c8dddd;background:#f8fcfb;border-radius:99px;padding:7px 10px;color:#245b5a}
.onboarding{margin:15px;scroll-margin-top:58px;padding:20px;border-radius:20px;background:linear-gradient(135deg,#ffffff,#e8f7f4);box-shadow:0 4px 18px rgba(0,0,0,.08);display:flex;align-items:center;justify-content:space-between;gap:15px}.onboarding h2{margin:8px 0}.onboarding p{margin:0;line-height:1.5}.countdown{margin-top:9px;padding:10px 12px;border-radius:10px;background:#dff3ee;color:#087f78;font-size:14px}.revenue-card{border:1px solid #cfe8e3}.partner-badge{font-size:10px;font-weight:900;background:#d8f1ed;color:#087f78;padding:6px 8px;border-radius:99px}.market-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.market-item{display:block;text-decoration:none;color:#173b3b;background:#f4faf9;border:1px solid #dceceb;border-radius:14px;padding:14px}.market-item strong{display:block}.market-item small{display:block;color:#557070;margin-top:4px}.affiliate-note{font-size:11px;color:#6a7c7c;margin-top:12px}.command-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.command-grid div{background:#f4faf9;border:1px solid #dceceb;border-radius:14px;padding:13px}.command-grid strong{display:block;font-size:22px;color:#087f78}.command-grid span{display:block;margin-top:3px;font-size:13px}.trip-command{border:1px solid #cfe8e3}.my-trip{border:1px solid #cfe8e3;background:linear-gradient(180deg,#ffffff,#f1faf8)}.my-trip-summary{padding:13px;border-radius:14px;background:#edf8f6}.trip-status{font-size:13px;color:#087f78;margin-bottom:8px}.trip-main{display:flex;gap:8px;align-items:center;flex-wrap:wrap}.trip-main span{font-size:11px;background:#d7eee9;padding:4px 7px;border-radius:8px}.trip-line{margin-top:7px;font-size:13px;color:#557070}.trip-actions{display:flex;gap:9px;margin-top:10px}.trip-actions>*{flex:1}.trip-stats{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}.trip-stats div{background:white;border:1px solid #dceceb;border-radius:12px;padding:10px;text-align:center}.trip-stats strong{display:block;color:#087f78;font-size:18px}.trip-stats span{font-size:10px;color:#557070}.budget-grid{display:grid;grid-template-columns:1fr 1fr;gap:9px}.result{margin-top:12px;padding:15px;border-radius:12px;background:#e4f5ee;font-size:17px}
.saved-item{margin-top:10px;padding:13px;border-radius:13px;background:#edf8f7;display:flex;justify-content:space-between;gap:10px;align-items:center}
.saved-item small{display:block;opacity:.7;margin-top:3px}.saved-item p{margin-bottom:0}.delete{border:0;background:#f1dddd;color:#8b2d2d;padding:8px 10px;border-radius:9px}.empty,.muted{opacity:.6}
.stay-summary{margin-top:12px;padding:13px;border-radius:13px;background:#f0faf8}.stay-summary small{display:block;margin-top:5px;color:#557070}.room{display:inline-block;margin-left:6px;padding:3px 7px;border-radius:7px;background:#d7eee9;font-size:12px}
.tool-block{padding:15px 0;border-top:1px solid #e7eeee}.tool-block:first-of-type{border-top:0}.tool-block h3{margin-top:0}
.check{display:block;padding:10px 0;border-bottom:1px solid #edf0f0}.check input{width:auto;margin-right:8px}.check.done{text-decoration:line-through;opacity:.55}
.packing-row{display:flex;gap:8px;align-items:center}.packing-row .check{flex:1}.packing-row .delete{margin-bottom:1px}
.essential-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.emergency{border:1px solid #f0d7d7}.call911{display:block;text-align:center;margin-top:14px;padding:12px;border-radius:12px;background:#f7e2e2;color:#8b2d2d;font-weight:900;text-decoration:none}
.popular-searches{margin-top:14px;padding-top:12px;border-top:1px solid #e7eeee}.popular-searches strong{font-size:13px}footer a{color:#087f78;font-weight:700;text-decoration:none}footer{text-align:center;padding:30px 20px;color:#557070;font-size:14px}footer p{margin:5px 0}footer small{opacity:.75}
@media(max-width:520px){.welcome{align-items:flex-start;flex-direction:column}.welcome .primary{width:100%}.form.two{grid-template-columns:1fr}.quick-grid{grid-template-columns:repeat(3,1fr)}.search-row{flex-direction:column}.button-row{flex-direction:column}}
@media(max-width:380px){.quick-grid{grid-template-columns:repeat(2,1fr)}}
`;
document.head.appendChild(style);

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
render();


window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  deferredInstallPrompt = event;
  showInstallButton();
});
window.addEventListener("appinstalled", () => {
  deferredInstallPrompt = null;
  const btn = document.getElementById("installAppBtn");
  if (btn) btn.style.display = "none";
  trackEvent("app_installed");
});
document.addEventListener("click", event => {
  const link = event.target.closest?.("[data-partner]");
  if (link) trackEvent("marketplace_click", { partner: link.dataset.partner });
});
