// Version guard: every feature branch must bump the version in package.json
// above the version on origin/main (see AGENTS.md). Run in CI and locally via
// `npm run check:version`. Needs an up-to-date `origin/main` (git fetch).
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const VERSION_PATTERN = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;

/**
 * Parses a plain `MAJOR.MINOR.PATCH` version (no prerelease or build suffix).
 * @param {string} version
 * @returns {[number, number, number]}
 */
export function parseVersion(version) {
  const match = VERSION_PATTERN.exec(version);
  if (!match) {
    throw new Error(`Invalid version "${version}", expected MAJOR.MINOR.PATCH`);
  }
  return [Number(match[1]), Number(match[2]), Number(match[3])];
}

/**
 * Returns true if `candidate` is strictly greater than `base`.
 * @param {string} candidate
 * @param {string} base
 */
export function isNewerVersion(candidate, base) {
  const a = parseVersion(candidate);
  const b = parseVersion(base);
  for (let i = 0; i < a.length; i++) {
    if (a[i] !== b[i]) {
      return a[i] > b[i];
    }
  }
  return false;
}

function main() {
  const branchVersion = JSON.parse(
    readFileSync("package.json", "utf8"),
  ).version;
  const mainVersion = JSON.parse(
    execFileSync("git", ["show", "origin/main:package.json"], {
      encoding: "utf8",
    }),
  ).version;

  if (!isNewerVersion(branchVersion, mainVersion)) {
    console.error(
      `Version ${branchVersion} must be greater than ${mainVersion} on origin/main.\n` +
        "Bump it with: npm version patch --no-git-tag-version",
    );
    process.exit(1);
  }
  console.log(`Version ${branchVersion} > ${mainVersion} on origin/main.`);
}

if (import.meta.main) {
  main();
}
