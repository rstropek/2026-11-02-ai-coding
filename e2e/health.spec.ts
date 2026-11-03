import { expect, test } from "@playwright/test";
import packageJson from "../package.json";

test("health endpoint reports ok and the app version", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({
    status: "ok",
    version: packageJson.version,
  });
});
