/** Liveness endpoint, used by the Docker HEALTHCHECK and smoke tests. */
export function GET(): Response {
  return Response.json({ status: "ok" });
}
