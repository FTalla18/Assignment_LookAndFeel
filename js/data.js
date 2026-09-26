/* =========================================================
   Frost Travel — data.js
   The "static database" for the whole site. In a data-driven
   version, each array below would be a database table served
   by an API (see README.md for the plan).
   ========================================================= */

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

/* ---- Destinations table ----------------------------------
   temps: average monthly temperature in °C, rounded
   (approximate 1991–2020 climate normals). */
const DESTINATIONS = [
  {
    id: "tromso", name: "Tromsø", country: "Norway", lat: 69.65, lng: 18.96,
    img: "img/tromso.jpg",
    blurb: "A lively Arctic city on a fjord, right under the auroral oval. Whale season overlaps with the darkest weeks.",
    temps: [-4, -4, -3, 1, 5, 9, 12, 11, 8, 3, 0, -2]
  },
  {
    id: "rovaniemi", name: "Rovaniemi", country: "Finland", lat: 66.50, lng: 25.73,
    img: "img/rovaniemi.jpg",
    blurb: "Finnish Lapland on the Arctic Circle: glass igloos, husky trails and deep, still forest cold.",
    temps: [-12, -11, -7, -1, 6, 12, 15, 12, 7, 1, -4, -9]
  },
  {
    id: "iceland", name: "South Iceland", country: "Iceland", lat: 63.99, lng: -19.02,
    img: "img/iceland.jpg",
    blurb: "Black-sand beaches, ice caves and hot springs. Mild for its latitude and a five-hour flight from Florida hubs.",
    temps: [0, 0, 1, 3, 6, 9, 11, 11, 8, 5, 2, 0]
  },
  {
    id: "svalbard", name: "Svalbard", country: "Norway", lat: 78.22, lng: 15.65,
    img: "img/svalbard.jpg",
    blurb: "The northernmost town on Earth. Weeks of polar night in winter, polar bears and midnight sun in summer.",
    temps: [-13, -13, -13, -9, -3, 3, 7, 6, 2, -4, -8, -10]
  },
  {
    id: "greenland", name: "Ilulissat", country: "Greenland", lat: 69.22, lng: -51.10,
    img: "img/greenland.jpg",
    blurb: "A UNESCO icefjord where city-sized icebergs drift past colorful houses. Quiet, remote and unforgettable.",
    temps: [-13, -14, -13, -7, 0, 5, 8, 7, 3, -3, -7, -11]
  },
  {
    id: "antarctica", name: "Antarctic Peninsula", country: "Antarctica", lat: -64.77, lng: -64.05,
    img: "img/antarctica.jpg",
    blurb: "The seventh continent by expedition ship from Ushuaia. Penguin colonies, glaciers and near-endless daylight.",
    temps: [2, 2, 1, -1, -3, -5, -6, -6, -5, -3, -1, 1]
  }
];

/* ---- Trips table ------------------------------------------
   months: 1–12, the months this trip departs
   price: USD per person, land/cruise only                    */
const TRIPS = [
  { id: "T101", dest: "tromso",     title: "Fjord Nights Aurora Week",     style: "Aurora",     nights: 6,  price: 3890,  months: [9, 10, 11, 12, 1, 2, 3] },
  { id: "T102", dest: "tromso",     title: "Whales & Northern Lights",     style: "Wildlife",   nights: 5,  price: 4450,  months: [11, 12, 1] },
  { id: "T201", dest: "rovaniemi",  title: "Glass Igloo Escape",           style: "Aurora",     nights: 5,  price: 4200,  months: [9, 10, 12, 1, 2, 3] },
  { id: "T202", dest: "rovaniemi",  title: "Husky Trail & Aurora Camp",    style: "Adventure",  nights: 7,  price: 3650,  months: [1, 2, 3] },
  { id: "T301", dest: "iceland",    title: "Ring Road Winter Light",       style: "Aurora",     nights: 8,  price: 3290,  months: [9, 10, 11, 2, 3] },
  { id: "T302", dest: "iceland",    title: "Ice Caves & Hot Springs",      style: "Adventure",  nights: 4,  price: 2190,  months: [11, 12, 1, 2, 3] },
  { id: "T401", dest: "svalbard",   title: "Polar Night Expedition",       style: "Expedition", nights: 5,  price: 5400,  months: [11, 12, 1] },
  { id: "T402", dest: "svalbard",   title: "Midnight Sun & Polar Bears",   style: "Wildlife",   nights: 9,  price: 8900,  months: [6, 7, 8] },
  { id: "T501", dest: "greenland",  title: "Icefjord & Aurora",            style: "Aurora",     nights: 6,  price: 5850,  months: [9, 10, 3] },
  { id: "T502", dest: "greenland",  title: "Iceberg Kayak Summer",         style: "Adventure",  nights: 7,  price: 6100,  months: [6, 7, 8] },
  { id: "T601", dest: "antarctica", title: "Peninsula Expedition Cruise",  style: "Expedition", nights: 11, price: 11900, months: [11, 12, 1, 2, 3] },
  { id: "T602", dest: "antarctica", title: "Crossing the Antarctic Circle", style: "Expedition", nights: 14, price: 15400, months: [1, 2] }
];

