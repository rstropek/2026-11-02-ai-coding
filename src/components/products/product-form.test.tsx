import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ToastProvider } from "@/components/ui/toast";
import type { Product } from "@/lib/products/schema";
import { ProductForm, type SaveProductAction } from "./product-form";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

const product: Product = {
  id: "GATEWAY",
  description: "Gateway",
  available: true,
  price: 2450,
  links: [],
  tags: ["IoT"],
  features: [{ id: "VPN", description: "VPN", fields: [] }],
};

function renderForm(props: Partial<Parameters<typeof ProductForm>[0]> = {}) {
  const saveAction = vi.fn<SaveProductAction>(async () => ({
    ok: false,
    issues: [],
  }));
  render(
    <ToastProvider>
      <ProductForm
        knownTags={["IoT", "Hardware"]}
        cancelHref="/produkte"
        saveAction={saveAction}
        {...props}
      />
    </ToastProvider>,
  );
  return { saveAction, user: userEvent.setup() };
}

describe("ProductForm", () => {
  it("lists all problems above the form instead of saving", async () => {
    const { saveAction, user } = renderForm();

    await user.click(screen.getByRole("button", { name: "Produkt anlegen" }));

    const summary = screen.getByRole("alert");
    expect(
      within(summary).getByText("Bitte prüfen Sie 3 Angaben"),
    ).toBeVisible();
    expect(
      within(summary).getByRole("link", {
        name: "Bitte geben Sie eine ID ein.",
      }),
    ).toBeVisible();
    expect(screen.getByLabelText(/^ID/)).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    expect(saveAction).not.toHaveBeenCalled();
  });

  it("validates a field when it loses focus", async () => {
    const { user } = renderForm();

    await user.type(screen.getByLabelText(/^Preis/), "12,345");
    await user.tab();

    expect(
      screen.getByText(/Bitte geben Sie den Preis als Zahl/),
    ).toBeVisible();
  });

  it("saves the product with its features, fields, links and tags", async () => {
    const { saveAction, user } = renderForm();

    await user.type(screen.getByLabelText(/^ID/), "scan-d500");
    await user.type(
      screen.getByLabelText(/^Beschreibung/),
      "Dokumentenscanner",
    );
    await user.type(screen.getByLabelText(/^Preis/), "849");
    await user.click(screen.getByRole("button", { name: "Link hinzufügen" }));
    await user.type(screen.getByLabelText("Link 1"), "docs.example.com/scan");
    await user.type(screen.getByLabelText("Tag hinzufügen"), "Büro{Enter}");
    await user.click(
      screen.getByRole("button", { name: "Feature hinzufügen" }),
    );
    await user.type(screen.getByLabelText(/^Feature-ID/), "ocr");
    await user.type(
      screen.getAllByLabelText(/^Beschreibung/)[1] as HTMLElement,
      "Texterkennung",
    );
    await user.click(screen.getByRole("button", { name: "Feld hinzufügen" }));
    await user.type(screen.getByLabelText("Feldname 1"), "Gültig bis");
    await user.selectOptions(
      screen.getByLabelText("Datentyp von Feld 1"),
      "Datum",
    );
    await user.click(screen.getByRole("button", { name: "Produkt anlegen" }));

    expect(saveAction).toHaveBeenCalledWith(
      "create",
      {
        id: "scan-d500",
        description: "Dokumentenscanner",
        price: 849,
        available: true,
        links: ["https://docs.example.com/scan"],
        tags: ["Büro"],
        features: [
          {
            id: "ocr",
            description: "Texterkennung",
            fields: [{ name: "Gültig bis", type: "date" }],
          },
        ],
      },
      undefined,
    );
  });

  it("shows problems reported by the server", async () => {
    const { saveAction, user } = renderForm({ product });
    saveAction.mockResolvedValueOnce({
      ok: false,
      issues: [{ path: ["features", 0, "description"], message: "Zu kurz." }],
    });

    await user.click(
      screen.getByRole("button", { name: "Änderungen speichern" }),
    );

    expect(saveAction).toHaveBeenCalledWith(
      "update",
      expect.objectContaining({ id: "GATEWAY" }),
      "GATEWAY",
    );
    expect(
      await screen.findByRole("link", { name: "VPN: Zu kurz." }),
    ).toBeVisible();
  });

  it("keeps the ID of saved products and features fixed", () => {
    renderForm({ product, initialFeature: "VPN" });

    expect(screen.getByLabelText(/^ID/)).toHaveAttribute("readonly");
    expect(screen.getByLabelText(/^Feature-ID/)).toHaveAttribute("readonly");
  });

  it("removes a feature with undo", async () => {
    const { user } = renderForm({ product, initialFeature: "VPN" });

    await user.click(screen.getByRole("button", { name: "Feature entfernen" }));
    expect(screen.queryByLabelText(/^Feature-ID/)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Rückgängig" }));
    expect(screen.getByText("VPN", { selector: "summary span" })).toBeVisible();
  });

  it("previews what unlocking the feature asks for", async () => {
    const { user } = renderForm({ product, initialFeature: "VPN" });

    expect(
      screen.getByText(
        "Vorschau: Die Freischaltung fragt keine Zusatzinformationen ab.",
      ),
    ).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Feld hinzufügen" }));
    await user.type(screen.getByLabelText("Feldname 1"), "Anzahl");
    await user.selectOptions(
      screen.getByLabelText("Datentyp von Feld 1"),
      "Ganzzahl",
    );

    expect(
      screen.getByText(
        "Vorschau: Die Freischaltung fragt 1 Angabe ab: Anzahl (Ganzzahl).",
      ),
    ).toBeInTheDocument();
  });
});
