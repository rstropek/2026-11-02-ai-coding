# Component recipes

Tailwind class recipes for the building blocks of the license management UI.
They use only the tokens from `assets/theme.css`. Treat them as a starting
point: when a primitive already exists in `src/components/ui/`, use and extend
it instead of copying the classes again.

## Contents

1. App shell (header, sidebar, content)
2. Page header
3. Buttons and links
4. Form fields
5. Data table
6. Toolbar: search, filters, bulk actions
7. Pagination
8. Badges and status
9. Cards and key figures
10. Alerts, toasts, empty and loading states
11. Dialogs and destructive confirmation
12. License keys and other machine values
13. Formatting helpers (dates, numbers)

---

## 1. App shell

The website has a white header with the logo on the left: a thin red vertical
bar, then the wordmark. Reuse that motif for the app name; it is the main
brand signal in the shell. Do not use the Star Finanz logo itself.

```tsx
<div className="flex min-h-full flex-col">
  <header className="flex h-16 items-center gap-6 border-b border-line-subtle bg-surface px-6">
    <a href="/" className="flex items-center gap-3">
      <span aria-hidden="true" className="h-8 w-0.5 bg-brand-red" />
      <span className="text-xl text-ink-muted">
        Lizenz<span className="font-semibold text-ink">verwaltung</span>
      </span>
    </a>
    <div className="ml-auto flex items-center gap-4 text-sm">
      {/* user menu */}
    </div>
  </header>
  <div className="flex flex-1">
    <nav
      aria-label="Hauptnavigation"
      className="w-60 shrink-0 border-r border-line-subtle bg-surface py-4"
    >
      {/* nav items, see below */}
    </nav>
    <main className="flex-1 px-8 py-6">{/* page */}</main>
  </div>
</div>;
```

Navigation item. The active item gets the same vertical bar as the logo, in
magenta, plus `aria-current="page"`:

```tsx
<a
  href="/lizenzen"
  aria-current={active ? "page" : undefined}
  className="relative flex items-center gap-3 px-6 py-2 text-sm tracking-wide text-ink-muted
             hover:bg-line-subtle hover:text-ink
             aria-[current=page]:bg-primary-subtle aria-[current=page]:font-medium aria-[current=page]:text-primary-strong
             aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-1 aria-[current=page]:before:left-0
             aria-[current=page]:before:w-1 aria-[current=page]:before:bg-primary"
>
  Lizenzen
</a>;
```

Customers see fewer areas than admins. Hide navigation they cannot use rather
than showing disabled entries.

## 2. Page header

Every page starts with the same header. The serif title in plum is where the
website's editorial look shows up; everything below it is plain sans.

```tsx
<div className="mb-6 flex flex-wrap items-end justify-between gap-4">
  <div className="flex flex-col gap-2">
    <nav aria-label="Brotkrumen" className="text-sm text-ink-muted">
      <a href="/kunden" className="hover:text-primary">
        Kunden
      </a>{" "}
      / Muster GmbH
    </nav>
    <h1 className="font-serif text-page-title text-primary-strong">Lizenzen</h1>
    <p className="max-w-prose text-ink-muted">
      Alle Lizenzschlüssel der Muster GmbH mit Status und Laufzeit.
    </p>
  </div>
  <div className="flex gap-3">
    {/* secondary actions, then the one primary action */}
  </div>
</div>;
```

