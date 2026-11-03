import {
  createProduct,
  ProductExistsError,
  ProductNotFoundError,
  updateProduct,
} from "./repository";
import {
  normalizeId,
  type Product,
  productSchema,
  toValidationIssues,
  type ValidationIssue,
} from "./schema";

// Write use cases shared by the REST API and the Server Actions of the UI:
// validate untrusted input, then store the whole product including features.

export type SaveResult =
  | { ok: true; product: Product }
  | {
      ok: false;
      reason: "invalid" | "exists" | "not-found";
      issues: ValidationIssue[];
    };

export async function saveProduct(
  mode: "create" | "update",
  input: unknown,
  /** For updates: the product addressed by the URL. The ID cannot change. */
  expectedId?: string,
): Promise<SaveResult> {
  const parsed = productSchema.safeParse(input);
  if (!parsed.success) {
    return {
      ok: false,
      reason: "invalid",
      issues: toValidationIssues(parsed.error),
    };
  }
  const product = parsed.data;
  if (expectedId !== undefined && product.id !== normalizeId(expectedId)) {
    return {
      ok: false,
      reason: "invalid",
      issues: [
        {
          path: ["id"],
          message:
            "Die ID eines bestehenden Produkts kann nicht geändert werden.",
        },
      ],
    };
  }

  try {
    const saved =
      mode === "create"
        ? await createProduct(product)
        : await updateProduct(product);
    return { ok: true, product: saved };
  } catch (error) {
    if (error instanceof ProductExistsError) {
      return {
        ok: false,
        reason: "exists",
        issues: [
          {
            path: ["id"],
            message: `Die ID ${product.id} ist bereits vergeben. Bitte wählen Sie eine andere.`,
          },
        ],
      };
    }
    if (error instanceof ProductNotFoundError) {
      return {
        ok: false,
        reason: "not-found",
        issues: [
          {
            path: [],
            message: `Das Produkt ${product.id} gibt es nicht mehr. Vielleicht wurde es gelöscht.`,
          },
        ],
      };
    }
    throw error;
  }
}
