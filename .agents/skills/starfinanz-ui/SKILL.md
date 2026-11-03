---

name: starfinanz-ui
description: Design system and UI conventions for the license management app (Lizenzverwaltung), styled after starfinanz.de but built for data management, not marketing. Use this skill for ANY user-interface work in this repository - new pages or routes, React components, forms, tables, list/detail views, dashboards, dialogs, navigation, layout, styling, Tailwind classes, colors, fonts, icons, empty/loading/error states, German UI texts and microcopy - and when reviewing or refactoring existing UI. Use it even if the request does not mention design, Star Finanz, or styling (e.g. "add a page to list licenses", "build the customer registration form", "show an error when saving fails").
---

# Star Finanz UI for data management

The app borrows its look from starfinanz.de: magenta as the action color, warm
grays, a thin red vertical bar as brand mark, serif headlines, 8px corners,
formal and accessible German. The website is a marketing site - big photos,
large statements, lots of white space. This app is a work tool where admins
and customers look up, compare and change license data many times a day.

So the guiding rule: **take the brand's identity, not its layout.** The
identity lives in color, type, shape and tone. The layout follows the data:
dense, scannable, predictable. When the two pull in different directions,
efficiency wins and the brand recedes to accents.

## Before you write UI code

1. Follow `AGENTS.md` (tests, definition of done, version bump, issues). Read
   the relevant Next.js guide in `node_modules/next/dist/docs/` - this Next.js
   version differs from what you may remember.
2. Check whether the design tokens are installed: `src/app/globals.css` should
   contain `--color-primary: #af0260`. If not, do the setup below first, as a
   separate step.
3. Look in `src/components/ui/` for existing primitives (`buttonClass` and
   the other class recipes in `styles.ts`, `Field`, `PageHeader`, `Alert`,
   `ConfirmDialog`, `useToast`, ...). Reuse and extend them. Create a primitive there
   when a pattern is needed a second time, not before.
4. For concrete class recipes, read `references/components.md` (table of
   contents at the top; read only the sections you need). For the reasoning
   behind a token, read `references/brand-analysis.md`.

### One-time setup

1. Replace the contents of `src/app/globals.css` with `assets/theme.css`.
   It resets Tailwind's default palette (`--color-*: initial`), so only brand
   tokens exist and classes like `text-slate-500` stop working.
2. In `src/app/layout.tsx`, replace the Geist fonts:

   ```tsx
   import { Fira_Mono, Fira_Sans, Source_Serif_4 } from "next/font/google";

   const firaSans = Fira_Sans({ subsets: ["latin"], weight: ["400", "500", "600"], variable: "--font-fira-sans" });
   const sourceSerif = Source_Serif_4({ subsets: ["latin"], variable: "--font-source-serif" });
   const firaMono = Fira_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-fira-mono" });

   // <html lang="de" className={`${firaSans.variable} ${sourceSerif.variable} ${firaMono.variable} h-full antialiased`}>
   // <body className="flex min-h-full flex-col font-sans">
   ```
3. Migrate existing components that use default palette classes (e.g.
   `slate-*`, `teal-*`) to the tokens, and remove the `dark:` variants.
4. Run `npm run check` and `npm run test:e2e`.

The app is light mode only, like the website. Do not add `dark:` variants; if
dark mode is ever needed, it will be added centrally in the tokens.

## Design principles

