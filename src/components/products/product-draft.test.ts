import { describe, expect, it } from "vitest";
import type { Product } from "@/lib/products/schema";
import {
  emptyFeature,
  errorsByTarget,
  ids,
  nextKey,
  summaryText,
  toDraft,
  toInput,
  toProblems,
  validate,
} from "./product-draft";

const product: Product = {
  id: "GATEWAY",
  description: "Gateway",
  available: true,
  price: 2450,
  links: ["https://docs.example.com"],
  tags: ["IoT"],
  features: [
    {
      id: "VPN",
      description: "VPN",
      fields: [{ name: "Host", type: "text" }],
    },
  ],
};

describe("product draft", () => {
  it("round-trips a product through the form state", () => {
    const draft = toDraft(product);
    expect(draft.price).toBe("2.450,00");
    expect(draft.features[0]?.persisted).toBe(true);
    expect(toInput(draft)).toEqual(product);
    expect(validate(draft)).toEqual([]);
  });

  it("ignores links left empty", () => {
    const draft = toDraft(product);
    draft.links.push({ key: nextKey(), url: "  " });
    expect(toInput(draft).links).toEqual(["https://docs.example.com"]);
  });

  it("explains an unparsable price", () => {
    const draft = { ...toDraft(product), price: "12,345" };
    expect(validate(draft)).toEqual([
      {
        target: ids.price,
        message:
          "Bitte geben Sie den Preis als Zahl mit höchstens zwei Nachkommastellen ein, zum Beispiel 1.290,00.",
      },
    ]);
  });

  it("asks for a price when it is empty", () => {
    expect(validate({ ...toDraft(product), price: "" })).toEqual([
      { target: ids.price, message: "Bitte geben Sie einen Preis ein." },
    ]);
  });

  it("attaches feature and field problems to their controls", () => {
    const draft = toDraft(product);
    const feature = draft.features[0];
    if (!feature?.fields[0]) throw new Error("fixture");
    feature.fields[0].name = "";
    const added = emptyFeature();
    draft.features.push(added);

    const problems = validate(draft);
    const fieldKey = feature.fields[0].key;
    expect(problems).toEqual([
      {
        target: ids.fieldName(feature.key, fieldKey),
        message: "Bitte geben Sie einen Feldnamen ein.",
        context: "VPN, Feld 1",
      },
      {
        target: ids.featureId(added.key),
        message: "Bitte geben Sie eine Feature-ID ein.",
        context: "Feature 2",
      },
      {
        target: ids.featureDescription(added.key),
        message: "Bitte beschreiben Sie das Feature.",
        context: "Feature 2",
      },
    ]);
    expect(problems.map(summaryText)[0]).toBe(
      "VPN, Feld 1: Bitte geben Sie einen Feldnamen ein.",
    );
    expect(errorsByTarget(problems).get(ids.featureId(added.key))).toBe(
      "Bitte geben Sie eine Feature-ID ein.",
    );
  });

  it("maps link problems past empty links to the right row", () => {
    const draft = toDraft(product);
    const empty = { key: nextKey(), url: "" };
    const bad = { key: nextKey(), url: "http://x.example.com" };
    draft.links = [empty, ...draft.links, bad];
    expect(validate(draft)).toEqual([
      {
        target: ids.link(bad.key),
        message:
          "Der Link muss mit https:// beginnen und eine gültige Adresse sein.",
        context: "Link 3",
      },
    ]);
  });

  it("maps server issues without a known control to the form", () => {
    expect(
      toProblems([{ path: ["unknown"], message: "Fehler" }], toDraft(product)),
    ).toEqual([{ target: ids.form, message: "Fehler" }]);
  });
});
