import { createMcpHandler, McpServer } from "@modelcontextprotocol/server";
import { z } from "zod";
import { listProducts } from "@/lib/products/repository";
import { productSchema } from "@/lib/products/schema";
import packageJson from "../../../../package.json";

/**
 * MCP server (Streamable HTTP, spec 2026-07-28) with read-only access to the
 * product data. 2025-era clients are served statelessly as well. There is no
 * authentication yet, like the REST API.
 *
 * The handler is created once per module; the factory runs per request and
 * builds a fresh McpServer, so no MCP state survives between requests.
 */
const handler = createMcpHandler(() => {
  const server = new McpServer(
    { name: "license-management", version: packageJson.version },
    {
      // The tool list only changes with a deployment.
      cacheHints: { "tools/list": { ttlMs: 300_000, cacheScope: "public" } },
    },
  );

  server.registerTool(
    "list_products",
    {
      title: "Produkte auflisten",
      description:
        "Liefert alle Produkte der Lizenzverwaltung, sortiert nach ID, jeweils mit Beschreibung, Preis in EUR, Verfügbarkeit, Links, Tags und den freischaltbaren Features samt deren Zusatzfeldern.",
      outputSchema: z.object({ products: z.array(productSchema) }),
      annotations: {
        readOnlyHint: true,
        destructiveHint: false,
        idempotentHint: true,
        openWorldHint: false,
      },
    },
    async () => {
      // structuredContent must be an object, so the list is wrapped.
      const { products } = await listProducts();
      const result = { products };
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
        structuredContent: result,
      };
    },
  );

  return server;
});

// GET and DELETE are answered by the SDK (405: no standalone stream, no
// sessions), which is what 2025-era clients expect from a stateless server.
export function POST(request: Request): Promise<Response> {
  return handler.fetch(request);
}

export function GET(request: Request): Promise<Response> {
  return handler.fetch(request);
}

export function DELETE(request: Request): Promise<Response> {
  return handler.fetch(request);
}
