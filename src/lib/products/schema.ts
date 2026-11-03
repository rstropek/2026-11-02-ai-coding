import { z } from "zod";

// Data model for product master data (specs/2026-11-03-produktverwaltung.md).
// The same schema validates every file that is read, every API request and
// the product form, so all three agree on what a valid product is. Messages
// are German because they are shown in the UI as they are.

export const ID_MAX = 20;
export const DESCRIPTION_MAX = 1000;
export const FIELD_NAME_MAX = 100;
export const TAG_MAX = 40;
export const LINK_MAX = 2000;
export const PRICE_MAX = 1_000_000_000;

/** Data types of the additional information entered when a feature is unlocked. */
export const FIELD_TYPES = ["text", "integer", "date"] as const;
export type FieldType = (typeof FIELD_TYPES)[number];

export const FIELD_TYPE_LABELS: Record<FieldType, string> = {
  text: "Text",
  integer: "Ganzzahl",
  date: "Datum",
};

// IDs are referenced by licenses and the product ID is the file name, so
// they are short upper-case codes without characters that need escaping.
const ID_PATTERN = /^[A-Z0-9][A-Z0-9_-]*$/;

function idSchema(what: string) {
  return (
    z
      .string({ error: `Bitte geben Sie eine ${what} ein.` })
      .trim()
      .toUpperCase()
      // abort: an empty ID needs one message, not also the pattern's.
      .min(1, { error: `Bitte geben Sie eine ${what} ein.`, abort: true })
      .max(ID_MAX, `Die ${what} darf höchstens ${ID_MAX} Zeichen haben.`)
      .regex(
        ID_PATTERN,
        `Die ${what} darf nur Buchstaben A–Z, Ziffern, Bindestrich und Unterstrich enthalten und muss mit einem Buchstaben oder einer Ziffer beginnen.`,
      )
  );
}

/** Returns true if `value` is a well-formed (normalized) product or feature ID. */
export function isValidId(value: string): boolean {
  return value.length <= ID_MAX && ID_PATTERN.test(value);
}

function descriptionSchema(what: string) {
  return z
    .string({ error: `Bitte beschreiben Sie ${what}.` })
    .trim()
    .min(1, `Bitte beschreiben Sie ${what}.`)
    .max(
      DESCRIPTION_MAX,
      `Die Beschreibung darf höchstens ${DESCRIPTION_MAX} Zeichen haben.`,
    );
}

/** Reports every entry whose key occurs earlier in the list as a duplicate. */
function addDuplicateIssues<T>(
  items: readonly T[],
  key: (item: T) => string,
  issue: (item: T, index: number) => { path: PropertyKey[]; message: string },
  ctx: z.RefinementCtx,
) {
  const seen = new Set<string>();
  items.forEach((item, index) => {
    const k = key(item);
    if (seen.has(k)) {
      ctx.addIssue({ code: "custom", input: item, ...issue(item, index) });
    }
    seen.add(k);
  });
}

export const featureFieldSchema = z.object({
  name: z
    .string({ error: "Bitte geben Sie einen Feldnamen ein." })
    .trim()
    .min(1, "Bitte geben Sie einen Feldnamen ein.")
    .max(
      FIELD_NAME_MAX,
      `Der Feldname darf höchstens ${FIELD_NAME_MAX} Zeichen haben.`,
    ),
  type: z.enum(FIELD_TYPES, {
    error: "Bitte wählen Sie Text, Ganzzahl oder Datum als Datentyp.",
  }),
});

export const featureSchema = z
  .object({
    id: idSchema("Feature-ID"),
    description: descriptionSchema("das Feature"),
    fields: z.array(featureFieldSchema).default([]),
  })
  .superRefine((feature, ctx) =>
    addDuplicateIssues(
      feature.fields,
      (f) => f.name.toLowerCase(),
      (f, i) => ({
        path: ["fields", i, "name"],
        message: `Der Feldname „${f.name}“ kommt mehrfach vor.`,
      }),
      ctx,
    ),
  );

const linkSchema = z
  .string({ error: "Bitte geben Sie einen Link ein." })
  .trim()
  .max(LINK_MAX, `Ein Link darf höchstens ${LINK_MAX} Zeichen haben.`)
  .refine(
    (value) => {
      if (!value.startsWith("https://")) {
        return false;
      }
      try {
        // A dot in the host rules out typos like "https://handbuch".
        return new URL(value).hostname.includes(".");
      } catch {
        return false;
      }
    },
    {
      error:
        "Der Link muss mit https:// beginnen und eine gültige Adresse sein.",
    },
  );

export const tagSchema = z
  .string({ error: "Bitte geben Sie einen Tag ein." })
  .trim()
  .min(1, "Bitte geben Sie einen Tag ein.")
  .max(TAG_MAX, `Ein Tag darf höchstens ${TAG_MAX} Zeichen haben.`);

const priceSchema = z
  .number({ error: "Bitte geben Sie einen Preis ein." })
  .min(0, "Der Preis darf nicht negativ sein.")
  .max(PRICE_MAX, "Der Preis ist zu hoch.")
  .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-6, {
    error: "Der Preis darf höchstens zwei Nachkommastellen haben.",
  });

export const productSchema = z
  .object({
    id: idSchema("ID"),
    description: descriptionSchema("das Produkt"),
    available: z.boolean({
      error: "Bitte geben Sie an, ob das Produkt verfügbar ist.",
    }),
    price: priceSchema,
    links: z.array(linkSchema).default([]),
    tags: z.array(tagSchema).default([]),
    features: z.array(featureSchema).default([]),
  })
  .superRefine((product, ctx) => {
    addDuplicateIssues(
      product.links,
      (url) => url,
      (_, i) => ({
        path: ["links", i],
        message: "Dieser Link ist bereits eingetragen.",
      }),
      ctx,
    );
    addDuplicateIssues(
      product.tags,
      (tag) => tag.toLowerCase(),
      (tag, i) => ({
        path: ["tags", i],
        message: `Der Tag „${tag}“ ist bereits vergeben.`,
      }),
      ctx,
    );
    addDuplicateIssues(
      product.features,
      (f) => f.id,
      (f, i) => ({
        path: ["features", i, "id"],
        message: `Die Feature-ID ${f.id} kommt mehrfach vor.`,
      }),
      ctx,
    );
  });

export type FeatureField = z.output<typeof featureFieldSchema>;
export type Feature = z.output<typeof featureSchema>;
export type Product = z.output<typeof productSchema>;
/** What callers send: defaults (empty lists) may be omitted. */
export type ProductInput = z.input<typeof productSchema>;

/** A validation problem in a form-friendly shape. */
export type ValidationIssue = { path: (string | number)[]; message: string };

export function toValidationIssues(error: z.ZodError): ValidationIssue[] {
  return error.issues.map((issue) => ({
    path: issue.path.filter(
      (segment): segment is string | number => typeof segment !== "symbol",
    ),
    message: issue.message,
  }));
}
