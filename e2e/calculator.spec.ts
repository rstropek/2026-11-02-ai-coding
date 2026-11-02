import { expect, test } from "@playwright/test";

test("adds two numbers on the start page", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Lizenzverwaltung" }),
  ).toBeVisible();

  await page.getByLabel("Erste Zahl").fill("19");
  await page.getByLabel("Zweite Zahl").fill("23");

  await expect(page.getByRole("status")).toHaveText("Summe: 42");
});

test("health endpoint reports ok", async ({ request }) => {
  const response = await request.get("/api/health");

  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok" });
});
