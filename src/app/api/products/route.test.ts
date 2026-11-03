// @vitest-environment node
import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DELETE, PUT } from "./[id]/route";
import { GET, POST } from "./route";

const body = {
  id: "gateway",
  description: "Gateway",
  available: true,
  price: 2450,
  features: [
    {
      id: "vpn",
      description: "VPN",
      fields: [{ name: "Gegenstelle", type: "text" }],
    },
  ],
};

const json = (method: string, data: unknown) =>
  new Request("http://localhost/api/products", {
    method,
    headers: { "content-type": "application/json" },
    body: typeof data === "string" ? data : JSON.stringify(data),
  });

const context = (id: string) => ({ params: Promise.resolve({ id }) });

let dataDir: string;

beforeEach(async () => {
  dataDir = await mkdtemp(path.join(tmpdir(), "api-"));
  vi.stubEnv("DATA_DIR", dataDir);
});

afterEach(async () => {
  vi.unstubAllEnvs();
  await rm(dataDir, { recursive: true, force: true });
});

describe("product API", () => {
  it("creates a product and returns it normalized", async () => {
    const response = await POST(json("POST", body));
    expect(response.status).toBe(201);
    expect(await response.json()).toMatchObject({
      id: "GATEWAY",
      links: [],
      tags: [],
      features: [{ id: "VPN" }],
    });
  });

  it("returns all products with their features", async () => {
    await POST(json("POST", body));
    await POST(json("POST", { ...body, id: "ALPHA" }));
    const response = await GET();
    expect(response.status).toBe(200);
    const products = await response.json();
    expect(products.map((p: { id: string }) => p.id)).toEqual([
      "ALPHA",
      "GATEWAY",
    ]);
    expect(products[0].features[0].fields).toEqual([
      { name: "Gegenstelle", type: "text" },
    ]);
  });

  it("rejects invalid products with the validation issues", async () => {
    const response = await POST(json("POST", { ...body, price: -1 }));
    expect(response.status).toBe(400);
    expect(await response.json()).toEqual({
      error: "invalid",
      issues: [
        { path: ["price"], message: "Der Preis darf nicht negativ sein." },
      ],
    });
  });

  it("rejects bodies that are not JSON", async () => {
    expect((await POST(json("POST", "{"))).status).toBe(400);
    expect((await PUT(json("PUT", "{"), context("GATEWAY"))).status).toBe(400);
  });

  it("answers 409 when the ID is taken", async () => {
    await POST(json("POST", body));
    expect((await POST(json("POST", body))).status).toBe(409);
  });

  it("replaces a product as a whole", async () => {
    await POST(json("POST", body));
    const response = await PUT(
      json("PUT", { ...body, features: [] }),
      context("GATEWAY"),
    );
    expect(response.status).toBe(200);
    expect((await response.json()).features).toEqual([]);
  });

  it("does not change the ID or update missing products", async () => {
    await POST(json("POST", body));
    expect(
      (await PUT(json("PUT", { ...body, id: "OTHER" }), context("GATEWAY")))
        .status,
    ).toBe(400);
    expect(
      (await PUT(json("PUT", { ...body, id: "NEW" }), context("NEW"))).status,
    ).toBe(404);
  });

  it("deletes products", async () => {
    await POST(json("POST", body));
    const request = new Request("http://localhost", { method: "DELETE" });
    expect((await DELETE(request, context("GATEWAY"))).status).toBe(204);
    expect((await DELETE(request, context("GATEWAY"))).status).toBe(404);
  });
});
