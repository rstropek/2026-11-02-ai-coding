// Success messages passed through the URL after a redirect (?meldung=…&name=…).
// Only known message keys and product IDs are shown, so a crafted link cannot
// put arbitrary text into the app.

import { isValidId } from "@/lib/products/schema";

const MESSAGES = {
  angelegt: (name: string) => `Produkt ${name} angelegt.`,
  gespeichert: (name: string) => `Änderungen an ${name} gespeichert.`,
  geloescht: (name: string) => `Produkt ${name} gelöscht.`,
};

export type FlashKind = keyof typeof MESSAGES;

export function flashUrl(
  path: string,
  { meldung, name }: { meldung: FlashKind; name: string },
): string {
  return `${path}?${new URLSearchParams({ meldung, name })}`;
}

type SearchParams = Record<string, string | string[] | undefined>;

export function flashMessage(params: SearchParams): string | undefined {
  const kind = params.meldung;
  const name = params.name;
  if (
    typeof kind !== "string" ||
    typeof name !== "string" ||
    !isValidId(name)
  ) {
    return undefined;
  }
  return Object.hasOwn(MESSAGES, kind)
    ? MESSAGES[kind as FlashKind](name)
    : undefined;
}
