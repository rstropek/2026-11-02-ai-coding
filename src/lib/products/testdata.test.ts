// @vitest-environment node
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { productSchema } from "./schema";

// The test data folder must follow the rules in
// specs/2026-11-03-produktverwaltung.md.
const dir = path.resolve("testdata/products");

async function loadTestData() {
  const files = (await readdir(dir)).filter((f) => f.endsWith(".json"));
  return Promise.all(
    files.map(async (file) => ({
      file,
      product: productSchema.parse(
        JSON.parse(await readFile(path.join(dir, file), "utf8")),
      ),
    })),
  );
}

describe("testdata", () => {
  it("has 5 valid products, each in a file named after its ID", async () => {
    const data = await loadTestData();
    expect(data).toHaveLength(5);
    for (const { file, product } of data) {
      expect(file).toBe(`${product.id}.json`);
    }
  });

  it("has 1 to 5 features per product", async () => {
    for (const { product } of await loadTestData()) {
      expect(product.features.length).toBeGreaterThanOrEqual(1);
      expect(product.features.length).toBeLessThanOrEqual(5);
    }
  });

  it("covers features without fields, every field type and all types in one feature", async () => {
    const features = (await loadTestData()).flatMap((d) => d.product.features);
    const types = (f: (typeof features)[number]) =>
      new Set(f.fields.map((x) => x.type));
    expect(features.some((f) => f.fields.length === 0)).toBe(true);
    expect(new Set(features.flatMap((f) => [...types(f)]))).toEqual(
      new Set(["text", "integer", "date"]),
    );
    expect(features.some((f) => types(f).size === 3)).toBe(true);
  });
});
