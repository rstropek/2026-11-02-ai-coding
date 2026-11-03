"use server";

import { refresh } from "next/cache";
import { redirect } from "next/navigation";
import {
  deleteProduct,
  getProduct,
  ProductNotFoundError,
  updateProduct,
} from "@/lib/products/repository";
import type { ValidationIssue } from "@/lib/products/schema";
import { saveProduct } from "@/lib/products/service";
import { flashUrl } from "./flash";

// Server Actions of the product pages. They accept untrusted input (anyone can
// POST to them), so everything goes through the same validation as the API.
// There is no login yet; authorization comes with the login iteration.

export type FormActionResult = {
  ok: false;
  issues: ValidationIssue[];
  /** General problem, shown above the form. */
  message?: string;
};

export type ActionResult = { ok: true } | { ok: false; message: string };

/** Creates or replaces a product with all features, then opens its detail page. */
export async function saveProductAction(
  mode: "create" | "update",
  input: unknown,
  expectedId?: string,
): Promise<FormActionResult> {
  let id: string;
  try {
    const result = await saveProduct(mode, input, expectedId);
    if (!result.ok) {
      const general = result.issues.find((issue) => issue.path.length === 0);
      return { ok: false, issues: result.issues, message: general?.message };
    }
    id = result.product.id;
  } catch (error) {
    console.error("Saving product failed", error);
    return {
      ok: false,
      issues: [],
      message:
        "Das Produkt konnte nicht gespeichert werden. Bitte versuchen Sie es erneut.",
    };
  }
  // redirect() throws to navigate, so it stays outside the try block.
  redirect(
    flashUrl(`/produkte/${encodeURIComponent(id)}`, {
      meldung: mode === "create" ? "angelegt" : "gespeichert",
      name: id,
    }),
  );
}

/** Activates or deactivates a product ("Aktuell verfügbar"). */
export async function setAvailabilityAction(
  id: string,
  available: boolean,
): Promise<ActionResult> {
  try {
    const product = await getProduct(id);
    if (!product) {
      return { ok: false, message: `Das Produkt ${id} gibt es nicht mehr.` };
    }
    await updateProduct({ ...product, available });
  } catch (error) {
    console.error("Changing availability failed", error);
    return {
      ok: false,
      message:
        "Die Verfügbarkeit konnte nicht geändert werden. Bitte versuchen Sie es erneut.",
    };
  }
  refresh();
  return { ok: true };
}

/** Deletes a product with its features, then opens the product list. */
export async function deleteProductAction(id: string): Promise<ActionResult> {
  try {
    await deleteProduct(id);
  } catch (error) {
    if (!(error instanceof ProductNotFoundError)) {
      console.error("Deleting product failed", error);
      return {
        ok: false,
        message:
          "Das Produkt konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.",
      };
    }
    // Already gone: the list is where the user wanted to end up anyway.
  }
  redirect(flashUrl("/produkte", { meldung: "geloescht", name: id }));
}
