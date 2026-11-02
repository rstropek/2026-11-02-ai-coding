// Minimal sample logic. It exists to prove the toolchain (unit, component and
// e2e tests, linting, type checking) works end to end. Replace once real
// license management features land.

/** Adds two numbers. */
export function add(a: number, b: number): number {
  return a + b;
}

/**
 * Parses user input into a number. Accepts both "1.5" and the German
 * notation "1,5". Returns `undefined` for empty or invalid input.
 */
export function parseNumber(input: string): number | undefined {
  const normalized = input.trim().replace(",", ".");
  if (normalized === "") {
    return undefined;
  }

  const value = Number(normalized);
  return Number.isFinite(value) ? value : undefined;
}

const numberFormat = new Intl.NumberFormat("de-AT", {
  maximumFractionDigits: 10,
});

/** Formats a number for display in the (currently German) UI. */
export function formatNumber(value: number): string {
  return numberFormat.format(value);
}
