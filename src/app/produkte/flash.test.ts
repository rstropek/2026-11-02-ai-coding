import { describe, expect, it } from "vitest";
import { flashMessage, flashUrl } from "./flash";

describe("flash messages", () => {
  it("round-trips through the URL", () => {
    const url = new URL(
      flashUrl("/produkte/A", { meldung: "gespeichert", name: "A" }),
      "http://localhost",
    );
    expect(flashMessage(Object.fromEntries(url.searchParams))).toBe(
      "Änderungen an A gespeichert.",
    );
  });

  it("ignores unknown keys and names that are not product IDs", () => {
    expect(flashMessage({ meldung: "toString", name: "A" })).toBeUndefined();
    expect(
      flashMessage({ meldung: "geloescht", name: "Rufen Sie 0800 an" }),
    ).toBeUndefined();
    expect(flashMessage({})).toBeUndefined();
  });
});
