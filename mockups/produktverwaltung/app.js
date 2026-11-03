// Click dummy for product management. Renders the app shell and the page
// named in <body data-page>. Changes are kept in sessionStorage only, so the
// dummy feels real during a walkthrough and resets with a new browser tab.

// ---------------------------------------------------------------------------
// Data
// ---------------------------------------------------------------------------

const STORAGE_KEY = "pm-dummy-products-v2";

function loadProducts() {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (raw) {
      return JSON.parse(raw);
    }
  } catch {
    // Storage unavailable (private mode, blocked): fall back to the seed.
  }
  return structuredClone(window.PM_SEED);
}

function saveProducts(list) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // The dummy still works for this page view without storage.
  }
}

function resetProducts() {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Nothing stored, nothing to reset.
  }
}

let products = loadProducts();

const findProduct = (id) => products.find((p) => p.id === id);

const FIELD_TYPES = {
  text: { label: "Text", icon: "type" },
  integer: { label: "Ganzzahl", icon: "hash" },
  date: { label: "Datum", icon: "calendar" },
};

const ID_MAX = 20;
const DESCRIPTION_MAX = 1000;

// ---------------------------------------------------------------------------
// Formatting
// ---------------------------------------------------------------------------

const currencyFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});
const decimalFormat = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const formatPrice = (value) => currencyFormat.format(value);

function parsePrice(text) {
  const normalized = text.trim().replace(/\s|€/g, "").replace(/\./g, "");
  if (!/^\d+(,\d{1,2})?$/.test(normalized)) {
    return null;
  }
  return Number(normalized.replace(",", "."));
}

const plural = (count, one, many) => `${count} ${count === 1 ? one : many}`;

