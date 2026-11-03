import { describe, expect, it } from "vitest";
import { formatDecimal, formatPrice, parsePrice, plural } from "./format";

// Intl uses a narrow no-break space before the euro sign.
const nbsp = (text: string) => text.replace(/\s/g, " ");

describe("formatPrice", () => {
  it("formats euros the German way", () => {
    expect(nbsp(formatPrice(1290))).toBe("1.290,00 €");
    expect(nbsp(formatPrice(12.5))).toBe("12,50 €");
  });
});

describe("formatDecimal", () => {
  it("formats two decimal places for the price input", () => {
    expect(formatDecimal(2450)).toBe("2.450,00");
  });
});

describe("parsePrice", () => {
  it.each([
    ["1290", 1290],
    ["1.290", 1290],
    ["1.290,5", 1290.5],
    ["1.290,00 €", 1290],
    [" 12,99 ", 12.99],
    ["0", 0],
  ])("parses %j", (input, expected) => {
    expect(parsePrice(input)).toBe(expected);
  });

  it.each(["", "abc", "12,999", "1,2,3", "-5", "12.34", "1.29.0"])(
    "rejects %j",
    (input) => {
      expect(parsePrice(input)).toBeUndefined();
    },
  );
});

describe("plural", () => {
  it("uses the singular for exactly one", () => {
    expect(plural(1, "Feature", "Features")).toBe("1 Feature");
    expect(plural(0, "Feature", "Features")).toBe("0 Features");
  });
});
