import { expect, type Page, test } from "@playwright/test";

// The server starts on a fresh copy of testdata/ (see playwright.config.ts).
// Tests that change data use their own product, so they can run in parallel.
// Pages visited before stay hidden in the DOM, so queries use roles, which
// skip hidden elements.

// Buttons that need JavaScript are enabled once the page has hydrated;
// typing into a form before that would be lost.
const ready = (page: Page, button: string) =>
  expect(page.getByRole("button", { name: button, exact: true })).toBeEnabled();

const uniqueId = (prefix: string) =>
  `${prefix}-${Date.now().toString(36).toUpperCase()}`;

test("lists the products and opens one with its features", async ({ page }) => {
  await page.goto("/");

  await expect(
    page.getByRole("heading", { name: "Produkte", level: 1 }),
  ).toBeVisible();
  const table = page.getByRole("table", { name: "Produkte" });
  await expect(table.getByRole("link", { name: "KASSE-T200" })).toBeVisible();
  await expect(table.getByRole("row", { name: /DISPLAY-K15/ })).toContainText(
    "Nicht verfügbar",
  );

  await table.getByRole("link", { name: "GATEWAY-IOT4" }).click();

  await expect(
    page.getByRole("heading", { name: "GATEWAY-IOT4" }),
  ).toBeVisible();
  const features = page.getByRole("table", {
    name: "Features von GATEWAY-IOT4",
  });
  await expect(
    features.getByRole("row", { name: /FERNWARTUNG/ }),
  ).toContainText("Gültig bis");
});

test("creates, edits, deactivates and deletes a product", async ({ page }) => {
  const id = uniqueId("E2E");
  await page.goto("/produkte");
  await page.getByRole("link", { name: "Produkt anlegen" }).click();
  await ready(page, "Produkt anlegen");

  await page.getByRole("textbox", { name: "ID", exact: true }).fill(id);
  await page
    .getByRole("textbox", { name: "Beschreibung", exact: true })
    .fill("Testgerät aus dem End-to-End-Test");
  await page
    .getByRole("textbox", { name: "Preis", exact: true })
    .fill("1.234,50");
  await page.getByRole("button", { name: "Link hinzufügen" }).click();
  await page
    .getByRole("textbox", { name: "Link 1", exact: true })
    .fill("https://docs.example.com/e2e");
  await page.getByRole("combobox", { name: "Tag hinzufügen" }).fill("Test");
  await page.getByRole("combobox", { name: "Tag hinzufügen" }).press("Enter");
  await page.getByRole("button", { name: "Feature hinzufügen" }).click();
  await page
    .getByRole("textbox", { name: "Feature-ID", exact: true })
    .fill("lizenz-a");
  await page
    .getByRole("textbox", { name: "Beschreibung", exact: true })
    .nth(1)
    .fill("Erstes Feature");
  await page.getByRole("button", { name: "Feld hinzufügen" }).click();
  await page.getByRole("textbox", { name: "Feldname 1" }).fill("Gültig bis");
  await page
    .getByRole("combobox", { name: "Datentyp von Feld 1" })
    .selectOption("Datum");
  await page.getByRole("button", { name: "Produkt anlegen" }).click();

  await expect(page.getByRole("heading", { name: id })).toBeVisible();
  await expect(
    page.getByRole("status").getByText(`Produkt ${id} angelegt.`),
  ).toBeVisible();
  await expect(page.getByText("1.234,50 €")).toBeVisible();
  await expect(
    page
      .getByRole("table", { name: `Features von ${id}` })
      .getByRole("row", { name: /LIZENZ-A/ }),
  ).toContainText("Gültig bis");

  // Edit: change the price and add a second feature.
  await page.getByRole("link", { name: "Bearbeiten", exact: true }).click();
  await ready(page, "Änderungen speichern");
  await page.getByRole("textbox", { name: "Preis", exact: true }).fill("99");
  await page.getByRole("button", { name: "Feature hinzufügen" }).click();
  // Saved features are collapsed, so the new one is the only open feature.
  await page
    .getByRole("textbox", { name: "Feature-ID", exact: true })
    .fill("ohne-felder");
  await page
    .getByRole("textbox", { name: "Beschreibung", exact: true })
    .last()
    .fill("Ohne Zusatzinformationen");
  await page.getByRole("button", { name: "Änderungen speichern" }).click();

  await expect(
    page.getByRole("status").getByText(`Änderungen an ${id} gespeichert.`),
  ).toBeVisible();
  await expect(page.getByText("99,00 €")).toBeVisible();
  await expect(
    page.getByRole("table", { name: `Features von ${id}` }).getByRole("row"),
  ).toHaveCount(3);

  // Deactivate; the badge changes.
  await ready(page, "Deaktivieren");
  await page.getByRole("button", { name: "Deaktivieren" }).click();
  await expect(page.getByRole("button", { name: "Aktivieren" })).toBeVisible();
  await expect(
    // Pages visited before stay hidden in the DOM; only the visible badge counts.
    page
      .getByText("Nicht verfügbar", { exact: true })
      .filter({ visible: true }),
  ).toBeVisible();

  // Delete after confirmation.
  await page.getByRole("button", { name: "Produkt löschen" }).click();
  const dialog = page.getByRole("dialog", { name: `${id} löschen?` });
  await dialog.getByRole("button", { name: "Produkt löschen" }).click();

  await expect(
    page.getByRole("heading", { name: "Produkte", level: 1 }),
  ).toBeVisible();
  await expect(
    page.getByRole("status").getByText(`Produkt ${id} gelöscht.`),
  ).toBeVisible();
  await expect(page.getByRole("link", { name: id })).toHaveCount(0);
});

test("shows problems the server reports instead of saving", async ({
  page,
}) => {
  await page.goto("/produkte/neu");
  await ready(page, "Produkt anlegen");
  await page
    .getByRole("textbox", { name: "ID", exact: true })
    .fill("KASSE-T200");
  await page
    .getByRole("textbox", { name: "Beschreibung", exact: true })
    .fill("Doppelt");
  await page.getByRole("textbox", { name: "Preis", exact: true }).fill("10");
  await page.getByRole("button", { name: "Produkt anlegen" }).click();

  // Only the server knows that the ID is taken.
  await expect(
    page.getByRole("link", {
      name: "Die ID KASSE-T200 ist bereits vergeben. Bitte wählen Sie eine andere.",
    }),
  ).toBeVisible();
  await expect(
    page.getByRole("textbox", { name: "ID", exact: true }),
  ).toHaveAttribute("aria-invalid", "true");
});

test("product API reads all products and validates writes", async ({
  request,
}) => {
  const list = await request.get("/api/products");
  expect(list.ok()).toBe(true);
  const products: { id: string; features: unknown[] }[] = await list.json();
  expect(products.map((p) => p.id)).toEqual(
    expect.arrayContaining(["KASSE-T200", "SCAN-D500"]),
  );
  expect(products.find((p) => p.id === "KASSE-T200")?.features).toHaveLength(4);

  const invalid = await request.post("/api/products", {
    data: { id: "X", price: "teuer" },
  });
  expect(invalid.status()).toBe(400);

  const id = uniqueId("API");
  const created = await request.post("/api/products", {
    data: { id, description: "API-Test", available: true, price: 1 },
  });
  expect(created.status()).toBe(201);
  const updated = await request.put(`/api/products/${id}`, {
    data: {
      id,
      description: "API-Test",
      available: false,
      price: 2,
      features: [],
    },
  });
  expect(await updated.json()).toMatchObject({ available: false, price: 2 });
  expect((await request.delete(`/api/products/${id}`)).status()).toBe(204);
});
