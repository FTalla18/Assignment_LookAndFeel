# Frost Travel

Aurora and polar trips, timed to the dark. A static, data-themed travel agency website built by **Freeman Talla** for ISM 6225 (Look and Feel assignment) at the University of South Florida.

**Live site:** https://ftalla18.github.io/Assignment_LookAndFeel/
**Source code:** https://github.com/FTalla18/Assignment_LookAndFeel

## The idea

Most travel sites sell places. Frost Travel sells *timing*. Seeing the northern lights depends above all on hours of real darkness, so every page is built around that number: the home page ranks trips by dark-sky hours for the month you pick, the analytics page shows when each destination is dark, cold or crowded, and the booking form refuses dates when a trip doesn't run. The agency is based in Sarasota, so it speaks to Floridians heading somewhere very different from home.

## Pages

| Page | File | What it does |
|---|---|---|
| Home | `index.html` | Hero with live "dark sky tonight" hours, six destinations, trip finder (month, style, budget), how-it-works steps |
| About us | `aboutus.html` | Developer profile, experience, education, how the site was built, technologies, GitHub links |
| Manage bookings (CRUD) | `managebookings.html` | Create, read, update and delete bookings with validation, search, filter, sort and a live price quote |
| Analytics | `analytics.html` | Five Chart.js charts: darkness by month, temperature vs darkness, Iceland seasonality, Antarctic growth, live bookings |

## File structure

```
Assignment_LookAndFeel/
├── index.html
├── aboutus.html
├── managebookings.html
├── analytics.html
├── README.md
├── css/style.css        one stylesheet for all pages
├── js/data.js           shared data "tables" + darkness formula
├── js/main.js           mobile menu + toast messages (every page)
├── js/home.js           tonight panel + trip finder
├── js/bookings.js       CRUD logic
├── js/analytics.js      charts
└── img/                 original SVG illustrations
```

## Publish on GitHub Pages

Your fork already has `css/`, `img/`, `js/`, `index.html` and `sample.html` from the original project. The new files replace `index.html` and add everything else.

### Option A: in the browser (no Git needed)

