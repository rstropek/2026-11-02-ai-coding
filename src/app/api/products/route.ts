import { listProducts } from "@/lib/products/repository";
import { saveProduct } from "@/lib/products/service";
import { invalidJson, readJson, saveResponse } from "./http";

/**
 * All products with all their features, sorted by ID. There are no filters
 * yet. Files that fail schema validation are logged and left out.
 */
export async function GET(): Promise<Response> {
  const { products } = await listProducts();
  return Response.json(products);
}

/** Creates a product including its features. 409 if the ID is taken. */
export async function POST(request: Request): Promise<Response> {
  const body = await readJson(request);
  if (body === undefined) {
    return invalidJson();
  }
  return saveResponse(await saveProduct("create", body), 201);
}
