import type { SaveResult } from "@/lib/products/service";

// Shared response helpers of the product API.

/** Reads a JSON body; returns undefined if it is not valid JSON. */
export async function readJson(request: Request): Promise<unknown> {
  try {
    return await request.json();
  } catch {
    return undefined;
  }
}

export function invalidJson(): Response {
  return Response.json(
    { error: "The request body must be a JSON product." },
    { status: 400 },
  );
}

const statusByReason = { invalid: 400, exists: 409, "not-found": 404 };

export function saveResponse(result: SaveResult, successStatus: number) {
  if (result.ok) {
    return Response.json(result.product, { status: successStatus });
  }
  return Response.json(
    { error: result.reason, issues: result.issues },
    { status: statusByReason[result.reason] },
  );
}
