/* =========================================================
   Frost Travel — main.js (loaded on every page)
   - Mobile menu toggle
   - Footer year
   - showToast(): small confirmation message used by other scripts
   ========================================================= */

document.addEventListener("DOMContentLoaded", () => {
  // Mobile menu: the button toggles the "open" class and keeps
  // aria-expanded in sync so screen readers know the menu state.
  const toggle = document.querySelector(".nav-toggle");
  const links = document.getElementById("nav-links");
  if (toggle && links) {
    toggle.addEventListener("click", () => {
      const open = toggle.getAttribute("aria-expanded") === "true";
      toggle.setAttribute("aria-expanded", String(!open));
      links.classList.toggle("open", !open);
    });
    // Close the menu with the Escape key
    document.addEventListener("keydown", e => {
      if (e.key === "Escape" && links.classList.contains("open")) {
        links.classList.remove("open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  const year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();
});

// Toast: a short message that slides up from the bottom, then hides.
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    toast.setAttribute("role", "status"); // announced by screen readers
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2600);
}
