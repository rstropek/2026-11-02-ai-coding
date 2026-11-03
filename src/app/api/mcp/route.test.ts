// @vitest-environment node
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createProduct } from "@/lib/products/repository";
import { productSchema } from "@/lib/products/schema";
import packageJson from "../../../../package.json";
import { DELETE, GET, POST } from "./route";

const url = "http://localhost/api/mcp";
const routes: Record<string, (request: Request) => Promise<Response>> = {
  GET,
  POST,
  DELETE,
};

/** Sends the client's HTTP requests straight to the route handlers. */
const fetchRoute = (input: string | URL, init?: RequestInit) => {
  const request = new Request(input, init);
  const route = routes[request.method];
  return route
    ? route(request)
    : Promise.resolve(new Response(null, { status: 405 }));
};

async function connect(mode: "auto" | "legacy") {
  const client = new Client(
    { name: "test", version: "0.0.0" },
    { versionNegotiation: { mode } },
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL(url), { fetch: fetchRoute }),
  );
  return client;
}

const product = (id: string) =>
  productSchema.parse({
    id,
    description: `Produkt ${id}`,
    available: true,
    price: 10,
    features: [{ id: "F1", description: "Feature", fields: [] }],
  });

let dataDir: string;
let client: Client | undefined;

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), "mcp-"));
  vi.stubEnv("DATA_DIR", dataDir);
});

afterEach(async () => {
  await client?.close();
  client = undefined;
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  await rm(dataDir, { recursive: true, force: true });
});

describe("MCP server", () => {
  it("speaks 2026-07-28 and reports the app version", async () => {
    client = await connect("auto");

    expect(client.getNegotiatedProtocolVersion()).toBe("2026-07-28");
    expect(client.getServerVersion()).toMatchObject({
      name: "license-management",
      version: packageJson.version,
    });
  });

  it("offers list_products as a read-only tool", async () => {
    client = await connect("auto");

    const { tools } = await client.listTools();
    expect(tools.map((tool) => tool.name)).toEqual(["list_products"]);
    expect(tools[0]).toMatchObject({
      title: "Produkte auflisten",
      annotations: { readOnlyHint: true, destructiveHint: false },
      outputSchema: { type: "object", required: ["products"] },
    });
  });

  it.each(["auto", "legacy"] as const)(
    "returns all valid products sorted by ID (%s client)",
    async (mode) => {
      await createProduct(product("B"));
      await createProduct(product("A"));
      await mkdir(path.join(dataDir, "products"), { recursive: true });
      await writeFile(path.join(dataDir, "products", "BROKEN.json"), "{");
      vi.spyOn(console, "error").mockImplementation(() => {});
      client = await connect(mode);

      const result = await client.callTool({ name: "list_products" });

      expect(result.isError).toBeFalsy();
      const expected = { products: [product("A"), product("B")] };
      expect(result.structuredContent).toEqual(expected);
      expect(result.content).toEqual([
        { type: "text", text: JSON.stringify(expected) },
      ]);
    },
  );

  it("returns an empty list while there are no products", async () => {
    client = await connect("auto");

    const result = await client.callTool({ name: "list_products" });

    expect(result.structuredContent).toEqual({ products: [] });
  });

  it("answers GET with 405 because there is no standalone stream", async () => {
    const response = await GET(
      new Request(url, { headers: { accept: "text/event-stream" } }),
    );
    expect(response.status).toBe(405);
  });
});