**Data first.** Each screen exists to let someone find, read or change
records. Put the data and the main action above the fold. No hero sections,
no stock photos, no decorative illustrations, no marketing copy ("Entdecken
Sie..."). If a sentence does not help the user do the task, cut it.

**Brand as accent, not as surface.** Magenta marks what is interactive
(buttons, links, focus, selected state) - that's how users learn what they can
click. Large magenta areas would drown that signal, so backgrounds stay white
and light gray. The red bar appears exactly twice: in the wordmark and as the
active-navigation indicator. `brand-red` is never used for errors, otherwise
users would read the logo as a warning; errors use `danger`.

**One primary action per view.** One filled magenta button per page or dialog
(e.g. "Lizenz anlegen"). Everything else is secondary or ghost. This makes the
expected next step obvious.

**Predictable structure.** Every page uses the same skeleton: page header
(breadcrumb, serif title, one-line description, actions right) -> toolbar ->
content. Admins switch between many screens; consistency lets them work from
muscle memory.

**Density with air.** Tables use `text-sm` and `py-3` rows; forms use `gap-5`
between fields; sections use `gap-8`. Tighter than the website, but keep
alignment strict and white space consistent - that is what makes a dense
screen calm.

**Status is never color alone.** Every status has a text label (and ideally an
icon or dot). Color-blind users, printouts and screen readers all depend on
it.

**Accessible by default (WCAG 2.2 AA).** Star Finanz highlights inclusion on its
website; the app should hold up to that. Semantic HTML first (`table`,
`label`, `fieldset`, `button`, `dialog`, `nav`), visible focus (already in
the tokens), every input labeled, keyboard-operable everything, `aria-live`
for results that change without navigation. The tokens are contrast-checked;
stick to the documented pairings.

## Tokens (Tailwind classes)

Use only these. Never hardcode hex values, `style={{ color }}`, or arbitrary
values like `bg-[#af0260]` - the palette lives in one place so it can change in
one place.

| Purpose                        | Classes                                                                                        |
| ------------------------------ | ---------------------------------------------------------------------------------------------- |
| Interactive, links, focus      | `bg-primary` `text-primary` `hover:bg-primary-hover`                                           |
| Page title, active nav text    | `text-primary-strong`                                                                          |
| Selected row, active nav, chip | `bg-primary-subtle`                                                                            |
| Brand bar (wordmark, nav)      | `bg-brand-red` (wordmark only), `bg-primary` (active nav bar)                                  |
| Text                           | `text-ink`, `text-ink-muted` (secondary), `text-ink-subtle` (placeholder/meta, white bg only)  |
| Borders                        | `border-line-strong` (inputs), `border-line` (buttons, cards), `border-line-subtle` (dividers) |
| Backgrounds                    | `bg-canvas` (page), `bg-surface` (cards), `bg-surface-muted` (table head, row hover)           |
| Status                         | `text-{success,warning,danger,info}` on `bg-{...}-subtle`                                      |
| Radius                         | `rounded-control` (8px) everything; `rounded-full` badges, chips                               |
| Elevation                      | `shadow-card` resting cards, `shadow-overlay` dialogs, menus, toasts                           |
| Motion                         | `motion-safe:animate-appear` new rows, toasts                                                  |
| Fonts                          | `font-sans` (Fira Sans), `font-serif` (Source Serif 4), `font-mono` (Fira Mono)                |

## Typography

| Element                       | Style                                                             |
| ----------------------------- | ----------------------------------------------------------------- |
| Page title (h1, one per page) | `font-serif text-page-title text-primary-strong` (32px)           |
| Section heading (h2)          | `text-xl font-semibold text-ink`                                  |
| Card / group heading (h3)     | `text-base font-semibold text-ink`                                |
| Body, form fields             | `text-base` (16px)                                                |
| Tables, help text, meta       | `text-sm` (14px)                                                  |
| Table column headers, eyebrow | `text-xs font-semibold uppercase tracking-wider text-ink-muted`   |
| Buttons, navigation           | `text-sm font-medium tracking-wide` (the website's 0.8px spacing) |
| License keys, IDs             | `font-mono`                                                       |

The serif is reserved for the h1. It carries the brand's editorial voice in a
single spot per page; using it for small text or table content would hurt
legibility and dilute the effect. Never use weights above 600, and never set
long text in all caps.

## Screen patterns

Choose the pattern by what the user does on the screen:

- **List** (licenses, customers, products, pending registrations): page
  header -> toolbar (search, filters, bulk actions) -> table in a card ->
  pagination. Filters and sorting live in the URL. Rows link to the detail
  page.
- **Detail** (one license, one customer): page header with the object's name
  as title and status badge next to it -> key facts as a definition list
  (`dl` in a two-column grid, labels `text-sm text-ink-muted`) -> related data
  as tables in cards -> actions in the header (destructive ones last, as
  `danger` secondary).
- **Create / edit**: page header -> one card with the form (`max-w-2xl`),
  fields grouped in fieldsets -> actions at the bottom right ("Abbrechen",
  then the primary). Short forms (≤ 3 fields) can be a dialog instead.
- **Dashboard / start page**: a row of key-figure cards (each links to the
  filtered list it counts) -> "needs attention" lists (e.g. registrations
  awaiting approval, licenses expiring soon). No charts unless the user asks;
  for charts, also consult the `dataviz` skill if available.
- **Waiting / info pages** (e.g. "Ihr Zugang wird geprüft"): narrow centered
  card, serif title, one or two sentences, one link. This is the only place
  where the layout may feel a bit like the website.

Every data view handles four states: loading (skeleton), empty (explain +
primary action), error (alert with what happened and what to do), and data.
Design the empty and error states as deliberately as the filled one.

## Microcopy (German)

- Formal address "Sie", like the website. Gender-inclusive with colon, as in
  the specs: "Mitarbeiter:innen", "Kund:innen".
- Buttons: verb or verb + object, specific: "Lizenz anlegen", "Freigeben",
  "Änderungen speichern". Not "OK", "Absenden", "Ja".
- Titles are nouns: "Lizenzen", "Kunden", "Registrierungen".
- Messages say what happened and what to do next, without blame or
  technical details: "Die Lizenz konnte nicht gespeichert werden. Bitte
  versuchen Sie es erneut." Log technical details, do not show them.
- Dates `31.12.2027`, numbers `1.284`, currency `1.284,00 €` - via `Intl`
  with `de-DE`, from one formatting module (see `references/components.md` §13).
- Consistent domain vocabulary across all screens: decide once (e.g.
  "Lizenzschlüssel" vs. "Schlüssel", "Kunde" for the company vs. "Benutzer:in"
  for the person) and reuse.

## Implementation conventions

- Server Components by default; add `"use client"` only to the leaf that needs
  state or event handlers (a filter input, a copy button, a dialog trigger).
- Small typed primitives in `src/components/ui/`, feature components next to
  their route or in `src/components/<feature>/`. Primitives accept `className`
  and spread remaining native props, so they stay as flexible as the element
  they wrap.
- No component library (shadcn, MUI, ...) without asking the user - the token
  set is small enough to build primitives directly, and a library would bring
  its own look.
- Icons: `lucide-react` (already installed), 16px in tables and buttons, 20px in navigation, stroke width 1.75,
  `aria-hidden` unless the icon is the only content.
- Component tests (Testing Library) query by role and accessible name
  (`getByRole("button", { name: "Lizenz anlegen" })`). That tests the
  accessibility at the same time.

## Done checklist for UI changes

- Only token classes; no default-palette colors, hex values or `dark:` variants.
- One primary button per view; destructive actions need confirmation or undo.
- Loading, empty and error states exist.
- Keyboard-only walkthrough works; focus is visible; every input has a label.
- Status shown with text, not color alone; numbers right-aligned and tabular.
- German texts follow the microcopy rules; dates and numbers via `Intl`.
- Visually checked: start the dev server and take a screenshot of the changed
  screen (e.g. with Playwright, which is already installed), then compare it
  against these principles before calling the work done.
- `npm run check` and `npm run test:e2e` pass without warnings (see `AGENTS.md`).
