import type { Product } from "./schema";

/** All tags used by any product, sorted, as suggestions for the product form. */
export function knownTags(products: Pick<Product, "tags">[]): string[] {
  return [...new Set(products.flatMap((p) => p.tags))].sort((a, b) =>
    a.localeCompare(b, "de"),
  );
}
