import {
  Client,
  StreamableHTTPClientTransport,
} from "@modelcontextprotocol/client";
import { expect, test } from "@playwright/test";

// Checks that the MCP endpoint works in the production build and reads the
// test data from DATA_DIR. Protocol details are covered by the unit tests.
test("MCP clients get the test products from list_products", async ({
  baseURL,
}) => {
  const client = new Client(
    { name: "e2e", version: "0.0.0" },
    { versionNegotiation: { mode: "auto" } },
  );
  await client.connect(
    new StreamableHTTPClientTransport(new URL("/api/mcp", baseURL)),
  );

  try {
    expect(client.getNegotiatedProtocolVersion()).toBe("2026-07-28");
    const result = await client.callTool({ name: "list_products" });
    const { products } = result.structuredContent as {
      products: { id: string }[];
    };
    // Other e2e tests add and remove products in parallel.
    expect(products.map((product) => product.id)).toEqual(
      expect.arrayContaining([
        "DISPLAY-K15",
        "GATEWAY-IOT4",
        "KARTENLESER-C3",
        "KASSE-T200",
        "SCAN-D500",
      ]),
    );
  } finally {
    await client.close();
  }
});
