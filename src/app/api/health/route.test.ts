import { describe, expect, it } from "vitest";
import packageJson from "../../../../package.json";
import { GET } from "./route";

describe("GET /api/health", () => {
  it("reports ok and the package.json version", async () => {
    const response = GET();

    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({
      status: "ok",
      version: packageJson.version,
    });
  });
});
