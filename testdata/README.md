# Test data

Sample master data that can be mounted as the app's data folder (`DATA_DIR`). One JSON file per product in `products/`, named after the product ID. The products, prices and links (`example.com`) are illustrative, not the real catalog.

The data follows the rules in `specs/2026-11-03-produktverwaltung.md`:

- 5 products with 1 to 5 features each
- features without additional information (`KONTAKTLOS`, `DUPLEX`, `MODBUS-TCP`)
- all field types (Text, Ganzzahl, Datum) are used; `FERNWARTUNG` uses all three

`src/lib/products/testdata.test.ts` checks these rules and validates every file against the schema.

## Use it

```bash
npm run data:reset                    # copy into ./data, the default DATA_DIR of npm run dev
DATA_DIR=testdata npm run dev         # or work on this folder directly (changes show up in git)
docker run --rm -p 3000:3000 -v "$PWD/testdata:/data" license-management
```