Optional eyebrow label above the title (the website's "MISSION" tag), for
example to mark the admin area. Use it sparingly:

```tsx
<span className="w-fit rounded-control bg-line-subtle px-2 py-0.5 text-xs font-medium uppercase tracking-widest text-ink-muted">
  Administration
</span>;
```

## 3. Buttons and links

All buttons share size, radius and the website's slight letter spacing.
Labels are verbs ("Lizenz anlegen", "Speichern"), never "OK" or "Absenden".

```ts
const base =
  "inline-flex items-center justify-center gap-2 rounded-control px-4 h-10 text-sm font-medium tracking-wide " +
  "transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const variants = {
  // One per view: the main task of the page.
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-strong",
  // Everything else. White with magenta text, like the website's "Mehr lesen" button.
  secondary: "border border-line bg-surface text-primary hover:bg-line-subtle",
  // Low-emphasis actions in toolbars and table rows.
  ghost: "text-primary hover:bg-primary-subtle",
  // Destructive. Outlined in pages, filled only inside the confirmation dialog.
  danger: "border border-danger bg-surface text-danger hover:bg-danger-subtle",
  dangerSolid: "bg-danger text-white hover:opacity-90",
};

const compact = "h-8 px-3"; // inside tables and toolbars
```

- Order in a button group: secondary actions left, the primary action right.
  In forms: "Abbrechen" (secondary) then "Speichern" (primary).
- Icon-only buttons need `aria-label` and a tooltip (`title` is enough for now).
- While a server action runs, keep the label, disable the button and show a
  small spinner: `aria-busy="true"`.

Links in text: `text-primary underline underline-offset-2 hover:text-primary-hover`.
Navigational links to a detail page may end with an arrow, like the website:
`Details →` (arrow as `aria-hidden` icon or text).

## 4. Form fields

Label above the field, help text below the label, error below the field.
Mark required fields, not optional ones, because most fields here are required.

```tsx
<div className="flex flex-col gap-1.5">
  <label htmlFor={id} className="text-sm font-medium text-ink">
    Produkt{" "}
    <span aria-hidden="true" className="text-danger">
      *
    </span>
  </label>
  <p id={`${id}-help`} className="text-sm text-ink-muted">
    Für welches Gerät gilt die Lizenz?
  </p>
  <input
    id={id}
    required
    aria-invalid={error ? true : undefined}
    aria-describedby={`${id}-help${error ? ` ${id}-error` : ""}`}
    className="h-10 rounded-control border border-line-strong bg-surface px-3 text-ink
               placeholder:text-ink-subtle
               focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30
               aria-invalid:border-danger aria-invalid:ring-danger/30
               disabled:bg-canvas disabled:text-ink-muted"
  />
  {error && (
    <p
      id={`${id}-error`}
      className="flex items-center gap-1.5 text-sm text-danger"
    >
      {/* alert icon, aria-hidden */}
      {error}
    </p>
  )}
</div>;
```

- Same classes for `select` and `textarea` (textarea without fixed height).
- Checkboxes and radios: native inputs with `accent-primary size-4`.
- Group related fields in `fieldset` + `legend` (`text-base font-semibold`),
  separated by `border-t border-line-subtle pt-6`.
- Form width: `max-w-2xl`. Two columns (`grid sm:grid-cols-2 gap-x-6 gap-y-5`)
  only for short related fields like "Gültig ab / Gültig bis".
- Validate on submit and on blur, not on every keystroke. On a failed submit,
  show an alert above the form listing the problems and move focus to it.
- Error messages say what to do: "Bitte ein Ablaufdatum nach dem Startdatum
  wählen." rather than "Ungültige Eingabe".

## 5. Data table

The table is the center of most screens. Wrap it in a card so it sits on the
canvas like the website's white panels.

```tsx
<div className="overflow-x-auto rounded-control border border-line-subtle bg-surface shadow-card">
  <table className="w-full text-sm">
    <caption className="sr-only">Lizenzen der Muster GmbH</caption>
    <thead className="sticky top-0 bg-surface-muted">
      <tr className="border-b border-line">
        <th
          scope="col"
          className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          Schlüssel
        </th>
        <th
          scope="col"
          aria-sort="descending"
          className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wider text-ink-muted"
        >
          <button
            type="button"
            className="inline-flex items-center gap-1 hover:text-ink"
          >
            Gültig bis {/* sort icon, aria-hidden */}
          </button>
        </th>
        <th scope="col" className="px-4 py-3">
          <span className="sr-only">Aktionen</span>
        </th>
      </tr>
    </thead>
    <tbody className="divide-y divide-line-subtle">
      <tr
        data-selected={selected || undefined}
        className="hover:bg-surface-muted data-selected:bg-primary-subtle"
      >
        <td className="px-4 py-3 font-mono">7KQ2-…-M4XD</td>
        <td className="px-4 py-3 text-right">31.12.2027</td>
        <td className="px-4 py-2 text-right">
          {/* ghost compact buttons or a menu */}
        </td>
      </tr>
    </tbody>
  </table>
</div>;
```

- Text left, numbers and dates right-aligned, status centered or left - but
  consistent per column across all tables.
- The first column is the identifying value and links to the detail page.
- Show a count above or below the table: "24 Lizenzen".
- Long text truncates with `truncate max-w-xs` and the full value in `title`.
- At most two inline row actions; more go into a "⋯" menu.
- No zebra stripes; dividers plus hover are calmer and match the website.
- On small screens let the table scroll horizontally (`overflow-x-auto`)
  instead of reflowing to cards. Admins work on desktops.

## 6. Toolbar

Above the table, in one row: search left, filters next to it, bulk actions
right. Keep the filter state in the URL (`searchParams`) so views can be
bookmarked and the back button works.

```tsx
<div className="mb-4 flex flex-wrap items-center gap-3">
  <label className="sr-only" htmlFor="q">
    Suchen
  </label>
  <input
    id="q"
    type="search"
    placeholder="Schlüssel oder Kunde suchen"
    className="h-10 w-72 rounded-control border border-line-strong bg-surface px-3"
  />
  <select
    aria-label="Status"
    className="h-10 rounded-control border border-line-strong bg-surface px-3"
  >
    …
  </select>
  <div className="ml-auto flex gap-3">
    {/* bulk actions appear when rows are selected */}
  </div>
</div>;
```

Active filters show as removable chips below the toolbar:
`rounded-full bg-primary-subtle px-3 py-1 text-sm text-primary-strong`.

## 7. Pagination

```tsx
<nav
  aria-label="Seiten"
  className="mt-4 flex items-center justify-between text-sm text-ink-muted"
>
  <span>1–25 von 312</span>
  <div className="flex gap-2">
    {/* secondary compact buttons "Zurück" / "Weiter" */}
  </div>
</nav>;
```

## 8. Badges and status

Pills, small, always with a text label. Map each domain status to exactly one
tone and keep that mapping in one place (e.g. `src/components/ui/status.ts`).

```ts
const tone = {
  neutral: "bg-line-subtle text-ink-muted",
  success: "bg-success-subtle text-success",
  warning: "bg-warning-subtle text-warning",
  danger: "bg-danger-subtle text-danger",
  info: "bg-info-subtle text-info",
  brand: "bg-primary-subtle text-primary-strong",
};
const badge =
  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium";
```

Suggested mapping for this domain (adjust once the data model exists):

| Status         | Label (UI)          | Tone    |
| -------------- | ------------------- | ------- |
| active         | Aktiv               | success |
| expiring soon  | Läuft bald ab       | warning |
| expired        | Abgelaufen          | neutral |
| revoked        | Gesperrt            | danger  |
| pending review | Freigabe ausstehend | info    |

A small leading dot (`size-1.5 rounded-full bg-current`) helps scanning in long
tables.

## 9. Cards and key figures

Cards group content on the canvas:
`rounded-control border border-line-subtle bg-surface p-6 shadow-card`.
Card title: `text-base font-semibold` (sans), not serif.

Key figures on a dashboard echo the website's "Star Finanz in Zahlen" block:
big number, short label, nothing else.

```tsx
<div className="rounded-control border border-line-subtle bg-surface p-5 shadow-card">
  <p className="text-sm text-ink-muted">Aktive Lizenzen</p>
  <p className="mt-1 text-3xl font-semibold tabular-nums text-ink">1.284</p>
  <p className="mt-1 text-sm text-warning">23 laufen in 30 Tagen ab</p>
</div>;
```

Keep key figures actionable: each one links to the filtered list it counts.

## 10. Alerts, toasts, empty and loading states

Alert (inline, persistent, for errors and important info):

```tsx
<div
  role="alert"
  className="flex gap-3 rounded-control border border-danger/30 bg-danger-subtle p-4 text-sm text-danger"
>
  {/* icon */}
  <div>
    <p className="font-semibold">Lizenz konnte nicht gespeichert werden</p>
    <p>…</p>
  </div>
</div>;
```

Use `role="status"` instead of `role="alert"` for non-urgent info.

Toast (transient, for success after an action): bottom right, `bg-ink text-white
rounded-control shadow-overlay px-4 py-3 text-sm`, auto-hide after ~5 s, with
an "Rückgängig" link when the action can be undone. Never use a toast for errors.

Empty state (inside the table card): short serif-free headline, one sentence,
and the primary action that fills the table.

```tsx
<div className="flex flex-col items-center gap-3 px-6 py-16 text-center">
  <p className="text-base font-semibold text-ink">Noch keine Lizenzen</p>
  <p className="max-w-sm text-sm text-ink-muted">
    Legen Sie die erste Lizenz an, um Funktionen für diesen Kunden
    freizuschalten.
  </p>
  {/* primary button */}
</div>;
```

Distinguish "nothing exists yet" from "no results for this filter" (offer
"Filter zurücksetzen" in the latter).

Loading: skeleton rows (`h-4 animate-pulse rounded bg-line-subtle`) inside the
table via `loading.tsx` / Suspense, not a full-page spinner.

## 11. Dialogs and destructive confirmation

Use the native `<dialog>` element (`showModal()`): focus trap and Escape come
for free.

```tsx
<dialog className="m-auto w-full max-w-md rounded-control bg-surface p-6 shadow-overlay backdrop:bg-ink/40">
  <h2 className="text-lg font-semibold text-ink">Lizenz sperren?</h2>
  <p className="mt-2 text-sm text-ink-muted">
    Die Lizenz <span className="font-mono text-ink">7KQ2-…-M4XD</span> der
    Muster GmbH wird sofort ungültig. Freigeschaltete Funktionen werden beim
    nächsten Abgleich deaktiviert.
  </p>
  <div className="mt-6 flex justify-end gap-3">
    {/* "Abbrechen" secondary, "Lizenz sperren" dangerSolid */}
  </div>
</dialog>;
```

- Name the object and the consequence. The confirm button repeats the verb.
- Focus starts on "Abbrechen" for destructive dialogs.
- Prefer undo over confirmation for cheap, reversible actions.

## 12. License keys and other machine values

- Font: `font-mono`, never break inside a key (`whitespace-nowrap`).
- Show keys in groups (`XXXX-XXXX-XXXX-XXXX`) for readability; in tables shorten
  to start and end with an ellipsis and offer the full value on the detail page.
- Next to every full key a copy button (ghost, compact, `aria-label="Schlüssel
  kopieren"`), which briefly changes to "Kopiert" with a check icon.
- IDs, serial numbers and hardware IDs follow the same rules.

## 13. Formatting helpers

Format in one module (e.g. `src/lib/format.ts`) and unit-test it; never build
date or number strings by hand in components.

```ts
const dateFormat = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});
const dateTimeFormat = new Intl.DateTimeFormat("de-DE", {
  dateStyle: "short",
  timeStyle: "short",
});
const numberFormat = new Intl.NumberFormat("de-DE");
const currencyFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

export const formatDate = (d: Date) => dateFormat.format(d); // 31.12.2027
```

- Pass an explicit `timeZone` (e.g. `"Europe/Vienna"` or `"Europe/Berlin"`,
  whichever the project settles on) when formatting on the server, so server
  and client render the same string and hydration does not mismatch.
- Relative dates ("in 12 Tagen") only as secondary text next to the absolute
  date.
- Wrap dates in `<time dateTime="2027-12-31">`.
