import { formatDecimal, parsePrice } from "@/lib/format";
import {
  type FieldType,
  type Product,
  type ProductInput,
  productSchema,
  toValidationIssues,
  type ValidationIssue,
} from "@/lib/products/schema";

// State of the product form and its mapping to the product schema. Kept free
// of React so the validation and the mapping of errors to form controls can
// be unit-tested. Lists carry stable keys, so errors and focus stay with the
// right row when rows are added, moved or removed.

export type FieldDraft = { key: number; name: string; type: FieldType };

export type FeatureDraft = {
  key: number;
  id: string;
  description: string;
  fields: FieldDraft[];
  /** Already saved: the ID is fixed because licenses will reference it. */
  persisted: boolean;
};

export type LinkDraft = { key: number; url: string };

export type ProductDraft = {
  id: string;
  description: string;
  price: string;
  available: boolean;
  links: LinkDraft[];
  tags: string[];
  features: FeatureDraft[];
};

let lastKey = 0;
/** Unique key for a new list row. */
export const nextKey = () => ++lastKey;

export function emptyFeature(): FeatureDraft {
  return {
    key: nextKey(),
    id: "",
    description: "",
    fields: [],
    persisted: false,
  };
}

export function toDraft(product?: Product): ProductDraft {
  if (!product) {
    return {
      id: "",
      description: "",
      price: "",
      available: true,
      links: [],
      tags: [],
      features: [],
    };
  }
  return {
    id: product.id,
    description: product.description,
    price: formatDecimal(product.price),
    available: product.available,
    links: product.links.map((url) => ({ key: nextKey(), url })),
    tags: [...product.tags],
    features: product.features.map((feature) => ({
      key: nextKey(),
      id: feature.id,
      description: feature.description,
      fields: feature.fields.map((field) => ({ key: nextKey(), ...field })),
      persisted: true,
    })),
  };
}

/** Links left empty are ignored rather than reported. */
const filledLinks = (draft: ProductDraft) =>
  draft.links.filter((link) => link.url.trim() !== "");

/** What the form sends to the server. The server validates it again. */
export function toInput(draft: ProductDraft): ProductInput {
  return {
    id: draft.id,
    description: draft.description,
    // An unparsable price is sent as missing; validate() explains it better.
    price: parsePrice(draft.price) as number,
    available: draft.available,
    links: filledLinks(draft).map((link) => link.url),
    tags: draft.tags,
    features: draft.features.map((feature) => ({
      id: feature.id,
      description: feature.description,
      fields: feature.fields.map(({ name, type }) => ({ name, type })),
    })),
  };
}

/**
 * A problem attached to the form control (DOM id) where it can be fixed.
 * `context` names the row ("Link 2", "KONTAKTLOS, Feld 1") in the summary
 * above the form; below the field it is redundant.
 */
export type FormProblem = { target: string; message: string; context?: string };

/** "KONTAKTLOS, Feld 1: Bitte geben Sie einen Feldnamen ein." */
export const summaryText = ({ message, context }: FormProblem) =>
  context ? `${context}: ${message}` : message;

export const ids = {
  productId: "product-id",
  description: "product-description",
  price: "product-price",
  available: "product-available",
  tagInput: "tag-input",
  link: (key: number) => `link-${key}`,
  featureId: (key: number) => `feature-${key}-id`,
  featureDescription: (key: number) => `feature-${key}-description`,
  fieldName: (feature: number, field: number) =>
    `feature-${feature}-field-${field}-name`,
  fieldType: (feature: number, field: number) =>
    `feature-${feature}-field-${field}-type`,
  /** Problems without a specific control. */
  form: "product-form",
};

export function featureLabel(feature: FeatureDraft, index: number): string {
  return feature.id.trim().toUpperCase() || `Feature ${index + 1}`;
}

/** Maps schema issues (paths into toInput()'s result) to form controls. */
export function toProblems(
  issues: ValidationIssue[],
  draft: ProductDraft,
): FormProblem[] {
  const links = filledLinks(draft);
  return issues.map(({ path, message }) => {
    const [head, index, sub, fieldIndex, fieldProperty] = path;
    switch (head) {
      case "id":
        return { target: ids.productId, message };
      case "description":
        return { target: ids.description, message };
      case "price":
        return { target: ids.price, message };
      case "available":
        return { target: ids.available, message };
      case "tags":
        return { target: ids.tagInput, message };
      case "links": {
        const link = typeof index === "number" ? links[index] : undefined;
        return link
          ? {
              target: ids.link(link.key),
              message,
              context: `Link ${draft.links.indexOf(link) + 1}`,
            }
          : { target: ids.form, message };
      }
      case "features": {
        const feature =
          typeof index === "number" ? draft.features[index] : undefined;
        if (!feature || typeof index !== "number") {
          return { target: ids.form, message };
        }
        const label = featureLabel(feature, index);
        if (sub === "fields" && typeof fieldIndex === "number") {
          const field = feature.fields[fieldIndex];
          if (field) {
            return {
              target:
                fieldProperty === "type"
                  ? ids.fieldType(feature.key, field.key)
                  : ids.fieldName(feature.key, field.key),
              message,
              context: `${label}, Feld ${fieldIndex + 1}`,
            };
          }
        }
        return {
          target:
            sub === "description"
              ? ids.featureDescription(feature.key)
              : ids.featureId(feature.key),
          message,
          context: label,
        };
      }
      default:
        return { target: ids.form, message };
    }
  });
}

/** Validates the whole form with the product schema. */
export function validate(draft: ProductDraft): FormProblem[] {
  const result = productSchema.safeParse(toInput(draft));
  const problems = result.success
    ? []
    : toProblems(toValidationIssues(result.error), draft);

  // The schema only sees a missing price; say what is wrong with the text.
  if (draft.price.trim() !== "" && parsePrice(draft.price) === undefined) {
    const index = problems.findIndex((p) => p.target === ids.price);
    const problem = {
      target: ids.price,
      message:
        "Bitte geben Sie den Preis als Zahl mit höchstens zwei Nachkommastellen ein, zum Beispiel 1.290,00.",
    };
    if (index >= 0) {
      problems[index] = problem;
    } else {
      problems.push(problem);
    }
  }
  return problems;
}

/** First problem per control, for the messages below the fields. */
export function errorsByTarget(problems: FormProblem[]): Map<string, string> {
  const errors = new Map<string, string>();
  for (const { target, message } of problems) {
    if (!errors.has(target)) {
      errors.set(target, message);
    }
  }
  return errors;
}
