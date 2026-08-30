const header = document.querySelector("[data-header]");
const menuToggle = document.querySelector("[data-menu-toggle]");
const menu = document.querySelector("[data-menu]");

const syncHeader = () => {
  header?.classList.toggle("scrolled", window.scrollY > 24);
};

syncHeader();
window.addEventListener("scroll", syncHeader, { passive: true });

const setMenu = (open) => {
  menuToggle?.setAttribute("aria-expanded", String(open));
  menuToggle?.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
  menu?.classList.toggle("open", open);
  document.body.classList.toggle("menu-open", open);
};

menuToggle?.addEventListener("click", () => {
  setMenu(menuToggle.getAttribute("aria-expanded") !== "true");
});

menu?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => setMenu(false));
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") setMenu(false);
});

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealItems = document.querySelectorAll("[data-reveal]");

if (reduceMotion || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("revealed"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("revealed");
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.11, rootMargin: "0px 0px -30px" },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}

const propertySelect = document.querySelector("[data-property-select]");
const prioritySelect = document.querySelector("[data-priority-select]");
const resultName = document.querySelector("[data-finder-result]");
const resultLink = document.querySelector("[data-finder-link]");

const recommendations = {
  remote: "OUTPOST",
  commercial: "GUARD+",
  "villa:security": "GUARD",
  "villa:access": "GUARD+",
  "villa:automation": "HOMEBASE",
};

const updateRecommendation = () => {
  if (!propertySelect || !prioritySelect || !resultName || !resultLink) return;

  const property = propertySelect.value;
  const priority = prioritySelect.value;
  const recommendation = recommendations[property] || recommendations[`${property}:${priority}`] || "GUARD";
  const subjectName = recommendation === "GUARD+" ? "GUARD%2B" : recommendation;

  resultName.textContent = recommendation;
  resultLink.href = `mailto:sales@homepilot.ae?subject=HomePilot%20${subjectName}%20survey`;
  document.querySelectorAll("[data-package]").forEach((card) => {
    const normalized = card.dataset.package?.replace("-plus", "+").toUpperCase();
    card.classList.toggle("recommended", normalized === recommendation);
  });
};

propertySelect?.addEventListener("change", updateRecommendation);
prioritySelect?.addEventListener("change", updateRecommendation);
updateRecommendation();

document.querySelectorAll("[data-accordion] details").forEach((details) => {
  details.addEventListener("toggle", () => {
    if (!details.open) return;
    document.querySelectorAll("[data-accordion] details").forEach((other) => {
      if (other !== details) other.open = false;
    });
  });
});

document.querySelectorAll("[data-year]").forEach((element) => {
  element.textContent = new Date().getFullYear();
});
