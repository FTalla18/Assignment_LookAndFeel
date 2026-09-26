/* =========================================================
   Frost Travel — bookings.js (Manage bookings page)
   Mock CRUD on a list of bookings:
     Create  -> addBooking()      Read   -> renderTable(), openView()
     Update  -> startEdit(), saveBooking()   Delete -> confirmDelete()
   Data is kept in localStorage so it survives a page refresh.
   A real site would send these same operations to a server API
   (POST, GET, PUT, DELETE) instead.
   ========================================================= */

const STORAGE_KEY = "frostTravelBookings";
let bookings = loadBookings();
let sort = { key: "date", dir: 1 };   // 1 = ascending, -1 = descending
let pendingDeleteId = null;
let viewingId = null;

const $ = id => document.getElementById(id);

document.addEventListener("DOMContentLoaded", () => {
  fillTripSelect();
  $("b-date").min = new Date().toISOString().slice(0, 10); // no past dates
  bindEvents();
  applyUrlTrip();
  updateQuote();
  renderTable();
});

/* ---------- Storage ---------- */
function loadBookings() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) { /* storage blocked: fall back to sample data */ }
  return structuredClone(SEED_BOOKINGS);
}
function saveAll() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(bookings)); } catch (e) { /* ignore */ }
}

/* ---------- Helpers ---------- */
const bookingTotal = b => tripById(b.trip).price * b.travelers * ROOM_MULTIPLIER[b.room];
const formatDate = iso => new Date(iso + "T12:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
const monthList = months => months.map(m => MONTHS[m - 1]).join(", ");
// Escape user text before putting it in HTML (prevents broken markup / script injection)
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function nextId() {
  const max = bookings.reduce((m, b) => Math.max(m, parseInt(b.id.split("-")[1], 10)), 1041);
  return "FT-" + (max + 1);
}

/* Trip dropdown grouped by destination with <optgroup> */
function fillTripSelect() {
  $("b-trip").innerHTML = '<option value="">Choose a trip</option>' +
    DESTINATIONS.map(d => `
      <optgroup label="${d.name}, ${d.country}">
        ${TRIPS.filter(t => t.dest === d.id)
          .map(t => `<option value="${t.id}">${t.title} (${t.nights} nights, ${usd(t.price)})</option>`).join("")}
      </optgroup>`).join("");
}

/* ---------- Events ---------- */
function bindEvents() {
  $("booking-form").addEventListener("submit", e => { e.preventDefault(); saveBooking(); });
  ["b-trip", "b-travelers", "b-room"].forEach(id => $(id).addEventListener("input", updateQuote));
  $("b-trip").addEventListener("change", updateTripHint);
  $("cancel-edit").addEventListener("click", resetForm);

  $("search").addEventListener("input", renderTable);
  $("filter-status").addEventListener("change", renderTable);

  document.querySelectorAll("[data-sort]").forEach(btn =>
    btn.addEventListener("click", () => {
      const key = btn.dataset.sort;
      sort = { key, dir: sort.key === key ? -sort.dir : 1 };
      renderTable();
    })
  );

  // One listener for every row button (event delegation)
  $("rows").addEventListener("click", e => {
    const btn = e.target.closest("button[data-action]");
    if (!btn) return;
    const id = btn.dataset.id;
    if (btn.dataset.action === "view") openView(id);
    if (btn.dataset.action === "edit") startEdit(id);
    if (btn.dataset.action === "delete") confirmDelete(id);
  });

  $("view-close").addEventListener("click", () => $("view-dialog").close());
  $("view-edit").addEventListener("click", () => { $("view-dialog").close(); startEdit(viewingId); });

  $("delete-cancel").addEventListener("click", () => $("delete-dialog").close());
  $("delete-confirm").addEventListener("click", deleteBooking);

  $("reset-data").addEventListener("click", () => {
    bookings = structuredClone(SEED_BOOKINGS);
    saveAll(); resetForm(); renderTable();
    showToast("Sample data restored");
  });
}

/* Coming from the home page: managebookings.html?trip=T101&month=11 */
function applyUrlTrip() {
  const params = new URLSearchParams(location.search);
  const trip = tripById(params.get("trip"));
  if (!trip) return;
  $("b-trip").value = trip.id;
  const month = +params.get("month") || trip.months[0];
  const now = new Date();
  let year = now.getFullYear();
  if (month < now.getMonth() + 1 || (month === now.getMonth() + 1 && now.getDate() > 15)) year++;
  $("b-date").value = `${year}-${String(month).padStart(2, "0")}-15`;
  updateTripHint();
  $("b-name").focus();
  showToast(`${trip.title} selected. Add your details to book.`);
}

/* ---------- Live price quote ---------- */
function updateQuote() {
  const trip = tripById($("b-trip").value);
  const travelers = Math.max(0, +$("b-travelers").value || 0);
  const room = $("b-room").value;
  if (!trip) {
    $("quote-detail").textContent = "Estimated total";
    $("quote-total").textContent = "$0";
    return;
  }
  const total = trip.price * travelers * ROOM_MULTIPLIER[room];
  $("quote-detail").textContent = `${travelers} × ${usd(trip.price)}${room !== "Standard" ? `, ${room} room` : ""}`;
  $("quote-total").textContent = usd(total);
}

function updateTripHint() {
  const trip = tripById($("b-trip").value);
  $("trip-hint").textContent = trip ? `Departs in ${monthList(trip.months)}.` : "";
}

/* ---------- Validation ---------- */
function validate(data) {
  const errors = {};
  if (data.name.trim().length < 2) errors.name = "Enter the traveler's full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) errors.email = "Enter an email like name@example.com.";
  const trip = tripById(data.trip);
  if (!trip) errors.trip = "Choose a trip.";
  if (!data.date) {
    errors.date = "Choose a departure date.";
  } else if (trip) {
    const month = +data.date.slice(5, 7);
    if (!trip.months.includes(month)) {
      errors.date = `This trip departs in ${monthList(trip.months)} only.`;
    }
  }
  if (!(data.travelers >= 1 && data.travelers <= 8)) errors.travelers = "Enter 1 to 8 travelers.";

  // Show or clear each message, and mark fields for screen readers
  ["name", "email", "trip", "date", "travelers"].forEach(f => {
    $("err-" + f).textContent = errors[f] || "";
    $("b-" + f).setAttribute("aria-invalid", errors[f] ? "true" : "false");
  });
  const first = Object.keys(errors)[0];
  if (first) $("b-" + first).focus();
  return !first;
}

/* ---------- CREATE + UPDATE ---------- */
function saveBooking() {
  const data = {
    id: $("b-id").value,
    name: $("b-name").value.trim(),
    email: $("b-email").value.trim(),
    trip: $("b-trip").value,
    date: $("b-date").value,
    travelers: +$("b-travelers").value,
    room: $("b-room").value,
    status: $("b-status").value
  };
  if (!validate(data)) return;

  let savedId;
  if (data.id) {                                   // UPDATE
    bookings = bookings.map(b => (b.id === data.id ? data : b));
    savedId = data.id;
    showToast(`Booking ${data.id} updated`);
  } else {                                         // CREATE
    data.id = nextId();
    bookings.push(data);
    savedId = data.id;
    showToast(`Booking ${data.id} added`);
  }
  saveAll();
  resetForm();
  renderTable(savedId);
}

function startEdit(id) {
  const b = bookings.find(x => x.id === id);
  if (!b) return;
  $("b-id").value = b.id;
  $("b-name").value = b.name;
  $("b-email").value = b.email;
  $("b-trip").value = b.trip;
  $("b-date").value = b.date;
  $("b-travelers").value = b.travelers;
  $("b-room").value = b.room;
  $("b-status").value = b.status;

  $("form-title").textContent = "Edit booking";
  $("editing-note").hidden = false;
  $("editing-note").textContent = `Editing ${b.id} for ${b.name}. Save to update the table.`;
  $("submit-btn").textContent = "Save changes";
  $("cancel-edit").hidden = false;
  updateQuote(); updateTripHint();
  $("booking-form").scrollIntoView({ behavior: "smooth", block: "start" });
  $("b-name").focus({ preventScroll: true });
}

function resetForm() {
  $("booking-form").reset();
  $("b-id").value = "";
  $("form-title").textContent = "New booking";
  $("editing-note").hidden = true;
  $("submit-btn").textContent = "Add booking";
  $("cancel-edit").hidden = true;
  document.querySelectorAll(".error-msg").forEach(e => (e.textContent = ""));
  document.querySelectorAll("[aria-invalid]").forEach(e => e.setAttribute("aria-invalid", "false"));
  updateQuote(); updateTripHint();
}

/* ---------- READ ---------- */
function renderTable(highlightId) {
  const q = $("search").value.trim().toLowerCase();
  const status = $("filter-status").value;

  const rows = bookings
    .map(b => ({ ...b, tripObj: tripById(b.trip), total: bookingTotal(b) }))
    .filter(b => status === "All" || b.status === status)
    .filter(b => !q || [b.name, b.email, b.id, b.tripObj.title, destById(b.tripObj.dest).name]
      .some(v => v.toLowerCase().includes(q)))
    .sort((a, b) => (sort.key === "total" ? a.total - b.total : a.date.localeCompare(b.date)) * sort.dir);

  $("rows").innerHTML = rows.length ? rows.map(b => `
    <tr data-id="${b.id}" ${b.id === highlightId ? 'class="flash"' : ""}>
      <td>${esc(b.name)}<small>${b.id}</small></td>
      <td>${b.tripObj.title}<small>${destById(b.tripObj.dest).name}</small></td>
      <td>${formatDate(b.date)}</td>
      <td class="num">${b.travelers}</td>
      <td class="num">${usd(b.total)}</td>
      <td><span class="status status-${b.status}">${b.status}</span></td>
      <td class="row-actions">
        <button class="btn-text" data-action="view" data-id="${b.id}" aria-label="View ${esc(b.name)}">View</button>
        <button class="btn-text" data-action="edit" data-id="${b.id}" aria-label="Edit ${esc(b.name)}">Edit</button>
        <button class="btn-text danger" data-action="delete" data-id="${b.id}" aria-label="Delete ${esc(b.name)}">Delete</button>
      </td>
    </tr>`).join("")
    : `<tr><td colspan="7" style="padding:2.5rem 1rem;text-align:center">No bookings match. Clear the search or add a booking with the form.</td></tr>`;

  $("row-count").textContent = `Showing ${rows.length} of ${bookings.length} bookings`;

  // Sort indicators on the column headers
  ["date", "total"].forEach(k => {
    const th = $("sort-" + k).closest("th");
    const active = sort.key === k;
    $("sort-" + k).textContent = active ? (sort.dir === 1 ? "▲" : "▼") : "";
    th.setAttribute("aria-sort", active ? (sort.dir === 1 ? "ascending" : "descending") : "none");
  });

  // Summary numbers ignore cancelled bookings
  const active = bookings.filter(b => b.status !== "Cancelled");
  $("sum-count").textContent = active.length;
  $("sum-travelers").textContent = active.reduce((s, b) => s + b.travelers, 0);
  $("sum-revenue").textContent = usd(bookings.filter(b => b.status === "Confirmed").reduce((s, b) => s + bookingTotal(b), 0));
  $("sum-pending").textContent = bookings.filter(b => b.status === "Pending").length;
}

function openView(id) {
  const b = bookings.find(x => x.id === id);
  const trip = tripById(b.trip);
  const place = destById(trip.dest);
  viewingId = id;
  $("view-img").src = place.img;
  $("view-title").textContent = trip.title;
  const month = +b.date.slice(5, 7);
  $("view-details").innerHTML = `
    <dt>Booking</dt><dd>${b.id}</dd>
    <dt>Traveler</dt><dd>${esc(b.name)}</dd>
    <dt>Email</dt><dd>${esc(b.email)}</dd>
    <dt>Destination</dt><dd>${place.name}, ${place.country}</dd>
    <dt>Departure</dt><dd>${formatDate(b.date)}, ${trip.nights} nights</dd>
    <dt>Guests</dt><dd>${b.travelers}, ${b.room} room</dd>
    <dt>Dark sky</dt><dd>${darkHoursForMonth(trip.dest, month).toFixed(1)} hours per night</dd>
    <dt>Average temp</dt><dd>${place.temps[month - 1]}°C (${Math.round(place.temps[month - 1] * 9 / 5 + 32)}°F)</dd>
    <dt>Total</dt><dd>${usd(bookingTotal(b))}</dd>
    <dt>Status</dt><dd><span class="status status-${b.status}">${b.status}</span></dd>`;
  $("view-dialog").showModal();
}

/* ---------- DELETE ---------- */
function confirmDelete(id) {
  const b = bookings.find(x => x.id === id);
  pendingDeleteId = id;
  $("delete-text").textContent = `${b.id} for ${b.name} on ${tripById(b.trip).title} will be removed. This can't be undone, but you can restore all sample data from the link under the table.`;
  $("delete-dialog").showModal();
}

function deleteBooking() {
  bookings = bookings.filter(b => b.id !== pendingDeleteId);
  if ($("b-id").value === pendingDeleteId) resetForm();
  saveAll();
  $("delete-dialog").close();
  renderTable();
  showToast(`Booking ${pendingDeleteId} deleted`);
  pendingDeleteId = null;
}