1. Unzip `frost-travel.zip` on your computer.
2. Open https://github.com/FTalla18/Assignment_LookAndFeel.
3. Click **Add file → Upload files**.
4. Open the unzipped folder, select **everything inside it** (the four `.html` files, `README.md`, and the `css`, `js` and `img` folders) and drag it onto the upload area. Chrome and Edge keep the folder structure.
5. Write a commit message such as `Add Frost Travel website` and click **Commit changes**.
6. Optional cleanup: open the old files from the original template (for example `sample.html` and any old files inside `css/`, `js/`, `img/` that aren't listed above), click the **⋯** menu, and choose **Delete file**. Unused files don't break anything.
7. Go to **Settings → Pages**. Under *Build and deployment*, set **Source** to *Deploy from a branch*, **Branch** to `master` and folder `/ (root)`, then click **Save**.
8. Wait 1 to 2 minutes, refresh the Pages settings screen, and open the link it shows: `https://ftalla18.github.io/Assignment_LookAndFeel/`
9. On the repository's main page, click the **gear icon next to About** and paste that link into *Website* so visitors can find the live site.

### Option B: with Git on the command line

```bash
git clone https://github.com/FTalla18/Assignment_LookAndFeel.git
cd Assignment_LookAndFeel
# copy the unzipped Frost Travel files into this folder, replacing index.html
git add .
git commit -m "Add Frost Travel website"
git push origin master
```

Then turn on Pages as in step 7 above.

### Check it works

Open every page from the top menu, add a booking on **Manage bookings**, then open **Analytics**: the last chart should include your new booking. If a page shows without styles, check that the folder names are lowercase (`css`, `js`, `img`), because GitHub Pages is case-sensitive.

## Run it locally

Double-click `index.html`. Everything works offline except the Google Fonts and Chart.js, which load from the internet. For auto-refresh while editing, use the **Live Server** extension in VS Code.

## Personalize

- **Your photo:** add `img/freeman.jpg`, then in `aboutus.html` change `img/freeman.svg` to `img/freeman.jpg`.
- **Photos instead of illustrations:** free photos from https://unsplash.com (search "aurora Tromsø", "Svalbard", "Ilulissat icebergs"). Save them in `img/`, keep them under about 300 KB (resize to 1600 px wide and compress at https://squoosh.app), and update the `src` in `index.html` and `js/data.js`.
- **Colors and fonts:** change the variables at the top of `css/style.css` and the whole site updates.

## From static to data-driven: the plan

This version stores data in `js/data.js` and the browser's `localStorage`. A data-driven version keeps the same pages and swaps the data source for a server.

**Database tables**

| Table | Key fields |
|---|---|
| `destinations` | id, name, country, latitude, longitude, image_url, description |
| `climate_normals` | destination_id, month, avg_temp_c |
| `trips` | id, destination_id, title, style, nights, price_usd |
| `trip_months` | trip_id, month (which months each trip departs) |
| `bookings` | id, trip_id, customer_id, departure_date, travelers, room_type, status, created_at |
| `customers` | id, name, email, home_airport |

**API endpoints** (each maps to a CRUD action on the Manage bookings page)

| Action | Request | Replaces in `bookings.js` |
|---|---|---|
| Create | `POST /api/bookings` | `bookings.push(...)` |
| Read | `GET /api/bookings?status=&q=` | `loadBookings()` and the filters |
| Update | `PUT /api/bookings/:id` | `bookings.map(...)` in `saveBooking()` |
| Delete | `DELETE /api/bookings/:id` | `bookings.filter(...)` in `deleteBooking()` |
| Trips | `GET /api/trips?month=&style=&maxPrice=` | the filters in `home.js` |

**Live data worth adding:** NOAA Space Weather Prediction Center aurora forecasts (Kp index), a cloud-cover forecast API, and real flight prices from Tampa (TPA) and Sarasota (SRQ). The analytics page could read directly from a warehouse such as Snowflake.

**Suggested stack:** Python (FastAPI or Flask) or Node.js (Express), PostgreSQL, deployed on Render or Azure; the front end stays on GitHub Pages and calls the API with `fetch()`.

## Where to find each concept in the code

Useful for reviewing alongside W3Schools.

| Concept | Where |
|---|---|
| Semantic HTML (`header`, `nav`, `main`, `section`, `footer`) | every `.html` file |
| Forms, `required`, `type="email"`, `type="date"`, `<optgroup>` | `managebookings.html` |
| `<dialog>` modal | `managebookings.html`, `openView()` in `bookings.js` |
| CSS variables | top of `style.css` |
| CSS Grid and Flexbox | `.dest-grid`, `.board li`, `.crud-layout` |
| Media queries (responsive) | bottom of `style.css` |
| CSS animation | `@keyframes sway` (hero aurora) |
| `addEventListener`, event delegation | `bookings.js` (`$("rows").addEventListener`) |
| Array `filter`, `map`, `sort`, `reduce` | `renderBoard()` in `home.js`, `renderTable()` in `bookings.js` |
| Template literals to build HTML | same functions |
| `localStorage` + JSON | `loadBookings()` / `saveAll()` |
| URL parameters | `applyUrlTrip()` in `bookings.js` |
| Chart.js | `analytics.js` |
| Accessibility (`aria-*`, focus styles, skip link) | header markup, `style.css` section 2 |

## Performance choices

No CSS framework or jQuery; one small stylesheet; SVG illustrations of 2 to 11 KB each; images below the fold use `loading="lazy"`; all scripts use `defer`; Chart.js loads only on the analytics page; fonts use `display=swap`; animation is turned off for visitors who prefer reduced motion.

## Data sources

- Icelandic Tourist Board, *Tourism in Iceland in figures*, October 2024 (monthly departures, Oct 2023 to Sep 2024)
- Keflavík Airport, 2024 passenger report (2.26 million foreign visitors)
- IAATO, ATCM 46 IP102 and IP104 (Antarctic visitors and landing passengers by season)
- Climate: approximate 1991–2020 monthly averages from national weather services, rounded
- Darkness hours: calculated from latitude with the solar declination formula in `js/data.js`

Trips, prices and bookings are fictional.