/* ---- Seed bookings (used by the CRUD page) --------------- */
const SEED_BOOKINGS = [
  { id: "FT-1042", name: "Maria Delgado",   email: "maria.d@example.com",  trip: "T101", date: "2026-11-14", travelers: 2, room: "Standard",    status: "Confirmed" },
  { id: "FT-1043", name: "James Okafor",    email: "j.okafor@example.com", trip: "T601", date: "2026-12-03", travelers: 2, room: "Suite",       status: "Confirmed" },
  { id: "FT-1044", name: "Priya Raman",     email: "priya.r@example.com",  trip: "T201", date: "2027-01-09", travelers: 3, room: "Premium",     status: "Pending" },
  { id: "FT-1045", name: "Tom Becker",      email: "tbecker@example.com",  trip: "T302", date: "2027-02-20", travelers: 1, room: "Standard",    status: "Confirmed" },
  { id: "FT-1046", name: "Aisha Johnson",   email: "aisha.j@example.com",  trip: "T401", date: "2026-12-12", travelers: 2, room: "Premium",     status: "Pending" },
  { id: "FT-1047", name: "Luca Moretti",    email: "luca.m@example.com",   trip: "T301", date: "2027-03-05", travelers: 4, room: "Standard",    status: "Confirmed" },
  { id: "FT-1048", name: "Hannah Kim",      email: "hannah.k@example.com", trip: "T102", date: "2026-11-28", travelers: 2, room: "Standard",    status: "Cancelled" },
  { id: "FT-1049", name: "Robert Vance",    email: "rvance@example.com",   trip: "T501", date: "2026-10-17", travelers: 2, room: "Premium",     status: "Confirmed" }
];

/* Room upgrades multiply the base price */
const ROOM_MULTIPLIER = { Standard: 1, Premium: 1.25, Suite: 1.6 };

/* ---- Research datasets (analytics page) ------------------ */

// International departures of foreign visitors via Keflavík Airport,
// Oct 2023 – Sep 2024, in thousands. Source: Icelandic Tourist Board / Isavia.
const ICELAND_MONTHLY = {
  labels: ["Oct '23", "Nov", "Dec", "Jan '24", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep"],
  values: [203.0, 148.4, 135.7, 128.1, 155.7, 172.0, 137.2, 157.4, 212.4, 276.6, 281.5, 223.0]
};

// Antarctic tourism by season. Source: IAATO (ATCM 46 IP104 and 2024-25 season report).
const ANTARCTICA_SEASONS = {
  labels: ["2018-19", "2019-20", "2021-22", "2022-23", "2023-24", "2024-25"],
  peninsulaLandings: [44303, 54485, 22979, 69854, 77597, 77760], // passengers on landing voyages
  totalVisitors: { "2023-24": 122072, "2024-25": 118491 }
};

/* ---- Astronomy helper -------------------------------------
   Hours per night with the sun at least 12° below the horizon
   (dark enough for the aurora to show well). Uses a standard
   solar-declination approximation; accurate to a few minutes. */
function darkHours(lat, dayOfYear) {
  const rad = Math.PI / 180;
  const decl = -23.44 * Math.cos(rad * (360 / 365) * (dayOfYear + 10));
  const h0 = -12; // sun altitude threshold in degrees
  const cosH = (Math.sin(h0 * rad) - Math.sin(lat * rad) * Math.sin(decl * rad)) /
               (Math.cos(lat * rad) * Math.cos(decl * rad));
  if (cosH <= -1) return 0;   // sun never gets that low: no real darkness
  if (cosH >= 1) return 24;   // sun stays below all day: polar night
  const H = Math.acos(cosH) / rad; // hour angle in degrees
  return +(24 - (2 * H) / 15).toFixed(1);
}

// Day-of-year for the 15th of a month (1–12)
function midMonthDay(month) {
  return Math.round((month - 1) * 30.44 + 15);
}

function darkHoursForMonth(destId, month) {
  const d = DESTINATIONS.find(x => x.id === destId);
  return darkHours(d.lat, midMonthDay(month));
}

// Shared lookups used on several pages
const destById = id => DESTINATIONS.find(d => d.id === id);
const tripById = id => TRIPS.find(t => t.id === id);
const usd = n => "$" + Math.round(n).toLocaleString("en-US");
