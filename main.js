const APP_NAME = "Hotel Easy Pass";

const saved = {
  rewards: JSON.parse(localStorage.getItem("hep_rewards") || "[]"),
  notes: JSON.parse(localStorage.getItem("hep_notes") || "[]")
};

function save() {
  localStorage.setItem("hep_rewards", JSON.stringify(saved.rewards));
  localStorage.setItem("hep_notes", JSON.stringify(saved.notes));
}

function maps(search) {
  window.open(
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(search),
    "_blank"
  );
}

function esc(text) {
  return String(text || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function render() {
  document.getElementById("app").innerHTML = `
    <div class="hep">

      <header class="hero">
        <div class="logo">🏨</div>
        <div>
          <div class="eyebrow">TRAVEL SMART</div>
          <h1>Hotel Easy Pass</h1>
          <p>Your pocket travel companion.</p>
        </div>
      </header>

      <section class="welcome">
        <h2>Make every stay easier.</h2>
        <p>
          Find places to eat, things to do, savings, travel tools,
          and keep your hotel rewards and trip notes in one place.
        </p>
      </section>

      <div class="quick-grid">
        <button onclick="maps('restaurants near me')">🍔<span>Food</span></button>
        <button onclick="maps('attractions near me')">📍<span>Attractions</span></button>
        <button onclick="maps('shopping near me')">🛍️<span>Shopping</span></button>
        <button onclick="maps('gas stations near me')">⛽<span>Gas</span></button>
        <button onclick="maps('pharmacy near me')">💊<span>Pharmacy</span></button>
        <button onclick="maps('coffee near me')">☕<span>Coffee</span></button>
      </div>

      <section class="card">
        <h2>💰 Savings Finder</h2>
        <p>Search nearby businesses, coupons, discounts and everyday savings.</p>

        <div class="search-row">
          <input id="dealSearch" placeholder="What are you looking for?">
          <button onclick="searchDeals()">Search</button>
        </div>
      </section>

      <section class="card">
        <h2>🎯 Hotel Rewards Wallet</h2>
        <p>Keep your rewards information handy. You control the information.</p>

        <div class="form">
          <input id="rewardName" placeholder="Hotel or rewards program">
          <input id="rewardPoints" type="number" placeholder="Points">
          <button onclick="addReward()">Add Rewards</button>
        </div>

        <div id="rewards"></div>
      </section>

      <section class="card">
        <h2>🧳 Trip Notes</h2>
        <p>Save important information for your trip directly on your phone.</p>

        <textarea id="noteText" placeholder="Hotel address, room number, check-in time, plans, reminders..."></textarea>
        <button class="wide" onclick="addNote()">Save Trip Note</button>

        <div id="notes"></div>
      </section>

      <section class="card">
        <h2>💵 Quick Travel Budget</h2>

        <div class="budget-grid">
          <input id="hotelCost" type="number" placeholder="Hotel">
          <input id="foodCost" type="number" placeholder="Food">
          <input id="gasCost" type="number" placeholder="Gas">
          <input id="funCost" type="number" placeholder="Activities">
        </div>

        <button class="wide" onclick="calculateBudget()">Calculate</button>

        <div id="budgetResult" class="result"></div>
      </section>

      <section class="card">
        <h2>🧳 Hotel Stay Checklist</h2>

        <label class="check"><input type="checkbox"> Confirm reservation</label>
        <label class="check"><input type="checkbox"> Check check-in time</label>
        <label class="check"><input type="checkbox"> Save hotel address</label>
        <label class="check"><input type="checkbox"> Check room before unpacking</label>
        <label class="check"><input type="checkbox"> Check checkout time</label>
        <label class="check"><input type="checkbox"> Check room before leaving</label>
      </section>

      <section class="card">
        <h2>🚨 Nearby Essentials</h2>

        <div class="essential-grid">
          <button onclick="maps('hospital near me')">🏥 Hospital</button>
          <button onclick="maps('urgent care near me')">🩺 Urgent Care</button>
          <button onclick="maps('police station near me')">🚓 Police</button>
          <button onclick="maps('ATM near me')">🏧 ATM</button>
        </div>
      </section>

      <footer>
        <strong>Hotel Easy Pass</strong>
        <br>
        Travel easier. Save smarter. Keep everything together.
      </footer>

    </div>
  `;

  renderRewards();
  renderNotes();
}

function searchDeals() {
  const value = document.getElementById("dealSearch").value.trim();

  if (!value) {
    maps("deals near me");
    return;
  }

  maps(value + " deals near me");
}

function addReward() {
  const name = document.getElementById("rewardName").value.trim();
  const points = document.getElementById("rewardPoints").value.trim();

  if (!name) return;

  saved.rewards.push({
    name,
    points: points || "0"
  });

  save();

  document.getElementById("rewardName").value = "";
  document.getElementById("rewardPoints").value = "";

  renderRewards();
}

function deleteReward(index) {
  saved.rewards.splice(index, 1);
  save();
  renderRewards();
}

function renderRewards() {
  const box = document.getElementById("rewards");

  if (!saved.rewards.length) {
    box.innerHTML = `<p class="empty">No rewards added yet.</p>`;
    return;
  }

  box.innerHTML = saved.rewards.map((item, index) => `
    <div class="saved-item">
      <div>
        <strong>${esc(item.name)}</strong>
        <small>${esc(item.points)} points</small>
      </div>
      <button class="delete" onclick="deleteReward(${index})">Delete</button>
    </div>
  `).join("");
}

function addNote() {
  const text = document.getElementById("noteText").value.trim();

  if (!text) return;

  saved.notes.unshift({
    text,
    date: new Date().toLocaleDateString()
  });

  save();

  document.getElementById("noteText").value = "";

  renderNotes();
}

function deleteNote(index) {
  saved.notes.splice(index, 1);
  save();
  renderNotes();
}

function renderNotes() {
  const box = document.getElementById("notes");

  if (!saved.notes.length) {
    box.innerHTML = `<p class="empty">No trip notes saved yet.</p>`;
    return;
  }

  box.innerHTML = saved.notes.map((item, index) => `
    <div class="saved-item note">
      <div>
        <small>${esc(item.date)}</small>
        <p>${esc(item.text)}</p>
      </div>
      <button class="delete" onclick="deleteNote(${index})">Delete</button>
    </div>
  `).join("");
}

function calculateBudget() {
  const hotel = Number(document.getElementById("hotelCost").value) || 0;
  const food = Number(document.getElementById("foodCost").value) || 0;
  const gas = Number(document.getElementById("gasCost").value) || 0;
  const fun = Number(document.getElementById("funCost").value) || 0;

  const total = hotel + food + gas + fun;

  document.getElementById("budgetResult").innerHTML =
    `<strong>Estimated trip total: $${total.toFixed(2)}</strong>`;
}

const style = document.createElement("style");

style.textContent = `
* {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  background: #eef8f7;
  color: #173b3b;
}

button,
input,
textarea {
  font: inherit;
}

button {
  cursor: pointer;
}

.hep {
  max-width: 760px;
  margin: auto;
  padding-bottom: 30px;
}

.hero {
  background: linear-gradient(135deg, #087f78, #12a89d);
  color: white;
  padding: 28px 20px;
  display: flex;
  align-items: center;
  gap: 15px;
  box-shadow: 0 5px 20px rgba(0,0,0,.12);
}

.logo {
  font-size: 48px;
}

.eyebrow {
  font-size: 12px;
  letter-spacing: 2px;
  opacity: .85;
}

h1 {
  margin: 3px 0;
  font-size: 30px;
}

.hero p {
  margin: 0;
  opacity: .9;
}

.welcome {
  padding: 24px 20px 10px;
}

.welcome h2 {
  margin-bottom: 7px;
}

.welcome p {
  line-height: 1.6;
}

.quick-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  padding: 10px 15px;
}

.quick-grid button,
.essential-grid button {
  border: 0;
  border-radius: 15px;
  background: white;
  padding: 16px 8px;
  color: #173b3b;
  box-shadow: 0 3px 12px rgba(0,0,0,.08);
}

.quick-grid button {
  font-size: 26px;
}

.quick-grid span {
  display: block;
  font-size: 13px;
  margin-top: 5px;
}

.card {
  background: white;
  margin: 15px;
  padding: 20px;
  border-radius: 20px;
  box-shadow: 0 4px 18px rgba(0,0,0,.08);
}

.card h2 {
  margin-top: 0;
}

.card p {
  line-height: 1.5;
}

.search-row {
  display: flex;
  gap: 8px;
}

input,
textarea {
  width: 100%;
  border: 1px solid #c8dddd;
  border-radius: 12px;
  padding: 13px;
  background: #fbffff;
}

textarea {
  min-height: 120px;
  resize: vertical;
}

.search-row button,
.form button,
.wide {
  border: 0;
  border-radius: 12px;
  background: #087f78;
  color: white;
  padding: 13px 18px;
  font-weight: 700;
}

.wide {
  width: 100%;
  margin-top: 10px;
}

.form {
  display: grid;
  gap: 9px;
}

.budget-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 9px;
}

.saved-item {
  margin-top: 10px;
  padding: 13px;
  border-radius: 13px;
  background: #edf8f7;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  align-items: center;
}

.saved-item small {
  display: block;
  opacity: .7;
  margin-top: 3px;
}

.saved-item p {
  margin-bottom: 0;
}

.delete {
  border: 0;
  background: #f1dddd;
  color: #8b2d2d;
  padding: 8px 10px;
  border-radius: 9px;
}

.empty {
  opacity: .6;
}

.result {
  margin-top: 12px;
  padding: 15px;
  border-radius: 12px;
  background: #e4f5ee;
  font-size: 18px;
}

.check {
  display: block;
  padding: 10px 0;
  border-bottom: 1px solid #edf0f0;
}

.check input {
  width: auto;
  margin-right: 8px;
}

.essential-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
}

footer {
  text-align: center;
  padding: 30px 20px;
  color: #557070;
  font-size: 14px;
}

@media (max-width: 430px) {
  .quick-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .search-row {
    flex-direction: column;
  }
}
`;

document.head.appendChild(style);

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  });
}

render();
