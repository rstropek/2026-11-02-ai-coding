import { deleteProduct, ProductNotFoundError } from "@/lib/products/repository";
import { normalizeId } from "@/lib/products/schema";
import { saveProduct } from "@/lib/products/service";
import { invalidJson, readJson, saveResponse } from "../http";

/** Replaces an existing product, including all features. */
export async function PUT(
  request: Request,
  { params }: RouteContext<"/api/products/[id]">,
): Promise<Response> {
  const { id } = await params;
  const body = await readJson(request);
  if (body === undefined) {
    return invalidJson();
  }
  return saveResponse(await saveProduct("update", body, id), 200);
}

/** Deletes a product with all its features. */
export async function DELETE(
  _request: Request,
  { params }: RouteContext<"/api/products/[id]">,
): Promise<Response> {
  const { id } = await params;
  try {
    await deleteProduct(normalizeId(id));
    return new Response(null, { status: 204 });
  } catch (error) {
    if (error instanceof ProductNotFoundError) {
      return Response.json({ error: "not-found" }, { status: 404 });
    }
    throw error;
  }
}
