import { describe, expect, it } from "vitest";
import { add, formatNumber, parseNumber } from "./calculator";

describe("add", () => {
  it("adds two positive numbers", () => {
    expect(add(2, 3)).toBe(5);
  });

  it("handles negative numbers and decimals", () => {
    expect(add(-1.5, 0.5)).toBe(-1);
  });
});

describe("parseNumber", () => {
  it.each([
    ["42", 42],
    ["  7 ", 7],
    ["1.5", 1.5],
    ["1,5", 1.5],
    ["-3", -3],
  ])("parses %j as %d", (input, expected) => {
    expect(parseNumber(input)).toBe(expected);
  });

  it.each(["", "   ", "abc", "1,2,3", "Infinity"])(
    "returns undefined for %j",
    (input) => {
      expect(parseNumber(input)).toBeUndefined();
    },
  );
});

describe("formatNumber", () => {
  it("uses the German decimal separator", () => {
    expect(formatNumber(4.5)).toBe("4,5");
  });
});
