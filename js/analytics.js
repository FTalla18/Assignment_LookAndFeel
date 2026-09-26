/* =========================================================
   Frost Travel — analytics.js (Analytics page)
   Five Chart.js charts built from js/data.js, plus the live
   bookings saved by the Manage bookings page.
   Chart.js docs: https://www.chartjs.org/docs/latest/
   ========================================================= */

// One color per destination, reused in every chart for consistency
const DEST_COLORS = {
  tromso: "#0b7f66", rovaniemi: "#9b4fc0", iceland: "#1f8fb3",
  svalbard: "#13283d", greenland: "#c9791a", antarctica: "#7fa3bf"
};
const INK = "#13283d", SLATE = "#506173", GRID = "#e3e9ee";
const MONTH_NUMS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
let tempChart;

document.addEventListener("DOMContentLoaded", () => {
  if (typeof Chart === "undefined") {
    document.querySelectorAll(".chart-box").forEach(b =>
      (b.innerHTML = '<p class="muted">Charts could not load. Check your internet connection and refresh the page.</p>'));
    return;
  }
  // Global Chart.js defaults so every chart shares the site's type and colors
  Chart.defaults.font.family = getComputedStyle(document.body).fontFamily;
  Chart.defaults.color = SLATE;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.tooltip.backgroundColor = INK;
  Chart.defaults.plugins.tooltip.padding = 10;
  Chart.defaults.maintainAspectRatio = false;

  document.getElementById("kpi-svalbard").textContent =
    darkHoursForMonth("svalbard", 12).toFixed(1) + " h";

  drawDarkness();
  setupTempChart();
  drawIceland();
  drawAntarctica();
  drawBookings();
});

/* ---------- Chart 1: dark hours by month (line) ---------- */
function drawDarkness() {
  const datasets = DESTINATIONS.map(d => ({
    label: d.name,
    data: MONTH_NUMS.map(m => darkHoursForMonth(d.id, m)),
    borderColor: DEST_COLORS[d.id],
    backgroundColor: DEST_COLORS[d.id],
    cubicInterpolationMode: "monotone", borderWidth: 2.5, pointRadius: 2.5
  }));
  datasets.push({
    label: "Sarasota",
    data: MONTH_NUMS.map(m => darkHours(27.34, midMonthDay(m))),
    borderColor: "#a3adb7", backgroundColor: "#a3adb7",
    borderDash: [6, 5], cubicInterpolationMode: "monotone", borderWidth: 2, pointRadius: 0
  });

  new Chart(document.getElementById("chart-dark"), {
    type: "line",
    data: { labels: MONTHS, datasets },
    options: {
      interaction: { mode: "index", intersect: false },
      scales: {
        y: { min: 0, max: 24, ticks: { stepSize: 6, callback: v => v + " h" }, grid: { color: GRID } },
        x: { grid: { display: false } }
      },
      plugins: {
        legend: { position: "bottom" },
        tooltip: { callbacks: { label: c => ` ${c.dataset.label}: ${c.parsed.y.toFixed(1)} h` } }
      }
    }
  });
}

/* ---------- Chart 2: temperature + darkness for one destination ---------- */
function setupTempChart() {
  const select = document.getElementById("dest-select");
  select.innerHTML = DESTINATIONS.map(d => `<option value="${d.id}">${d.name}, ${d.country}</option>`).join("");
  select.addEventListener("change", drawTemp);
  document.querySelectorAll('input[name="unit"]').forEach(r => r.addEventListener("change", drawTemp));
  drawTemp();
}

function drawTemp() {
  const dest = destById(document.getElementById("dest-select").value);
  const unit = document.querySelector('input[name="unit"]:checked').value;
  const toUnit = c => (unit === "F" ? Math.round(c * 9 / 5 + 32) : c);
  const temps = dest.temps.map(toUnit);
  const dark = MONTH_NUMS.map(m => darkHoursForMonth(dest.id, m));
  const freezing = unit === "F" ? 32 : 0;

  const data = {
    labels: MONTHS,
    datasets: [
      {
        type: "bar", label: `Average temperature (°${unit})`, data: temps, yAxisID: "yTemp",
        // Below-freezing months in blue, above in amber
        backgroundColor: temps.map(t => (t <= freezing ? "#9cc7df" : "#f0c48a")),
        borderRadius: 4
      },
      {
        type: "line", label: "Dark hours per night", data: dark, yAxisID: "yDark",
        borderColor: DEST_COLORS[dest.id], backgroundColor: DEST_COLORS[dest.id],
        cubicInterpolationMode: "monotone", borderWidth: 3, pointRadius: 3
      }
    ]
  };

  if (tempChart) {           // update instead of rebuilding: smoother and faster
    tempChart.data = data;
    tempChart.options.scales.yTemp.title.text = `°${unit}`;
    tempChart.update();
  } else {
    tempChart = new Chart(document.getElementById("chart-temp"), {
      data,
      options: {
        interaction: { mode: "index", intersect: false },
        scales: {
          yTemp: { position: "left", title: { display: true, text: `°${unit}` }, grid: { color: GRID } },
          yDark: { position: "right", min: 0, max: 24, title: { display: true, text: "Dark hours" }, grid: { display: false } },
          x: { grid: { display: false } }
        },
        plugins: { legend: { position: "bottom" } }
      }
    });
  }

  // Plain-language takeaway computed from the same data
  const darkest = dark.indexOf(Math.max(...dark));
  const goodMonths = MONTH_NUMS.filter(m => dark[m - 1] >= 10);
  const text = document.getElementById("temp-takeaway");
  if (goodMonths.length) {
    const mildest = goodMonths.reduce((best, m) => (dest.temps[m - 1] > dest.temps[best - 1] ? m : best));
    text.textContent = `${dest.name} is darkest in ${MONTHS[darkest]} (${dark[darkest].toFixed(1)} h). ` +
      `Of the months with at least 10 dark hours, ${MONTHS[mildest - 1]} is the mildest at ${temps[mildest - 1]}°${unit}, a good pick if you feel the cold.`;
  } else {
    text.textContent = `${dest.name} is not an aurora destination for our travelers: its season is about ice and wildlife in near-constant daylight.`;
  }
  if (dest.id === "antarctica") {
    text.textContent = `The Antarctic Peninsula is darkest in ${MONTHS[darkest]}, but ships only sail November to March, when temperatures hover around ${toUnit(1)}°${unit} and there is little or no night at all.`;
  }
}

