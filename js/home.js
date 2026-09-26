/* =========================================================
   Frost Travel — home.js
   1. "Dark sky tonight" panel in the hero
   2. Trip finder: filter TRIPS by month, style, budget and
      destination, then rank by hours of darkness
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  renderTonight();
  setupFinder();
});

/* ---------- 1. Tonight panel ---------- */
function renderTonight() {
  const today = new Date();
  const start = new Date(today.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((today - start) / 86400000);

  // Every destination plus Sarasota for comparison
  const places = DESTINATIONS.map(d => ({ name: d.name, lat: d.lat }));
  places.push({ name: "Sarasota, for comparison", lat: 27.34 });

  const rows = places
    .map(p => ({ ...p, hours: darkHours(p.lat, dayOfYear) }))
    .map(p => `
      <tr>
        <td>${p.name}<div class="bar"><i style="width:${(p.hours / 24) * 100}%"></i></div></td>
        <td>${p.hours.toFixed(1)} h</td>
      </tr>`)
    .join("");

  document.getElementById("tonight-rows").innerHTML = rows;
  document.getElementById("tonight-date").textContent =
    "Hours with the sun at least 12° below the horizon on " +
    today.toLocaleDateString("en-US", { month: "long", day: "numeric" }) + ".";
}

/* ---------- 2. Trip finder ---------- */
const finder = { month: new Date().getMonth() + 1, style: "All", budget: 16000, dest: null };

function setupFinder() {
  const monthSelect = document.getElementById("f-month");
  const budget = document.getElementById("f-budget");
  const budgetOut = document.getElementById("budget-out");

  // Build month options with full names
  monthSelect.innerHTML = MONTHS.map((m, i) => {
    const full = new Date(2026, i, 1).toLocaleDateString("en-US", { month: "long" });
    return `<option value="${i + 1}" ${i + 1 === finder.month ? "selected" : ""}>${full}</option>`;
  }).join("");

  monthSelect.addEventListener("change", e => { finder.month = +e.target.value; renderBoard(); });

  document.querySelectorAll('input[name="style"]').forEach(radio =>
    radio.addEventListener("change", e => { finder.style = e.target.value; renderBoard(); })
  );

  budget.addEventListener("input", e => {
    finder.budget = +e.target.value;
    budgetOut.textContent = usd(finder.budget);
    renderBoard();
  });

  // Clicking a destination tile narrows the finder to that place
  document.querySelectorAll(".dest").forEach(tile =>
    tile.addEventListener("click", () => { finder.dest = tile.dataset.dest; renderBoard(); })
  );

  // One listener on the list handles "Show all" and "Reset" buttons (event delegation)
  document.getElementById("result-meta").addEventListener("click", e => {
    if (e.target.matches("[data-clear-dest]")) { finder.dest = null; renderBoard(); }
  });
  document.getElementById("board").addEventListener("click", e => {
    if (e.target.matches("[data-reset]")) resetFinder();
  });

  renderBoard();
}

function resetFinder() {
  finder.style = "All"; finder.budget = 16000; finder.dest = null;
  document.getElementById("s-all").checked = true;
  document.getElementById("f-budget").value = 16000;
  document.getElementById("budget-out").textContent = usd(16000);
  renderBoard();
}

function renderBoard() {
  const monthName = new Date(2026, finder.month - 1, 1).toLocaleDateString("en-US", { month: "long" });

  const results = TRIPS
    .filter(t => t.months.includes(finder.month))
    .filter(t => finder.style === "All" || t.style === finder.style)
    .filter(t => t.price <= finder.budget)
    .filter(t => !finder.dest || t.dest === finder.dest)
    .map(t => ({ ...t, place: destById(t.dest), hours: darkHoursForMonth(t.dest, finder.month) }))
    .sort((a, b) => b.hours - a.hours || a.price - b.price);

  // Summary line above the list
  const meta = document.getElementById("result-meta");
  const destNote = finder.dest
    ? ` in ${destById(finder.dest).name}. <button class="btn-text" data-clear-dest>Show all destinations</button>`
    : ", darkest nights first.";
  meta.innerHTML = `${results.length} ${results.length === 1 ? "trip departs" : "trips depart"} in ${monthName}${destNote}`;

  const board = document.getElementById("board");
  if (!results.length) {
    board.innerHTML = `
      <li class="empty-state">
        <div>
          <h3>No departures match these filters</h3>
          <p>Aurora trips run September to March and summer trips June to August. Try another month or raise your budget.</p>
          <button class="btn btn-ghost btn-small" data-reset>Reset filters</button>
        </div>
      </li>`;
    return;
  }

  board.innerHTML = results.map(t => `
    <li>
      <img src="${t.place.img}" alt="" width="88" height="62" loading="lazy">
      <div>
        <h3>${t.title}</h3>
        <p class="sub"><span class="style-tag">${t.style}</span>${t.place.name}, ${t.place.country}, ${t.nights} nights</p>
      </div>
      <div class="dark-meter">
        <b>${t.hours.toFixed(1)} h</b> of dark sky per night
        <div class="meter" aria-hidden="true"><i style="width:${(t.hours / 24) * 100}%"></i></div>
      </div>
      <div class="price">${usd(t.price)}<small>per person</small></div>
      <a class="btn btn-primary btn-small book" href="managebookings.html?trip=${t.id}&month=${finder.month}">Book this trip</a>
    </li>`).join("");
}
