import { describe, expect, it } from "vitest";
import { isValidId, type ProductInput, productSchema } from "./schema";

const valid: ProductInput = {
  id: "kasse-t200",
  description: "  Kassenterminal  ",
  available: true,
  price: 1290.5,
  links: ["https://docs.example.com/kasse"],
  tags: ["Einzelhandel"],
  features: [
    {
      id: "fiskal-tse",
      description: "TSE",
      fields: [
        { name: "Seriennummer", type: "text" },
        { name: "Anzahl", type: "integer" },
        { name: "Gültig bis", type: "date" },
      ],
    },
  ],
};

function issues(input: unknown) {
  const result = productSchema.safeParse(input);
  return result.success
    ? []
    : result.error.issues.map((i) => ({ path: i.path, message: i.message }));
}

describe("productSchema", () => {
  it("accepts a valid product and normalizes IDs and text", () => {
    const product = productSchema.parse(valid);
    expect(product.id).toBe("KASSE-T200");
    expect(product.description).toBe("Kassenterminal");
    expect(product.features[0]?.id).toBe("FISKAL-TSE");
  });

  it("defaults missing lists to empty lists", () => {
    const product = productSchema.parse({
      id: "A",
      description: "B",
      available: false,
      price: 0,
    });
    expect(product).toMatchObject({ links: [], tags: [], features: [] });
  });

  it.each([
    ["", "Bitte geben Sie eine ID ein."],
    ["A".repeat(21), "Die ID darf höchstens 20 Zeichen haben."],
    ["-ABC", "Die ID darf nur"],
    ["KASSE T200", "Die ID darf nur"],
    ["../ETC", "Die ID darf nur"],
  ])("rejects the ID %j", (id, message) => {
    expect(issues({ ...valid, id })).toEqual([
      { path: ["id"], message: expect.stringContaining(message) },
    ]);
  });

  it("limits the description to 1000 characters", () => {
    expect(issues({ ...valid, description: "x".repeat(1000) })).toEqual([]);
    expect(issues({ ...valid, description: "x".repeat(1001) })).toEqual([
      {
        path: ["description"],
        message: "Die Beschreibung darf höchstens 1000 Zeichen haben.",
      },
    ]);
  });

  it.each([
    [-1, "Der Preis darf nicht negativ sein."],
    [1.005, "Der Preis darf höchstens zwei Nachkommastellen haben."],
    ["12", "Bitte geben Sie einen Preis ein."],
  ])("rejects the price %j", (price, message) => {
    expect(issues({ ...valid, price })).toEqual([{ path: ["price"], message }]);
  });

  it.each([
    "http://example.com",
    "example.com",
    "https://intranet",
    "https://",
  ])("rejects the link %j", (link) => {
    expect(issues({ ...valid, links: [link] })).toEqual([
      {
        path: ["links", 0],
        message:
          "Der Link muss mit https:// beginnen und eine gültige Adresse sein.",
      },
    ]);
  });

  it("reports duplicates where they occur", () => {
    const feature = valid.features?.[0];
    expect(
      issues({
        ...valid,
        links: ["https://a.example.com", "https://a.example.com"],
        tags: ["IoT", "iot"],
        features: [
          {
            id: "VPN",
            description: "x",
            fields: [
              { name: "Host", type: "text" },
              { name: "host", type: "date" },
            ],
          },
          { ...feature, id: "vpn" },
        ],
      }),
    ).toEqual([
      {
        path: ["features", 0, "fields", 1, "name"],
        message: "Der Feldname „host“ kommt mehrfach vor.",
      },
      { path: ["links", 1], message: "Dieser Link ist bereits eingetragen." },
      { path: ["tags", 1], message: "Der Tag „iot“ ist bereits vergeben." },
      {
        path: ["features", 1, "id"],
        message: "Die Feature-ID VPN kommt mehrfach vor.",
      },
    ]);
  });

  it("only accepts the three field types", () => {
    expect(
      issues({
        ...valid,
        features: [
          { id: "X", description: "x", fields: [{ name: "N", type: "bool" }] },
        ],
      }),
    ).toEqual([
      {
        path: ["features", 0, "fields", 0, "type"],
        message: "Bitte wählen Sie Text, Ganzzahl oder Datum als Datentyp.",
      },
    ]);
  });
});

describe("isValidId", () => {
  it("accepts normalized IDs only", () => {
    expect(isValidId("KASSE-T200")).toBe(true);
    expect(isValidId("kasse-t200")).toBe(false);
    expect(isValidId("../x")).toBe(false);
  });
});