/* ---------- Chart 3: Iceland monthly visitors (bar) ---------- */
function drawIceland() {
  const winter = ["Nov", "Dec", "Jan '24", "Feb", "Mar"];
  new Chart(document.getElementById("chart-iceland"), {
    type: "bar",
    data: {
      labels: ICELAND_MONTHLY.labels,
      datasets: [{
        label: "Visitors (thousands)",
        data: ICELAND_MONTHLY.values,
        backgroundColor: ICELAND_MONTHLY.labels.map(l => (winter.includes(l) ? DEST_COLORS.iceland : "#c9d4dd")),
        borderRadius: 4
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y.toFixed(1)}k visitors` } } },
      scales: { y: { beginAtZero: true, grid: { color: GRID }, ticks: { callback: v => v + "k" } }, x: { grid: { display: false } } }
    }
  });
}

/* ---------- Chart 4: Antarctic landings by season (bar) ---------- */
function drawAntarctica() {
  new Chart(document.getElementById("chart-antarctica"), {
    type: "bar",
    data: {
      labels: ANTARCTICA_SEASONS.labels,
      datasets: [{
        label: "Landing passengers",
        data: ANTARCTICA_SEASONS.peninsulaLandings,
        backgroundColor: ANTARCTICA_SEASONS.labels.map(l => (l === "2021-22" ? "#c9d4dd" : DEST_COLORS.antarctica)),
        borderRadius: 4
      }]
    },
    options: {
      plugins: { legend: { display: false }, tooltip: { callbacks: { label: c => ` ${c.parsed.y.toLocaleString()} passengers` } } },
      scales: { y: { beginAtZero: true, grid: { color: GRID }, ticks: { callback: v => v / 1000 + "k" } }, x: { grid: { display: false } } }
    }
  });
}

/* ---------- Chart 5: live bookings from the CRUD page ---------- */
function drawBookings() {
  let bookings = SEED_BOOKINGS;
  try {
    const saved = localStorage.getItem("frostTravelBookings");
    if (saved) bookings = JSON.parse(saved);
  } catch (e) { /* use sample data */ }

  const active = bookings.filter(b => b.status !== "Cancelled");
  document.getElementById("kpi-bookings").textContent = active.length;

  const travelers = {}, revenue = {};
  DESTINATIONS.forEach(d => { travelers[d.id] = 0; revenue[d.id] = 0; });
  active.forEach(b => {
    const t = tripById(b.trip);
    travelers[t.dest] += b.travelers;
    revenue[t.dest] += t.price * b.travelers * ROOM_MULTIPLIER[b.room];
  });

  new Chart(document.getElementById("chart-bookings"), {
    type: "bar",
    data: {
      labels: DESTINATIONS.map(d => d.name),
      datasets: [{
        label: "Revenue (USD)",
        data: DESTINATIONS.map(d => revenue[d.id]),
        backgroundColor: DESTINATIONS.map(d => DEST_COLORS[d.id]),
        borderRadius: 4
      }]
    },
    options: {
      indexAxis: "y",   // horizontal bars read better with long names
      scales: {
        x: { beginAtZero: true, grid: { color: GRID }, ticks: { callback: v => "$" + v / 1000 + "k" } },
        y: { grid: { display: false } }
      },
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: c => {
          const id = DESTINATIONS[c.dataIndex].id;
          return ` ${usd(c.parsed.x)} from ${travelers[id]} travelers`;
        } } }
      }
    }
  });

  const top = DESTINATIONS.reduce((a, b) => (revenue[b.id] > revenue[a.id] ? b : a));
  const total = Object.values(revenue).reduce((s, v) => s + v, 0);
  document.getElementById("bookings-takeaway").textContent = total
    ? `${top.name} brings in the most revenue, ${usd(revenue[top.id])} of ${usd(total)} across ${active.length} active bookings.`
    : "No active bookings yet. Add one on the manage bookings page to see it here.";
}
