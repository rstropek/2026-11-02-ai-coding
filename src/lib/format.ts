// Formatting and parsing of numbers for the German UI. Components never build
// these strings by hand, so the format is the same on every screen.

const currencyFormat = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
});

const decimalFormat = new Intl.NumberFormat("de-DE", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 1290 → "1.290,00 €" */
export function formatPrice(value: number): string {
  return currencyFormat.format(value);
}

/** 1290 → "1.290,00", the format of the price input. */
export function formatDecimal(value: number): string {
  return decimalFormat.format(value);
}

/**
 * Parses a price as admins type it: "1290", "1.290", "1.290,5" or
 * "1290,00 €". Returns undefined for anything else, including more than two
 * decimal places.
 */
export function parsePrice(input: string): number | undefined {
  const normalized = input.replace(/\s|€/g, "");
  if (!/^(\d{1,3}(\.\d{3})+|\d+)(,\d{1,2})?$/.test(normalized)) {
    return undefined;
  }
  return Number(normalized.replaceAll(".", "").replace(",", "."));
}

/** plural(1, "Feature", "Features") → "1 Feature" */
export function plural(count: number, one: string, many: string): string {
  return `${count} ${count === 1 ? one : many}`;
}
