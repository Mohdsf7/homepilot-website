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

const navSectionLinks = [...document.querySelectorAll('.site-nav a[href^="#"]')];
const navSections = navSectionLinks
  .map((link) => ({ link, section: document.querySelector(link.getAttribute("href")) }))
  .filter(({ section }) => section);

if ("IntersectionObserver" in window) {
  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (!visible) return;

      navSections.forEach(({ link, section }) => {
        const active = section === visible.target;
        link.classList.toggle("active", active);
        if (active) link.setAttribute("aria-current", "true");
        else link.removeAttribute("aria-current");
      });
    },
    { threshold: [0.01, 0.05], rootMargin: "-16% 0px -58%" },
  );
  navSections.forEach(({ section }) => sectionObserver.observe(section));
}

const systemVisual = document.querySelector("[data-system-visual]");
const connectivityToggle = document.querySelector("[data-connectivity-toggle]");
const systemLabel = document.querySelector("[data-system-label]");
const coreState = document.querySelector("[data-core-state]");
const networkState = document.querySelector("[data-network-state]");
const alertTitle = document.querySelector("[data-alert-title]");
const alertCopy = document.querySelector("[data-alert-copy]");
const alertTime = document.querySelector("[data-alert-time]");
const sceneButtons = [...document.querySelectorAll("[data-scene]")];
const deviceButtons = [...document.querySelectorAll("[data-device]")];

const deviceCopy = {
  light: { on: "On", off: "Off", label: "Ceiling lights" },
  plug: { on: "On", off: "Off", label: "Smart plug / bedside lamp" },
  curtains: { on: "Open", off: "Closed", label: "Curtains" },
  ac: { on: "24°C", off: "Off", label: "Bedroom AC" },
  lock: { on: "Locked", off: "Unlocked", label: "Bedroom door" },
};

const sceneStates = {
  home: { light: true, plug: true, curtains: true, ac: true, lock: true, title: "Home mode active", copy: "Ceiling lights and lamp on, curtains open, AC at 24°C" },
  away: { light: false, plug: false, curtains: false, ac: false, lock: true, title: "Away mode active", copy: "Lights, smart plug, and AC off; curtains closed" },
  night: { light: false, plug: true, curtains: false, ac: true, lock: true, title: "Good-night mode active", copy: "Ceiling lights off, bedside lamp on, curtains closed, AC at 24°C" },
};

const setDevice = (name, active) => {
  const button = document.querySelector(`[data-device="${name}"]`);
  const state = document.querySelector(`[data-device-state="${name}"]`);
  if (!button || !state || !deviceCopy[name]) return;

  button.setAttribute("aria-pressed", String(active));
  button.classList.toggle("is-off", !active);
  systemVisual?.classList.toggle(`device-${name}-off`, !active);
  state.textContent = active ? deviceCopy[name].on : deviceCopy[name].off;
};

const announce = (title, copy) => {
  if (alertTitle) alertTitle.textContent = title;
  if (alertCopy) alertCopy.textContent = copy;
  if (alertTime) alertTime.textContent = "Now";
};

const selectScene = (sceneName) => {
  const scene = sceneStates[sceneName];
  if (!scene) return;

  Object.entries(scene).forEach(([name, active]) => {
    if (name in deviceCopy) setDevice(name, active);
  });
  sceneButtons.forEach((button) => {
    const selected = button.dataset.scene === sceneName;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-pressed", String(selected));
  });
  announce(scene.title, scene.copy);
};

const setInternetOffline = (offline) => {
  systemVisual?.classList.toggle("internet-offline", offline);
  connectivityToggle?.setAttribute("aria-pressed", String(offline));
  if (connectivityToggle) connectivityToggle.textContent = offline ? "Reconnect internet" : "Disconnect internet";
  if (systemLabel) systemLabel.textContent = offline ? "Internet offline" : "Internet online";
  if (coreState) coreState.textContent = offline ? "Local controls active" : "Automations ready";
  if (networkState) {
    networkState.textContent = offline ? "Offline" : "Online";
    networkState.classList.toggle("status-warn", offline);
  }
  announce(
    offline ? "Local controls still work" : "Internet restored",
    offline
      ? "Zigbee and Z-Wave devices still respond; cloud features may pause"
      : "Local and remote services are available",
  );
};

connectivityToggle?.addEventListener("click", () => {
  setInternetOffline(connectivityToggle.getAttribute("aria-pressed") !== "true");
});

sceneButtons.forEach((button) => {
  button.addEventListener("click", () => selectScene(button.dataset.scene));
});

deviceButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const name = button.dataset.device;
    const active = button.getAttribute("aria-pressed") !== "true";
    setDevice(name, active);
    sceneButtons.forEach((sceneButton) => {
      sceneButton.classList.remove("active");
      sceneButton.setAttribute("aria-pressed", "false");
    });
    announce(
      `${deviceCopy[name].label} ${active ? deviceCopy[name].on.toLowerCase() : deviceCopy[name].off.toLowerCase()}`,
      connectivityToggle?.getAttribute("aria-pressed") === "true"
        ? "Command completed locally while the internet is offline"
        : "Command completed through the local hub",
    );
  });
});

const propertySelect = document.querySelector("[data-property-select]");
const prioritySelect = document.querySelector("[data-priority-select]");
const resultName = document.querySelector("[data-finder-result]");
const resultLink = document.querySelector("[data-finder-link]");

const recommendations = {
  apartment: "HOMEBASE",
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
