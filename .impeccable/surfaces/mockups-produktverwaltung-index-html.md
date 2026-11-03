---

version: 1
slug: "mockups-produktverwaltung-index-html"
primary_target: "mockups/produktverwaltung/index.html"
related_targets: []
---

# Surface brief: product management click dummy

Scope: static click dummy for admin product management (`mockups/produktverwaltung/`). Mode: Operate.
Audience: Administrator:innen maintaining master data at Full HD desktops, sometimes on large phones (portrait and landscape).
Task: find a product, read its facts and features, edit the product including its features in one form (products are only written as a whole), define a feature's additional unlock fields, deactivate a product. No list search or filter until the read API supports it.
Constraints: starfinanz-ui skill is the visual authority (tokens, recipes, microcopy). Light mode only. Sample data is illustrative and labeled.
Adaptations: below md, tables become divided lists (phone layouts requested). "Produkt löschen" sits in its own card at the end of the detail page instead of the header, so the confirmed rule (delete only while no licenses exist) can be explained next to the button. States are reachable with ?zustand=laden|fehler.
Unresolved: products have no name field in the spec (ID acts as title); net vs. gross price; feature deletion once licenses exist.

## Direction contract

THESIS: Master data as a calm, dense workbench: list -> detail -> edit, identical skeleton on every screen. Refuses the card-grid product catalog with images and marketing blurbs.
OWN-WORLD: starfinanz-ui unchanged: white surfaces on #f5f5f5 canvas, magenta only for actions, focus and selection, plum serif h1, Fira Sans everywhere else, Fira Mono for IDs, 8px corners, hairline dividers, red bar only in wordmark, magenta bar on active nav.
STORY: The admin sees all products with availability at a glance, opens one, understands which features can be unlocked and what must be entered for each, and changes it safely.
FIRST VIEWPORT: Desktop list: header bar 64px with wordmark, 240px side nav, page header (no breadcrumb on the top-level list, serif "Produkte", one-line description, "Produkt anlegen" primary right), count, table card with all five products visible without scrolling. Phone portrait: compact top bar with menu button, title, full-width primary, products as a divided list. Phone landscape: same top bar, table layout.
FORM: whole surface inside an established world; structure pinned by starfinanz-ui screen patterns (List, Detail, Create/edit), so no structure roll. Signature interaction: the live preview of the unlock form inside each feature row of the product form, updating as fields and data types change.
seed: none (roll skipped: structure pinned by starfinanz-ui, disclosed to the user)
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