function esc(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// ---------------------------------------------------------------------------
// Icons (paths from lucide, ISC license)
// ---------------------------------------------------------------------------

const ICONS = {
  search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  pencil:
    '<path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/>',
  trash:
    '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><path d="M10 11v6"/><path d="M14 11v6"/>',
  external:
    '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
  menu: '<path d="M4 6h16"/><path d="M4 12h16"/><path d="M4 18h16"/>',
  x: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  chevronRight: '<path d="m9 18 6-6-6-6"/>',
  alert:
    '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  power: '<path d="M12 2v10"/><path d="M18.4 6.6a9 9 0 1 1-12.77.04"/>',
  arrowUp: '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  arrowDown: '<path d="M12 5v14"/><path d="m19 12-7 7-7-7"/>',
  dashboard:
    '<rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/>',
  users:
    '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  box: '<path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
  key: '<path d="M2.586 17.414A2 2 0 0 0 2 18.828V21a1 1 0 0 0 1 1h3a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h1a1 1 0 0 0 1-1v-1a1 1 0 0 1 1-1h.172a2 2 0 0 0 1.414-.586l.814-.814a6.5 6.5 0 1 0-4-4z"/><circle cx="16.5" cy="7.5" r=".5" fill="currentColor"/>',
  type: '<path d="M4 7V4h16v3"/><path d="M9 20h6"/><path d="M12 4v16"/>',
  hash: '<path d="M4 9h16"/><path d="M4 15h16"/><path d="M10 3 8 21"/><path d="m16 3-2 18"/>',
  calendar:
    '<path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/>',
};

function icon(name, size = 16, extra = "") {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" class="shrink-0 ${extra}">${ICONS[name]}</svg>`;
}

// ---------------------------------------------------------------------------
// Class recipes (starfinanz-ui references/components.md)
// ---------------------------------------------------------------------------

const BTN =
  "inline-flex items-center justify-center gap-2 rounded-control px-4 h-10 text-sm font-medium tracking-wide whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50";
const BTN_VARIANT = {
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-strong",
  secondary: "border border-line bg-surface text-primary hover:bg-line-subtle",
  ghost: "text-primary hover:bg-primary-subtle",
  danger: "border border-danger bg-surface text-danger hover:bg-danger-subtle",
  dangerSolid: "bg-danger text-white hover:opacity-90",
};
const BTN_COMPACT = "h-8 px-3";
const ICON_BTN =
  "inline-flex size-10 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-line-subtle hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

const btn = (variant, extra = "") => `${BTN} ${BTN_VARIANT[variant]} ${extra}`;

const INPUT =
  "w-full rounded-control border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-invalid:border-danger aria-invalid:ring-danger/30";
const TEXT_INPUT = `${INPUT} h-10`;

const CARD = "rounded-control border border-line-subtle bg-surface shadow-card";
const TH =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted";
const TH_RIGHT =
  "px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted";
const LINK =
  "text-primary underline underline-offset-2 hover:text-primary-hover";
const TAG = "rounded-full bg-line-subtle px-2.5 py-0.5 text-xs text-ink-muted";

const SAFE_X =
  "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6";

function badge(available) {
  return available
    ? '<span class="inline-flex items-center gap-1.5 rounded-full bg-success-subtle px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-success"><span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>Verfügbar</span>'
    : '<span class="inline-flex items-center gap-1.5 rounded-full bg-line-subtle px-2.5 py-0.5 text-xs font-medium whitespace-nowrap text-ink-muted"><span class="size-1.5 rounded-full bg-current" aria-hidden="true"></span>Nicht verfügbar</span>';
}

const tags = (list) =>
  list.map((t) => `<li class="${TAG}">${esc(t)}</li>`).join("");

// ---------------------------------------------------------------------------
// Shell
// ---------------------------------------------------------------------------

const NAV = [
  { label: "Übersicht", icon: "dashboard", href: null },
  { label: "Kunden", icon: "users", href: null },
  { label: "Produkte", icon: "box", href: "index.html" },
  { label: "Lizenzen", icon: "key", href: null },
];

function navItems() {
  return NAV.map((item) => {
    const active = item.href !== null;
    return `<li><a href="${item.href ?? "#"}" ${active ? 'aria-current="page"' : "data-not-built"}
      class="relative flex items-center gap-3 px-6 py-2.5 text-sm tracking-wide text-ink-muted hover:bg-line-subtle hover:text-ink aria-[current=page]:bg-primary-subtle aria-[current=page]:font-medium aria-[current=page]:text-primary-strong aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-1 aria-[current=page]:before:left-0 aria-[current=page]:before:w-1 aria-[current=page]:before:bg-primary">
      ${icon(item.icon, 20)}${item.label}</a></li>`;
  }).join("");
}

function renderShell() {
  document.body.insertAdjacentHTML(
    "afterbegin",
    `<a href="#main" class="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:shadow-overlay">Zum Inhalt springen</a>
    <div class="flex items-center gap-2 border-b border-info/20 bg-info-subtle py-1.5 text-xs text-info lg:px-6 ${SAFE_X}">
      ${icon("info", 14)}
      <p class="min-w-0 flex-1 truncate">Klick-Dummy mit Beispieldaten.<span class="hidden sm:inline"> Änderungen bleiben nur in diesem Browser-Tab erhalten.</span></p>
      <button type="button" id="reset-data" class="shrink-0 font-medium underline underline-offset-2 hover:text-ink">Zurücksetzen</button>
    </div>
    <header class="flex h-14 items-center gap-3 border-b border-line-subtle bg-surface lg:h-16 lg:gap-6 lg:px-6 ${SAFE_X}">
      <button type="button" id="open-nav" class="${ICON_BTN} -ml-2 lg:hidden" aria-label="Navigation öffnen" aria-haspopup="dialog">${icon("menu", 20)}</button>
      <a href="index.html" class="flex items-center gap-3">
        <span aria-hidden="true" class="h-7 w-0.5 bg-brand-red lg:h-8"></span>
        <span class="text-lg text-ink-muted lg:text-xl">Lizenz<span class="font-semibold text-ink">verwaltung</span></span>
      </a>
      <div class="ml-auto flex items-center gap-3 text-sm">
        <span class="hidden text-ink-muted sm:inline">M. Berger</span>
        <span class="grid size-8 place-items-center rounded-full bg-line-subtle text-xs font-semibold text-ink-muted" aria-hidden="true">MB</span>
      </div>
    </header>
    <div class="flex flex-1">
      <nav aria-label="Hauptnavigation" class="hidden w-60 shrink-0 border-r border-line-subtle bg-surface py-4 lg:block">
        <ul>${navItems()}</ul>
      </nav>
      <main id="main" tabindex="-1" class="min-w-0 flex-1 py-5 focus:outline-none lg:px-8 lg:py-8 ${SAFE_X}">
        <div id="content" class="mx-auto max-w-screen-2xl"></div>
      </main>
    </div>
    <dialog id="nav-drawer" aria-label="Navigation" class="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-surface shadow-overlay backdrop:bg-ink/40">
      <div class="flex h-14 items-center justify-between border-b border-line-subtle pr-2 pl-[max(1.5rem,env(safe-area-inset-left))]">
        <span class="text-lg text-ink-muted">Lizenz<span class="font-semibold text-ink">verwaltung</span></span>
        <button type="button" id="close-nav" class="${ICON_BTN}" aria-label="Navigation schließen">${icon("x", 20)}</button>
      </div>
      <nav aria-label="Hauptnavigation" class="py-4 pl-[env(safe-area-inset-left)]"><ul>${navItems()}</ul></nav>
    </dialog>
    <div id="toast-region" role="status" aria-live="polite" class="pointer-events-none fixed inset-x-4 bottom-4 z-40 flex flex-col items-end gap-2 sm:left-auto"></div>`,
  );

  const drawer = document.getElementById("nav-drawer");
  document
    .getElementById("open-nav")
    .addEventListener("click", () => drawer.showModal());
  document
    .getElementById("close-nav")
    .addEventListener("click", () => drawer.close());
  drawer.addEventListener("click", (event) => {
    if (event.target === drawer) {
      drawer.close();
    }
  });
  document.getElementById("reset-data").addEventListener("click", () => {
    resetProducts();
    location.href = "index.html?meldung=zurueckgesetzt";
  });
  document.addEventListener("click", (event) => {
    const link = event.target.closest("[data-not-built]");
    if (link) {
      event.preventDefault();
      drawer.close();
      toast(
        `Der Bereich „${link.textContent.trim()}“ ist nicht Teil dieses Klick-Dummys.`,
      );
    }
  });
}

// ---------------------------------------------------------------------------
// Shared building blocks
// ---------------------------------------------------------------------------

function pageHeader({ crumbs, title, badgeHtml = "", description, actions }) {
  const crumbHtml = crumbs
    .map((c) =>
      c.href
        ? `<a href="${c.href}" class="hover:text-primary">${esc(c.label)}</a>`
        : `<span aria-current="page">${esc(c.label)}</span>`,
    )
    .join(' <span aria-hidden="true">/</span> ');
  return `<div class="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 lg:mb-6">
    <div class="flex min-w-0 flex-col gap-2">
      ${crumbs.length ? `<nav aria-label="Brotkrumen" class="text-sm text-ink-muted">${crumbHtml}</nav>` : ""}
      <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
        <h1 class="font-serif text-page-title break-words text-primary-strong">${esc(title)}</h1>
        ${badgeHtml}
      </div>
      ${description ? `<p class="max-w-prose text-ink-muted">${description}</p>` : ""}
    </div>
    ${actions ? `<div class="flex w-full flex-wrap gap-3 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">${actions}</div>` : ""}
  </div>`;
}

function toast(message, undo) {
  const region = document.getElementById("toast-region");
  const item = document.createElement("div");
  item.className =
    "pointer-events-auto flex max-w-md items-center gap-4 rounded-control bg-ink px-4 py-3 text-sm text-white shadow-overlay motion-safe:animate-appear";
  item.innerHTML = `<span>${esc(message)}</span>${undo ? '<button type="button" class="font-medium underline underline-offset-2">Rückgängig</button>' : ""}`;
  if (undo) {
    item.querySelector("button").addEventListener("click", () => {
      item.remove();
      undo();
    });
  }
  region.append(item);
  setTimeout(() => item.remove(), 5000);
}

function showFlash() {
  const params = new URLSearchParams(location.search);
  const kind = params.get("meldung");
  if (!kind) {
    return;
  }
  const name = params.get("name") ?? "";
  const messages = {
    gespeichert: `Änderungen an ${name} gespeichert.`,
    angelegt: `Produkt ${name} angelegt.`,
    geloescht: `Produkt ${name} gelöscht.`,
    zurueckgesetzt: "Die Beispieldaten wurden zurückgesetzt.",
  };
  if (messages[kind]) {
    toast(messages[kind]);
  }
  params.delete("meldung");
  params.delete("name");
  const query = params.toString();
  history.replaceState(null, "", query ? `?${query}` : location.pathname);
}

function confirmDialog({ title, body, confirmLabel, onConfirm }) {
  const dialog = document.createElement("dialog");
  dialog.className =
    "m-auto w-[calc(100%-2rem)] max-w-md rounded-control bg-surface p-6 shadow-overlay backdrop:bg-ink/40";
  dialog.setAttribute("aria-labelledby", "confirm-title");
  dialog.innerHTML = `<h2 id="confirm-title" class="text-lg font-semibold text-ink">${esc(title)}</h2>
    <p class="mt-2 text-sm text-ink-muted">${body}</p>
    <div class="mt-6 flex flex-wrap justify-end gap-3">
      <button type="button" autofocus data-cancel class="${btn("secondary")}">Abbrechen</button>
      <button type="button" data-confirm class="${btn("dangerSolid")}">${esc(confirmLabel)}</button>
    </div>`;
  document.body.append(dialog);
  dialog.addEventListener("close", () => dialog.remove());
  dialog
    .querySelector("[data-cancel]")
    .addEventListener("click", () => dialog.close());
  dialog.querySelector("[data-confirm]").addEventListener("click", () => {
    dialog.close();
    onConfirm();
  });
  dialog.showModal();
}

// The dummy has no backend; ?zustand=laden, ?zustand=fehler or ?zustand=leer
// shows the loading, load-error and empty states a real data view needs.
const SIMULATED = new URLSearchParams(location.search).get("zustand");

function skeleton(rows) {
  return `<div class="flex flex-col divide-y divide-line-subtle" aria-busy="true" aria-label="Wird geladen">${Array.from(
    { length: rows },
    () =>
      '<div class="flex items-center gap-6 px-4 py-4"><div class="h-4 w-28 rounded bg-line-subtle motion-safe:animate-pulse"></div><div class="h-4 flex-1 rounded bg-line-subtle motion-safe:animate-pulse"></div><div class="hidden h-4 w-20 rounded bg-line-subtle motion-safe:animate-pulse md:block"></div></div>',
  ).join("")}</div>`;
}

function loadError(what) {
  const retry = new URLSearchParams(location.search);
  retry.delete("zustand");
  const query = retry.toString();
  return `<div role="alert" class="flex gap-3 rounded-control border border-danger/30 bg-danger-subtle p-4 text-sm text-danger">
    ${icon("alert", 20)}
    <div><p class="font-semibold">${what} konnten nicht geladen werden</p>
    <p>Bitte versuchen Sie es erneut. Wenn der Fehler bleibt, wenden Sie sich an den IT-Support.</p>
    <a href="${location.pathname.split("/").pop()}${query ? `?${query}` : ""}" class="mt-3 ${btn("secondary", BTN_COMPACT)}">Erneut versuchen</a></div>
  </div>`;
}

function notFound(what) {
  return `<div role="alert" class="flex max-w-2xl gap-3 rounded-control border border-danger/30 bg-danger-subtle p-4 text-sm text-danger">
    ${icon("alert", 20)}
    <div><p class="font-semibold">${what} wurde nicht gefunden</p>
    <p>Vielleicht wurde es gelöscht. <a href="index.html" class="font-medium underline underline-offset-2">Zur Produktliste</a></p></div>
  </div>`;
}

// Field with label above, help below the label, error below the field.
function field({ id, label, required = false, help = "", control, counter }) {
  return `<div class="flex flex-col gap-1.5">
    <div class="flex items-baseline justify-between gap-4">
      <label for="${id}" class="text-sm font-medium text-ink">${label}${required ? ' <span aria-hidden="true" class="text-danger">*</span>' : ""}</label>
      ${counter ? `<span id="${id}-counter" class="text-xs text-ink-muted tabular-nums">${counter}</span>` : ""}
    </div>
    ${help ? `<p id="${id}-help" class="text-sm text-ink-muted">${help}</p>` : ""}
    ${control}
    <p id="${id}-error" class="hidden items-center gap-1.5 text-sm text-danger" data-error-for="${id}">${icon("alert")}<span></span></p>
  </div>`;
}

function setError(input, message) {
  const error = document.getElementById(`${input.id}-error`);
  const describedBy = (input.getAttribute("aria-describedby") ?? "")
    .split(" ")
    .filter((token) => token && token !== error?.id);
  if (message) {
    input.setAttribute("aria-invalid", "true");
    describedBy.push(error.id);
    error.querySelector("span").textContent = message;
    error.classList.replace("hidden", "flex");
  } else {
    input.removeAttribute("aria-invalid");
    error?.classList.replace("flex", "hidden");
  }
  input.setAttribute("aria-describedby", describedBy.join(" "));
}

function showErrorSummary(form, problems) {
  const summary = form.querySelector("[data-summary]");
  if (!problems.length) {
    summary.innerHTML = "";
    summary.hidden = true;
    return;
  }
  summary.hidden = false;
  summary.innerHTML = `<div class="flex gap-3 rounded-control border border-danger/30 bg-danger-subtle p-4 text-sm text-danger">
    ${icon("alert", 20)}
    <div><p class="font-semibold">Bitte prüfen Sie ${problems.length === 1 ? "eine Angabe" : `${problems.length} Angaben`}</p>
    <ul class="mt-1 list-disc pl-5">${problems.map((p) => `<li><a href="#${p.id}" class="underline underline-offset-2">${esc(p.message)}</a></li>`).join("")}</ul></div>
  </div>`;
  summary.focus({ preventScroll: true });
  summary.scrollIntoView({ block: "start", behavior: "smooth" });
}

function bindCounter(input, max) {
  const counter = document.getElementById(`${input.id}-counter`);
  const update = () => {
    counter.textContent = `${input.value.length} / ${max}`;
  };
  input.addEventListener("input", update);
  update();
}

// ---------------------------------------------------------------------------
// Page: product list
// ---------------------------------------------------------------------------

function renderList(root) {
  root.innerHTML = `${pageHeader({
    crumbs: [],
    title: "Produkte",
    description:
      "Alle Produkte mit ihren freischaltbaren Features, Preisen und Verfügbarkeit.",
    actions: `<a href="produkt-bearbeiten.html" class="${btn("primary")}">${icon("plus")}Produkt anlegen</a>`,
  })}
  <p id="count" class="mb-3 text-sm text-ink-muted"></p>
  <div id="results" class="${CARD} overflow-hidden"></div>`;

  const results = root.querySelector("#results");
  if (SIMULATED === "laden") {
    results.innerHTML = skeleton(5);
    return;
  }
  if (SIMULATED === "fehler") {
    // The alert stands on the canvas, not inside the table card.
    results.className = "";
    results.innerHTML = loadError("Die Produkte");
    return;
  }
  // Reading returns all products; search and filters come later.
  const list = (SIMULATED === "leer" ? [] : [...products]).sort((a, b) =>
    a.id.localeCompare(b.id, "de"),
  );
  root.querySelector("#count").textContent = list.length
    ? plural(list.length, "Produkt", "Produkte")
    : "";
  results.innerHTML = list.length
    ? productTable(list) + productList(list)
    : emptyList();
}

function productTable(list) {
  const rows = list
    .map(
      (p) => `<tr class="hover:bg-surface-muted">
      <td class="px-4 py-3 whitespace-nowrap"><a href="produkt.html?id=${encodeURIComponent(p.id)}" class="font-mono font-medium text-primary hover:underline">${esc(p.id)}</a></td>
      <td class="w-full max-w-0 px-4 py-3"><p class="truncate text-ink" title="${esc(p.description)}">${esc(p.description)}</p></td>
      <td class="hidden px-4 py-3 xl:table-cell"><ul class="flex flex-nowrap gap-1.5" aria-label="Tags">${tags(p.tags)}</ul></td>
      <td class="px-4 py-3 text-right">${p.features.length}</td>
      <td class="px-4 py-3 text-right whitespace-nowrap">${formatPrice(p.price)}</td>
      <td class="px-4 py-3">${badge(p.available)}</td>
    </tr>`,
    )
    .join("");
  return `<div class="hidden overflow-x-auto md:block"><table class="w-full text-sm">
    <caption class="sr-only">Produkte</caption>
    <thead class="bg-surface-muted"><tr class="border-b border-line">
      <th scope="col" class="${TH}">ID</th>
      <th scope="col" class="${TH}">Beschreibung</th>
      <th scope="col" class="${TH} hidden xl:table-cell">Tags</th>
      <th scope="col" class="${TH_RIGHT}">Features</th>
      <th scope="col" class="${TH_RIGHT}">Preis</th>
      <th scope="col" class="${TH}">Status</th>
    </tr></thead>
    <tbody class="divide-y divide-line-subtle">${rows}</tbody>
  </table></div>`;
}

// Below md the table becomes a divided list: the stakeholders asked for
// phone layouts, and six columns do not fit 430px without hiding the ID.
function productList(list) {
  const items = list
    .map(
      (
        p,
      ) => `<li><a href="produkt.html?id=${encodeURIComponent(p.id)}" class="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted active:bg-line-subtle">
      <div class="min-w-0 flex-1">
        <div class="flex items-center justify-between gap-3">
          <span class="truncate font-mono font-medium text-primary">${esc(p.id)}</span>
          ${badge(p.available)}
        </div>
        <p class="mt-1 line-clamp-2 text-sm text-ink-muted">${esc(p.description)}</p>
        <p class="mt-1.5 text-sm text-ink tabular-nums">${formatPrice(p.price)} <span class="text-ink-muted">· ${plural(p.features.length, "Feature", "Features")}</span></p>
      </div>
      ${icon("chevronRight", 16, "text-ink-subtle")}
    </a></li>`,
    )
    .join("");
  return `<ul class="divide-y divide-line-subtle md:hidden" aria-label="Produkte">${items}</ul>`;
}

function emptyList() {
  return `<div class="flex flex-col items-center gap-3 px-6 py-16 text-center">
    <p class="text-base font-semibold text-ink">Noch keine Produkte</p>
    <p class="max-w-sm text-sm text-ink-muted">Legen Sie das erste Produkt mit seinen freischaltbaren Features an.</p>
  </div>`;
}

// ---------------------------------------------------------------------------
// Page: product detail
// ---------------------------------------------------------------------------

function renderDetail(root) {
  const id = new URLSearchParams(location.search).get("id");
  const product = findProduct(id);
  if (SIMULATED === "laden" || SIMULATED === "fehler") {
    root.innerHTML =
      pageHeader({
        crumbs: [
          { label: "Produkte", href: "index.html" },
          { label: id ?? "" },
        ],
        title: id ?? "Produkt",
      }) +
      (SIMULATED === "laden"
        ? `<div class="${CARD} overflow-hidden">${skeleton(4)}</div>`
        : loadError("Die Produktdaten"));
    return;
  }
  if (!product) {
    root.innerHTML =
      pageHeader({
        crumbs: [{ label: "Produkte", href: "index.html" }],
        title: "Produkt",
      }) + notFound("Das Produkt");
    return;
  }

  const enc = encodeURIComponent(product.id);
  const facts = [
    ["Preis", formatPrice(product.price)],
    ["Aktuell verfügbar", product.available ? "Ja" : "Nein"],
  ];

  root.innerHTML = `${pageHeader({
    crumbs: [{ label: "Produkte", href: "index.html" }, { label: product.id }],
    title: product.id,
    badgeHtml: badge(product.available),
    description: esc(product.description),
    actions: `<button type="button" id="toggle-available" class="${btn("secondary")}">${icon("power")}${product.available ? "Deaktivieren" : "Aktivieren"}</button>
      <a href="produkt-bearbeiten.html?id=${enc}" class="${btn("primary")}">${icon("pencil")}Bearbeiten</a>`,
  })}
  <div class="flex flex-col gap-8">
    <section aria-labelledby="facts-title" class="${CARD} p-5 sm:p-6">
      <h2 id="facts-title" class="sr-only">Stammdaten</h2>
      <dl class="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4 xl:grid-cols-6">
        ${facts.map(([label, value]) => `<div><dt class="text-sm text-ink-muted">${label}</dt><dd class="mt-1 text-ink tabular-nums">${value}</dd></div>`).join("")}
        <div class="col-span-2">
          <dt class="text-sm text-ink-muted">Tags</dt>
          <dd class="mt-1.5">${product.tags.length ? `<ul class="flex flex-wrap gap-1.5">${tags(product.tags)}</ul>` : '<span class="text-ink-muted">Keine Tags</span>'}</dd>
        </div>
        <div class="col-span-2">
          <dt class="text-sm text-ink-muted">Externe Links</dt>
          <dd class="mt-1">${
            product.links.length
              ? `<ul class="flex flex-col gap-1">${product.links.map((url) => `<li class="min-w-0"><a href="${esc(url)}" target="_blank" rel="noopener noreferrer" class="${LINK} inline-flex max-w-full items-center gap-1.5 text-sm"><span class="truncate">${esc(url.replace("https://", ""))}</span>${icon("external", 14)}<span class="sr-only">(öffnet in neuem Tab)</span></a></li>`).join("")}</ul>`
              : '<span class="text-ink-muted">Keine Links hinterlegt</span>'
          }</dd>
        </div>
      </dl>
    </section>

    <section aria-labelledby="features-title">
      <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div class="flex items-baseline gap-3">
          <h2 id="features-title" class="text-xl font-semibold text-ink">Features</h2>
          <span class="text-sm text-ink-muted">${product.features.length}</span>
        </div>
        <a href="produkt-bearbeiten.html?id=${enc}&feature=neu" class="${btn("secondary", BTN_COMPACT)}">${icon("plus")}Feature anlegen</a>
      </div>
      <p class="mb-4 max-w-prose text-sm text-ink-muted">Funktionen, die Kund:innen mit einem Lizenzschlüssel freischalten. Zusatzinformationen werden bei jeder Freischaltung abgefragt.</p>
      <div class="${CARD} overflow-hidden">${product.features.length ? featureTable(product) + featureList(product) : emptyFeatures()}</div>
    </section>

    <section aria-labelledby="delete-title" class="${CARD} flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
      <div>
        <h2 id="delete-title" class="text-base font-semibold text-ink">Produkt löschen</h2>
        <p id="delete-help" class="mt-1 max-w-prose text-sm text-ink-muted">${
          product.hasLicenses
            ? "Für dieses Produkt gibt es Lizenzen, deshalb kann es nicht gelöscht werden. Wenn es nicht mehr verkauft wird, deaktivieren Sie es."
            : `Löschen ist nur möglich, solange es keine Lizenzen für das Produkt gibt. Das Produkt und ${plural(product.features.length, "Feature", "Features")} werden endgültig entfernt.`
        }</p>
      </div>
      <button type="button" id="delete-product" class="${btn("danger")}" aria-describedby="delete-help" ${product.hasLicenses ? "disabled" : ""}>${icon("trash")}Produkt löschen</button>
    </section>
  </div>`;

  root.querySelector("#toggle-available").addEventListener("click", () => {
    const before = product.available;
    product.available = !before;
    saveProducts(products);
    renderDetail(root);
    root.querySelector("#toggle-available").focus();
    toast(
      product.available
        ? `${product.id} ist wieder verfügbar.`
        : `${product.id} ist jetzt nicht verfügbar. Bestehende Lizenzen bleiben gültig.`,
      () => {
        product.available = before;
        saveProducts(products);
        renderDetail(root);
      },
    );
  });

  root.querySelector("#delete-product").addEventListener("click", () =>
    confirmDialog({
      title: `${product.id} löschen?`,
      body: `Das Produkt <span class="font-mono text-ink">${esc(product.id)}</span> und seine ${plural(product.features.length, "Feature", "Features")} werden endgültig entfernt. Das lässt sich nicht rückgängig machen.`,
      confirmLabel: "Produkt löschen",
      onConfirm: () => {
        products = products.filter((p) => p !== product);
        saveProducts(products);
        location.href = `index.html?meldung=geloescht&name=${enc}`;
      },
    }),
  );
}

function fieldSummary(fields) {
  if (!fields.length) {
    return '<span class="text-ink-muted">Keine</span>';
  }
  return `<ul class="flex flex-col gap-1">${fields
    .map(
      (f) =>
        `<li class="flex items-center gap-2 whitespace-nowrap">${icon(FIELD_TYPES[f.type].icon, 14, "text-ink-subtle")}<span class="text-ink">${esc(f.name)}</span><span class="text-ink-muted">· ${FIELD_TYPES[f.type].label}</span></li>`,
    )
    .join("")}</ul>`;
}

function featureHref(product, feature) {
  return `produkt-bearbeiten.html?id=${encodeURIComponent(product.id)}&feature=${encodeURIComponent(feature.id)}`;
}

function featureTable(product) {
  const rows = product.features
    .map(
      (f) => `<tr class="align-top hover:bg-surface-muted">
      <td class="px-4 py-3 whitespace-nowrap"><a href="${featureHref(product, f)}" class="font-mono font-medium text-primary hover:underline">${esc(f.id)}</a></td>
      <td class="w-full max-w-0 px-4 py-3"><p class="line-clamp-2 text-ink" title="${esc(f.description)}">${esc(f.description)}</p></td>
      <td class="px-4 py-3">${fieldSummary(f.fields)}</td>
      <td class="px-4 py-1.5 text-right"><a href="${featureHref(product, f)}" class="${btn("ghost", BTN_COMPACT)}" aria-label="${esc(f.id)} bearbeiten">${icon("pencil")}Bearbeiten</a></td>
    </tr>`,
    )
    .join("");
  return `<div class="hidden overflow-x-auto md:block"><table class="w-full text-sm">
    <caption class="sr-only">Features von ${esc(product.id)}</caption>
    <thead class="bg-surface-muted"><tr class="border-b border-line">
      <th scope="col" class="${TH}">Feature-ID</th>
      <th scope="col" class="${TH}">Beschreibung</th>
      <th scope="col" class="${TH}">Zusatzinformationen</th>
      <th scope="col" class="px-4 py-3"><span class="sr-only">Aktionen</span></th>
    </tr></thead>
    <tbody class="divide-y divide-line-subtle">${rows}</tbody>
  </table></div>`;
}

function featureList(product) {
  const items = product.features
    .map(
      (
        f,
      ) => `<li><a href="${featureHref(product, f)}" class="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted active:bg-line-subtle">
      <div class="min-w-0 flex-1">
        <span class="font-mono font-medium text-primary">${esc(f.id)}</span>
        <p class="mt-1 text-sm text-ink">${esc(f.description)}</p>
        <div class="mt-2 text-sm">${fieldSummary(f.fields)}</div>
      </div>
      ${icon("chevronRight", 16, "text-ink-subtle")}
    </a></li>`,
    )
    .join("");
  return `<ul class="divide-y divide-line-subtle md:hidden" aria-label="Features">${items}</ul>`;
}

function emptyFeatures() {
  return `<div class="flex flex-col items-center gap-2 px-6 py-12 text-center">
    <p class="text-base font-semibold text-ink">Noch keine Features</p>
    <p class="max-w-sm text-sm text-ink-muted">Legen Sie die Funktionen an, die Kund:innen für dieses Produkt freischalten können.</p>
  </div>`;
}

// ---------------------------------------------------------------------------
// Feature editor inside the product form. Features are only saved together
// with their product, so they are edited here and nowhere else.
// ---------------------------------------------------------------------------

const fieldCount = (f) =>
  f.fields.length
    ? plural(f.fields.length, "Zusatzinformation", "Zusatzinformationen")
    : "Keine Zusatzinformationen";

function featureFieldRow(f, i) {
  const k = f.key;
  const entry = f.fields[i];
  const base = `feature-${k}-field-${i}`;
  return `<li class="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 py-4 first:pt-0 md:grid-cols-[minmax(0,1fr)_9rem_7.5rem] md:py-0 ${entry.fresh ? "motion-safe:animate-appear" : ""}">
    <div class="col-span-2 flex flex-col gap-1.5 md:col-span-1">
      <label for="${base}-name" class="text-sm font-medium text-ink md:sr-only">Feldname<span class="sr-only"> ${i + 1}</span></label>
      <input id="${base}-name" data-field-name="${k}:${i}" value="${esc(entry.name)}" placeholder="zum Beispiel Anzahl Benutzer:innen" autocomplete="off" class="${TEXT_INPUT}">
      <p id="${base}-name-error" class="hidden items-center gap-1.5 text-sm text-danger">${icon("alert")}<span></span></p>
    </div>
    <div class="flex flex-col gap-1.5">
      <label for="${base}-type" class="text-sm font-medium text-ink md:sr-only">Datentyp<span class="sr-only"> von Feld ${i + 1}</span></label>
      <select id="${base}-type" data-field-type="${k}:${i}" class="${TEXT_INPUT}">
        ${Object.entries(FIELD_TYPES)
          .map(
            ([value, t]) =>
              `<option value="${value}" ${value === entry.type ? "selected" : ""}>${t.label}</option>`,
          )
          .join("")}
      </select>
    </div>
    <div class="flex self-end md:self-start">
      <button type="button" data-move="${k}:${i}" data-dir="-1" class="${ICON_BTN}" aria-label="Feld ${i + 1} nach oben" title="Nach oben" ${i === 0 ? "disabled" : ""}>${icon("arrowUp")}</button>
      <button type="button" data-move="${k}:${i}" data-dir="1" class="${ICON_BTN}" aria-label="Feld ${i + 1} nach unten" title="Nach unten" ${i === f.fields.length - 1 ? "disabled" : ""}>${icon("arrowDown")}</button>
      <button type="button" data-remove-field="${k}:${i}" class="${ICON_BTN}" aria-label="Feld ${i + 1} entfernen" title="Entfernen">${icon("trash")}</button>
    </div>
  </li>`;
}

function featureItem(f, open) {
  const k = f.key;
  const name = f.id.trim().toUpperCase();
  return `<li id="feature-${k}" class="scroll-mt-6">
    <details data-feature="${k}" ${open ? "open" : ""} class="group">
      <summary class="-mx-2 flex cursor-pointer list-none items-center gap-3 rounded-control px-2 py-3 hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
        ${icon("chevronRight", 16, "text-ink-subtle transition-transform group-open:rotate-90")}
        <span data-feature-label class="min-w-0 truncate font-mono font-medium ${name ? "text-ink" : "text-ink-subtle"}">${name ? esc(name) : "Neues Feature"}</span>
        <span data-feature-meta class="ml-auto shrink-0 text-sm text-ink-muted">${fieldCount(f)}</span>
      </summary>
      <div class="flex flex-col gap-5 pt-2 pb-6 sm:pl-7">
        ${field({
          id: `feature-${k}-id`,
          label: "Feature-ID",
          required: true,
          help: "Kurzer Code, höchstens 20 Zeichen, eindeutig innerhalb des Produkts.",
          counter: `0 / ${ID_MAX}`,
          control: `<input id="feature-${k}-id" data-feature-id="${k}" maxlength="${ID_MAX}" autocomplete="off" spellcheck="false" value="${esc(f.id)}" aria-describedby="feature-${k}-id-help" class="${TEXT_INPUT} font-mono uppercase">`,
        })}
        ${field({
          id: `feature-${k}-description`,
          label: "Beschreibung",
          required: true,
          counter: `0 / ${DESCRIPTION_MAX}`,
          control: `<textarea id="feature-${k}-description" data-feature-description="${k}" rows="2" maxlength="${DESCRIPTION_MAX}" class="${INPUT} py-2">${esc(f.description)}</textarea>`,
        })}
        <div role="group" aria-labelledby="feature-${k}-fields-title">
          <p id="feature-${k}-fields-title" class="text-sm font-medium text-ink">Zusatzinformationen bei der Freischaltung</p>
          <p class="mt-1 mb-3 text-sm text-ink-muted">Angaben, die bei jeder Freischaltung eingegeben werden müssen, zum Beispiel eine Anzahl oder ein Datum „gültig bis“.</p>
          ${
            f.fields.length
              ? `<div class="mb-2 hidden grid-cols-[minmax(0,1fr)_9rem_7.5rem] gap-3 md:grid" aria-hidden="true">
              <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase">Feldname</span>
              <span class="text-xs font-semibold tracking-wider text-ink-muted uppercase">Datentyp</span>
            </div>
            <ol class="flex flex-col divide-y divide-line-subtle md:gap-3 md:divide-y-0">${f.fields.map((_, i) => featureFieldRow(f, i)).join("")}</ol>`
              : ""
          }
          <button type="button" data-add-field="${k}" class="${btn("ghost", BTN_COMPACT)} mt-2 -ml-3">${icon("plus")}Feld hinzufügen</button>
        </div>
        <div class="rounded-control bg-canvas p-4">
          <p class="text-sm font-medium text-ink">Vorschau der Freischaltung</p>
          <p class="mt-0.5 mb-4 text-sm text-ink-muted">So fragt das Freischaltformular die Zusatzinformationen ab.</p>
          <p id="feature-${k}-preview-summary" class="sr-only"></p>
          <div id="feature-${k}-preview" inert class="flex flex-col gap-4"></div>
        </div>
        <div><button type="button" data-remove-feature="${k}" class="${btn("danger", BTN_COMPACT)}">${icon("trash")}Feature entfernen</button></div>
      </div>
    </details>
  </li>`;
}

function renderFeaturePreview(f) {
  const target = document.getElementById(`feature-${f.key}-preview`);
  document.getElementById(`feature-${f.key}-preview-summary`).textContent = f
    .fields.length
    ? `Vorschau: Die Freischaltung fragt ${plural(f.fields.length, "Angabe", "Angaben")} ab: ${f.fields.map((x) => `${x.name.trim() || "Unbenanntes Feld"} (${FIELD_TYPES[x.type].label})`).join(", ")}.`
    : "Vorschau: Die Freischaltung fragt keine Zusatzinformationen ab.";
  target.innerHTML = f.fields.length
    ? f.fields
        .map((x) => {
          const control = {
            text: `<input type="text" class="${TEXT_INPUT}">`,
            integer: `<input type="number" step="1" class="${TEXT_INPUT} text-right tabular-nums sm:max-w-40">`,
            date: `<input type="date" class="${TEXT_INPUT} sm:max-w-48">`,
          }[x.type];
          return `<div class="flex flex-col gap-1.5">
            <span class="text-sm font-medium ${x.name.trim() ? "text-ink" : "text-ink-subtle"}">${esc(x.name.trim() || "Unbenanntes Feld")} <span aria-hidden="true" class="text-danger">*</span></span>
            <span class="flex items-center gap-1.5 text-xs text-ink-muted">${icon(FIELD_TYPES[x.type].icon, 12)}${FIELD_TYPES[x.type].label}</span>
            ${control}
          </div>`;
        })
        .join("")
    : '<p class="text-sm text-ink-muted">Keine Zusatzinformationen. Das Feature wird ohne weitere Angaben freigeschaltet.</p>';
}

// Wires the feature list of the product form. Returns validate() and
// serialize() for the form's submit handler.
function bindFeatureEditor(form, features, initial) {
  let nextKey = 0;
  const drafts = features.map((f) => ({
    ...structuredClone(f),
    key: nextKey++,
  }));
  const open = new Set();
  const list = form.querySelector("#features");
  const byKey = (k) => drafts.find((f) => f.key === Number(k));
  const split = (value) => value.split(":").map(Number);

  const render = (focusSelector) => {
    list.innerHTML = drafts.length
      ? drafts.map((f) => featureItem(f, open.has(f.key))).join("")
      : '<li class="py-4 text-sm text-ink-muted">Noch keine Features. Fügen Sie die Funktionen hinzu, die Kund:innen für dieses Produkt freischalten können.</li>';
    for (const f of drafts) {
      bindCounter(document.getElementById(`feature-${f.key}-id`), ID_MAX);
      bindCounter(
        document.getElementById(`feature-${f.key}-description`),
        DESCRIPTION_MAX,
      );
      renderFeaturePreview(f);
      for (const x of f.fields) delete x.fresh;
    }
    if (focusSelector) {
      list.querySelector(focusSelector)?.focus();
    }
  };

  const updateSummary = (f) => {
    const item = document.getElementById(`feature-${f.key}`);
    const label = item.querySelector("[data-feature-label]");
    const name = f.id.trim().toUpperCase();
    label.textContent = name || "Neues Feature";
    label.classList.toggle("text-ink", Boolean(name));
    label.classList.toggle("text-ink-subtle", !name);
    item.querySelector("[data-feature-meta]").textContent = fieldCount(f);
  };

  const addFeature = () => {
    const f = { id: "", description: "", fields: [], key: nextKey++ };
    drafts.push(f);
    open.add(f.key);
    render(`#feature-${f.key}-id`);
    document.getElementById(`feature-${f.key}`).scrollIntoView({
      block: "start",
      behavior: "smooth",
    });
  };

  // Toggle does not bubble, so listen in the capture phase.
  list.addEventListener(
    "toggle",
    (event) => {
      const key = Number(event.target.dataset.feature);
      if (event.target.open) open.add(key);
      else open.delete(key);
    },
    true,
  );

  list.addEventListener("input", (event) => {
    const data = event.target.dataset;
    if (data.featureId !== undefined) {
      const f = byKey(data.featureId);
      f.id = event.target.value;
      updateSummary(f);
    } else if (data.featureDescription !== undefined) {
      byKey(data.featureDescription).description = event.target.value;
    } else if (data.fieldName !== undefined) {
      const [k, i] = split(data.fieldName);
      byKey(k).fields[i].name = event.target.value;
      renderFeaturePreview(byKey(k));
    }
  });

  list.addEventListener("change", (event) => {
    if (event.target.dataset.fieldType !== undefined) {
      const [k, i] = split(event.target.dataset.fieldType);
      byKey(k).fields[i].type = event.target.value;
      renderFeaturePreview(byKey(k));
    }
  });

  list.addEventListener("click", (event) => {
    const addField = event.target.closest("[data-add-field]");
    const move = event.target.closest("[data-move]");
    const removeField = event.target.closest("[data-remove-field]");
    const removeFeature = event.target.closest("[data-remove-feature]");
    if (addField) {
      const f = byKey(addField.dataset.addField);
      f.fields.push({ name: "", type: "text", fresh: true });
      render(`#feature-${f.key}-field-${f.fields.length - 1}-name`);
    } else if (move) {
      const [k, from] = split(move.dataset.move);
      const f = byKey(k);
      const to = from + Number(move.dataset.dir);
      [f.fields[from], f.fields[to]] = [f.fields[to], f.fields[from]];
      render();
      // Keep focus on the moved field: same direction if still possible,
      // otherwise the opposite button of the same row.
      const same = list.querySelector(
        `[data-move="${k}:${to}"][data-dir="${move.dataset.dir}"]`,
      );
      const other = list.querySelector(
        `[data-move="${k}:${to}"]:not([data-dir="${move.dataset.dir}"])`,
      );
      (same.disabled ? other : same).focus();
    } else if (removeField) {
      const [k, i] = split(removeField.dataset.removeField);
      byKey(k).fields.splice(i, 1);
      render(`[data-add-field="${k}"]`);
    } else if (removeFeature) {
      const f = byKey(removeFeature.dataset.removeFeature);
      const index = drafts.indexOf(f);
      drafts.splice(index, 1);
      render();
      form.querySelector("#add-feature").focus();
      toast(
        `Feature ${f.id.trim().toUpperCase() || "ohne ID"} entfernt. Es wird beim Speichern gelöscht.`,
        () => {
          drafts.splice(index, 0, f);
          render(`#feature-${f.key} summary`);
        },
      );
    }
  });

  form.querySelector("#add-feature").addEventListener("click", addFeature);

  // ?feature=<ID> opens that feature, ?feature=neu starts a new one.
  const target = drafts.find((f) => f.id === initial);
  if (target) open.add(target.key);
  render();
  if (initial === "neu") {
    addFeature();
  } else if (target) {
    document.getElementById(`feature-${target.key}`).scrollIntoView();
  }

  const validate = (problems) => {
    const ids = new Set();
    drafts.forEach((f, n) => {
      const errors = [];
      const name = f.id.trim().toUpperCase();
      const label = name || `Feature ${n + 1}`;
      const idInput = document.getElementById(`feature-${f.key}-id`);
      let message = "";
      if (!name) message = `Bitte geben Sie für Feature ${n + 1} eine ID ein.`;
      else if (ids.has(name))
        message = `Die Feature-ID ${name} kommt mehrfach vor.`;
      ids.add(name);
      setError(idInput, message);
      if (message) errors.push({ id: idInput.id, message });

      const description = document.getElementById(
        `feature-${f.key}-description`,
      );
      message = f.description.trim()
        ? ""
        : `Bitte beschreiben Sie das Feature ${label}.`;
      setError(description, message);
      if (message) errors.push({ id: description.id, message });

      const names = new Set();
      f.fields.forEach((x, i) => {
        const input = document.getElementById(
          `feature-${f.key}-field-${i}-name`,
        );
        const fieldName = x.name.trim();
        message = "";
        if (!fieldName)
          message = `Bitte geben Sie für Feld ${i + 1} von ${label} einen Namen ein.`;
        else if (names.has(fieldName.toLowerCase()))
          message = `Der Feldname „${fieldName}“ kommt in ${label} mehrfach vor.`;
        names.add(fieldName.toLowerCase());
        setError(input, message);
        if (message) errors.push({ id: input.id, message });
      });

      if (errors.length) {
        open.add(f.key);
        form.querySelector(`details[data-feature="${f.key}"]`).open = true;
        problems.push(...errors);
      }
    });
  };

  const serialize = () =>
    drafts.map((f) => ({
      id: f.id.trim().toUpperCase(),
      description: f.description.trim(),
      fields: f.fields.map((x) => ({ name: x.name.trim(), type: x.type })),
    }));

  return { validate, serialize };
}

// ---------------------------------------------------------------------------
// Page: create / edit product
// ---------------------------------------------------------------------------

function renderProductForm(root) {
  const params = new URLSearchParams(location.search);
  const id = params.get("id");
  const existing = id ? findProduct(id) : null;
  if (id && !existing) {
    root.innerHTML =
      pageHeader({
        crumbs: [{ label: "Produkte", href: "index.html" }],
        title: "Produkt bearbeiten",
      }) + notFound("Das Produkt");
    return;
  }
  const draft = existing
    ? structuredClone(existing)
    : {
        id: "",
        description: "",
        available: true,
        price: null,
        links: [],
        tags: [],
        features: [],
        hasLicenses: false,
      };
  const cancelHref = existing
    ? `produkt.html?id=${encodeURIComponent(existing.id)}`
    : "index.html";
  const allTags = [...new Set(products.flatMap((p) => p.tags))].sort();

  root.innerHTML = `${pageHeader({
    crumbs: existing
      ? [
          { label: "Produkte", href: "index.html" },
          { label: existing.id, href: cancelHref },
          { label: "Bearbeiten" },
        ]
      : [{ label: "Produkte", href: "index.html" }, { label: "Neu" }],
    title: existing ? "Produkt bearbeiten" : "Produkt anlegen",
    description: existing
      ? "Ändern Sie Stammdaten, Links, Tags und Features. Alles wird gemeinsam gespeichert."
      : "Legen Sie Stammdaten und Features an. Alles wird gemeinsam gespeichert.",
  })}
  <form novalidate class="flex max-w-2xl flex-col gap-6">
    <div class="${CARD} flex flex-col gap-8 p-5 sm:p-6">
    <div data-summary tabindex="-1" hidden class="scroll-mt-6 focus:outline-none"></div>

    <fieldset class="flex flex-col gap-5">
      <legend class="mb-5 text-base font-semibold text-ink">Stammdaten</legend>
      ${field({
        id: "product-id",
        label: "ID",
        required: true,
        help: existing
          ? "Die ID kann nicht geändert werden, weil Lizenzen auf sie verweisen."
          : "Kurzer Code, höchstens 20 Zeichen, zum Beispiel KASSE-T200.",
        counter: existing ? "" : `0 / ${ID_MAX}`,
        control: `<input id="product-id" name="id" required maxlength="${ID_MAX}" autocomplete="off" spellcheck="false" value="${esc(draft.id)}" ${existing ? "readonly" : ""} aria-describedby="product-id-help" class="${TEXT_INPUT} font-mono uppercase read-only:bg-canvas read-only:text-ink-muted">`,
      })}
      ${field({
        id: "product-description",
        label: "Beschreibung",
        required: true,
        counter: `0 / ${DESCRIPTION_MAX}`,
        control: `<textarea id="product-description" name="description" rows="4" required maxlength="${DESCRIPTION_MAX}" class="${INPUT} py-2">${esc(draft.description)}</textarea>`,
      })}
      <div class="grid gap-x-6 gap-y-5 sm:grid-cols-2">
        ${field({
          id: "product-price",
          label: "Preis",
          required: true,
          help: "In Euro, zum Beispiel 1.290,00",
          control: `<div class="relative"><input id="product-price" name="price" inputmode="decimal" autocomplete="off" value="${draft.price === null ? "" : decimalFormat.format(draft.price)}" aria-describedby="product-price-help" class="${TEXT_INPUT} pr-9 text-right tabular-nums"><span class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-muted" aria-hidden="true">€</span></div>`,
        })}
        <div class="flex flex-col gap-1.5">
          <span class="text-sm font-medium text-ink" aria-hidden="true">Verfügbarkeit</span>
          <label class="flex min-h-10 items-center gap-3 text-ink sm:mt-7">
            <input type="checkbox" id="product-available" name="available" ${draft.available ? "checked" : ""} aria-describedby="product-available-help" class="size-4 accent-primary">
            Aktuell verfügbar
          </label>
          <p id="product-available-help" class="text-sm text-ink-muted">Nicht verfügbare Produkte werden nicht mehr verkauft. Bestehende Lizenzen bleiben gültig.</p>
        </div>
      </div>
    </fieldset>

    <fieldset class="flex flex-col gap-3 border-t border-line-subtle pt-6">
      <legend class="float-left w-full text-base font-semibold text-ink">Externe Links</legend>
      <p id="links-help" class="clear-left -mt-2 mb-1 text-sm text-ink-muted">Handbücher, Datenblätter oder Support-Seiten. Jeder Link beginnt mit https://.</p>
      <ul id="links" class="flex flex-col gap-3"></ul>
      <div><button type="button" id="add-link" class="${btn("ghost", BTN_COMPACT)} -ml-3">${icon("plus")}Link hinzufügen</button></div>
    </fieldset>

    <fieldset class="flex flex-col gap-3 border-t border-line-subtle pt-6">
      <legend class="float-left w-full text-base font-semibold text-ink">Tags</legend>
      <p id="tags-help" class="clear-left -mt-2 mb-1 text-sm text-ink-muted">Schlagworte zum Suchen und Filtern. Mit der Eingabetaste übernehmen.</p>
      <ul id="tag-list" class="flex flex-wrap gap-2" aria-label="Vergebene Tags"></ul>
      <div class="flex gap-3">
        <label for="tag-input" class="sr-only">Tag hinzufügen</label>
        <input id="tag-input" list="tag-suggestions" autocomplete="off" placeholder="Tag hinzufügen" aria-describedby="tags-help" class="${TEXT_INPUT} sm:max-w-xs">
        <datalist id="tag-suggestions">${allTags.map((t) => `<option value="${esc(t)}"></option>`).join("")}</datalist>
        <button type="button" id="add-tag" class="${btn("secondary")}">Hinzufügen</button>
      </div>
    </fieldset>

    <fieldset class="border-t border-line-subtle pt-6">
      <legend class="float-left w-full text-base font-semibold text-ink">Features</legend>
      <p class="clear-left pt-1 mb-3 text-sm text-ink-muted">Funktionen, die Kund:innen mit einem Lizenzschlüssel freischalten.</p>
      <ol id="features" class="divide-y divide-line-subtle border-y border-line-subtle"></ol>
      <button type="button" id="add-feature" class="${btn("ghost", BTN_COMPACT)} mt-3 -ml-3">${icon("plus")}Feature hinzufügen</button>
    </fieldset>

    </div>

    <div class="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
      <a href="${cancelHref}" class="${btn("secondary")}">Abbrechen</a>
      <button type="submit" class="${btn("primary")}">${existing ? "Änderungen speichern" : "Produkt anlegen"}</button>
    </div>
  </form>`;

  const form = root.querySelector("form");
  const idInput = form.querySelector("#product-id");
  const descriptionInput = form.querySelector("#product-description");
  const priceInput = form.querySelector("#product-price");
  if (!existing) {
    bindCounter(idInput, ID_MAX);
  }
  bindCounter(descriptionInput, DESCRIPTION_MAX);

  // Links: one input per URL, rendered from draft.links.
  const linkList = form.querySelector("#links");
  const renderLinks = (focusIndex) => {
    linkList.innerHTML = draft.links.length
      ? draft.links
          .map(
            (url, i) => `<li class="flex items-start gap-2">
          <div class="min-w-0 flex-1">
            <label for="link-${i}" class="sr-only">Link ${i + 1}</label>
            <input id="link-${i}" type="url" inputmode="url" data-link="${i}" value="${esc(url)}" placeholder="https://" aria-describedby="links-help" class="${TEXT_INPUT}">
            <p id="link-${i}-error" class="mt-1.5 hidden items-center gap-1.5 text-sm text-danger">${icon("alert")}<span></span></p>
          </div>
          <button type="button" data-remove-link="${i}" class="${ICON_BTN}" aria-label="Link ${i + 1} entfernen" title="Link entfernen">${icon("trash")}</button>
        </li>`,
          )
          .join("")
      : '<li class="text-sm text-ink-muted">Keine Links hinterlegt.</li>';
    if (focusIndex !== undefined) {
      linkList.querySelector(`#link-${focusIndex}`)?.focus();
    }
  };
  renderLinks();
  linkList.addEventListener("input", (event) => {
    const index = event.target.dataset.link;
    if (index !== undefined) {
      draft.links[Number(index)] = event.target.value;
    }
  });
  linkList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-link]");
    if (button) {
      draft.links.splice(Number(button.dataset.removeLink), 1);
      renderLinks();
      form.querySelector("#add-link").focus();
    }
  });
  form.querySelector("#add-link").addEventListener("click", () => {
    draft.links.push("https://");
    renderLinks(draft.links.length - 1);
  });

  // Tags: chips with a remove button, plus an input with suggestions.
  const tagList = form.querySelector("#tag-list");
  const tagInput = form.querySelector("#tag-input");
  const renderTags = () => {
    tagList.innerHTML = draft.tags.length
      ? draft.tags
          .map(
            (
              t,
              i,
            ) => `<li class="inline-flex items-center gap-1 rounded-full bg-line-subtle py-1 pr-1 pl-3 text-sm text-ink">${esc(t)}
          <button type="button" data-remove-tag="${i}" class="grid size-6 place-items-center rounded-full text-ink-muted hover:bg-line hover:text-ink" aria-label="Tag ${esc(t)} entfernen">${icon("x", 14)}</button></li>`,
          )
          .join("")
      : '<li class="text-sm text-ink-muted">Noch keine Tags.</li>';
  };
  renderTags();
  const addTag = () => {
    const value = tagInput.value.trim();
    if (
      value &&
      !draft.tags.some((t) => t.toLowerCase() === value.toLowerCase())
    ) {
      draft.tags.push(value);
      renderTags();
    }
    tagInput.value = "";
    tagInput.focus();
  };
  tagInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      event.preventDefault();
      addTag();
    }
  });
  form.querySelector("#add-tag").addEventListener("click", addTag);
  tagList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-remove-tag]");
    if (button) {
      draft.tags.splice(Number(button.dataset.removeTag), 1);
      renderTags();
      tagInput.focus();
    }
  });

  const features = bindFeatureEditor(
    form,
    draft.features,
    params.get("feature"),
  );

  // Validate on blur for single fields and on submit for everything.
  const checks = {
    "product-id": () => {
      const value = idInput.value.trim().toUpperCase();
      if (!value) return "Bitte geben Sie eine ID ein.";
      if (value.length > ID_MAX)
        return `Die ID darf höchstens ${ID_MAX} Zeichen haben.`;
      if (!existing && findProduct(value))
        return `Die ID ${value} ist bereits vergeben. Bitte wählen Sie eine andere.`;
      return "";
    },
    "product-description": () =>
      descriptionInput.value.trim() ? "" : "Bitte beschreiben Sie das Produkt.",
    "product-price": () => {
      if (!priceInput.value.trim()) return "Bitte geben Sie einen Preis ein.";
      return parsePrice(priceInput.value) === null
        ? "Bitte geben Sie den Preis als Zahl ein, zum Beispiel 1.290,00."
        : "";
    },
  };
  for (const [inputId, check] of Object.entries(checks)) {
    const input = form.querySelector(`#${inputId}`);
    input.addEventListener("blur", () => setError(input, check()));
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const problems = [];
    for (const [inputId, check] of Object.entries(checks)) {
      const message = check();
      setError(form.querySelector(`#${inputId}`), message);
      if (message) problems.push({ id: inputId, message });
    }
    draft.links = draft.links.map((url) => url.trim()).filter(Boolean);
    renderLinks();
    draft.links.forEach((url, i) => {
      const input = form.querySelector(`#link-${i}`);
      const message = /^https:\/\/[^\s/]+\.[^\s]+$/.test(url)
        ? ""
        : `Link ${i + 1} muss mit https:// beginnen und eine gültige Adresse sein.`;
      setError(input, message);
      if (message) problems.push({ id: input.id, message });
    });
    features.validate(problems);
    showErrorSummary(form, problems);
    if (problems.length) {
      return;
    }

    const saved = {
      ...draft,
      features: features.serialize(),
      id: idInput.value.trim().toUpperCase(),
      description: descriptionInput.value.trim(),
      price: parsePrice(priceInput.value),
      available: form.querySelector("#product-available").checked,
    };
    if (existing) {
      Object.assign(existing, saved);
    } else {
      products.push(saved);
    }
    saveProducts(products);
    location.href = `produkt.html?id=${encodeURIComponent(saved.id)}&meldung=${existing ? "gespeichert" : "angelegt"}&name=${encodeURIComponent(saved.id)}`;
  });
}

// ---------------------------------------------------------------------------
// Boot
// ---------------------------------------------------------------------------

const PAGES = {
  list: renderList,
  detail: renderDetail,
  "product-form": renderProductForm,
};

renderShell();
PAGES[document.body.dataset.page](document.getElementById("content"));
showFlash();
