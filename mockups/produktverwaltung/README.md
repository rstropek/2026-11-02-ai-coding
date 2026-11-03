# Click dummy: product management

First design draft for `specs/2026-11-03-produktverwaltung.md` as a static click dummy. It is not part of the Next.js app and is not deployed.

## Open it

Open `index.html` in a browser (double-click works, no server needed). Fonts load from Google Fonts, so an internet connection makes it look right.

To try the layouts, use the browser's device toolbar:

| Target                 | Viewport  |
| ---------------------- | --------- |
| Full HD landscape      | 1920×1080 |
| Large phone, portrait  | 430×932   |
| Large phone, landscape | 932×430   |

Changes (edit, create, delete, deactivate) are kept in `sessionStorage`, so they survive page changes within one browser tab. "Zurücksetzen" in the info bar restores the sample data.

## What it shows

- **Produkte** (`index.html`): list with search (ID, description, tag, feature ID) and availability filter. Table on wide screens, divided list on phones.
- **Produktdetail** (`produkt.html?id=…`): key facts, tags, external links, features with their additional information, deactivate with undo, delete only while no licenses exist.
- **Produkt anlegen / bearbeiten** (`produkt-bearbeiten.html[?id=…]`): ID, description with character counter, price, availability, links (must start with `https://`), tags.
- **Feature anlegen / bearbeiten** (`feature-bearbeiten.html?produkt=…[&feature=…]`): ID, description, list of additional fields (name and data type Text, Ganzzahl or Datum, reorderable), with a live preview of what the unlock form will ask for.

The five products and their features in `data.js` are illustrative only, as are prices and links (`example.com`). `hasLicenses` simulates whether licenses exist; it is not a product field.

## Open questions for the next iteration

- The spec has no product or feature **name**. The dummy uses the ID as title. Do we need a display name?
- **ID after creation**: the dummy makes the product ID read-only once created, because licenses will reference it. Is that right for feature IDs too?
- **Price**: net or gross? Currency always EUR? Do features have their own price?
- **Deleting a feature** once licenses for the product exist: allowed, blocked, or deactivate as for products?
- **Required additional fields**: the dummy treats every additional field as mandatory when unlocking. Do we need optional fields?

## Change the styles

Pages use the same Tailwind token classes as the app (`starfinanz-ui` skill). After changing classes in the HTML or JS files, regenerate the CSS:

```bash
node mockups/produktverwaltung/build-css.mjs
```
