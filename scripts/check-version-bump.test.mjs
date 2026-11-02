// @vitest-environment node
import { describe, expect, it } from "vitest";
import { isNewerVersion, parseVersion } from "./check-version-bump.mjs";

describe("parseVersion", () => {
  it("parses MAJOR.MINOR.PATCH", () => {
    expect(parseVersion("1.20.3")).toEqual([1, 20, 3]);
  });

  it.each(["", "1.2", "1.2.3.4", "v1.2.3", "1.2.3-beta.1", "01.2.3"])(
    "rejects %j",
    (version) => {
      expect(() => parseVersion(version)).toThrow(/Invalid version/);
    },
  );
});

describe("isNewerVersion", () => {
  it.each([
    ["0.1.1", "0.1.0"],
    ["0.2.0", "0.1.9"],
    ["1.0.0", "0.99.99"],
    ["0.1.10", "0.1.9"],
  ])("%s is newer than %s", (candidate, base) => {
    expect(isNewerVersion(candidate, base)).toBe(true);
  });

  it.each([
    ["0.1.0", "0.1.0"],
    ["0.1.0", "0.1.1"],
    ["0.1.9", "0.1.10"],
    ["0.9.9", "1.0.0"],
  ])("%s is not newer than %s", (candidate, base) => {
    expect(isNewerVersion(candidate, base)).toBe(false);
  });
});
