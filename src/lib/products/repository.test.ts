// @vitest-environment node
import { mkdir, mkdtemp, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  createProduct,
  deleteProduct,
  getProduct,
  InvalidProductFileError,
  listProducts,
  ProductExistsError,
  ProductNotFoundError,
  productsDir,
  setAvailability,
  updateProduct,
} from "./repository";
import { type Product, productSchema } from "./schema";

const product = (id: string, changes: Partial<Product> = {}): Product =>
  productSchema.parse({
    id,
    description: `Produkt ${id}`,
    available: true,
    price: 10,
    features: [{ id: "F1", description: "Feature", fields: [] }],
    ...changes,
  });

let dataDir: string;

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), "products-"));
  vi.stubEnv("DATA_DIR", dataDir);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await rm(dataDir, { recursive: true, force: true });
});

describe("product repository", () => {
  it("stores products in DATA_DIR/products", () => {
    expect(productsDir()).toBe(path.join(dataDir, "products"));
  });

  it("returns an empty list while the folder does not exist", async () => {
    expect(await listProducts()).toEqual({ products: [], invalidFiles: [] });
  });

  it("creates, reads, updates and deletes products, one file each", async () => {
    await createProduct(product("B"));
    await createProduct(product("A"));
    expect(await readdir(productsDir())).toEqual(
      expect.arrayContaining(["A.json", "B.json"]),
    );

    const { products } = await listProducts();
    expect(products.map((p) => p.id)).toEqual(["A", "B"]);

    await updateProduct(product("A", { price: 99 }));
    expect((await getProduct("A"))?.price).toBe(99);

    await deleteProduct("A");
    expect(await getProduct("A")).toBeUndefined();
    expect((await readdir(productsDir())).sort()).toEqual(["B.json"]);
  });

  it("refuses to create a product twice", async () => {
    await createProduct(product("A"));
    await expect(createProduct(product("A"))).rejects.toBeInstanceOf(
      ProductExistsError,
    );
  });

  it("refuses to update or delete a missing product", async () => {
    await expect(updateProduct(product("A"))).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
    await expect(deleteProduct("A")).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
  });

  it("serializes concurrent creates of the same ID", async () => {
    const results = await Promise.allSettled([
      createProduct(product("A")),
      createProduct(product("A")),
    ]);
    expect(results.map((r) => r.status).sort()).toEqual([
      "fulfilled",
      "rejected",
    ]);
  });

  it("changes the availability without losing a concurrent update", async () => {
    await createProduct(product("A"));
    await Promise.all([
      updateProduct(product("A", { price: 99 })),
      setAvailability("A", false),
    ]);
    expect(await getProduct("A")).toMatchObject({
      price: 99,
      available: false,
    });
    await expect(setAvailability("B", true)).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
  });

  it("does not read outside the data folder", async () => {
    expect(await getProduct("../secret")).toBeUndefined();
    await expect(deleteProduct("../secret")).rejects.toBeInstanceOf(
      ProductNotFoundError,
    );
  });

  it("validates every file it reads and reports invalid ones", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    await createProduct(product("GOOD"));
    const dir = productsDir();
    await writeFile(path.join(dir, "BROKEN.json"), "{ not json");
    await writeFile(
      path.join(dir, "NOPRICE.json"),
      JSON.stringify({ id: "NOPRICE", description: "x", available: true }),
    );
    await writeFile(
      path.join(dir, "OTHER.json"),
      JSON.stringify(product("MISMATCH")),
    );
    // Temporary files of a write in progress and other files are ignored.
    await writeFile(path.join(dir, ".GOOD.123.tmp"), "{}");
    await writeFile(path.join(dir, "notes.txt"), "hello");

    expect(await listProducts()).toEqual({
      products: [product("GOOD")],
      invalidFiles: ["BROKEN.json", "NOPRICE.json", "OTHER.json"],
    });
    expect(console.error).toHaveBeenCalledTimes(3);
    await expect(getProduct("NOPRICE")).rejects.toBeInstanceOf(
      InvalidProductFileError,
    );
  });

  it("writes files that the next read accepts", async () => {
    await mkdir(productsDir(), { recursive: true });
    await expect(
      createProduct({ ...product("A"), price: -1 }),
    ).rejects.toThrow();
    expect(await readdir(productsDir())).toEqual([]);
  });
});
