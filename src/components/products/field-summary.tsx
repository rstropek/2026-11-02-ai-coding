import { Calendar, Hash, type LucideIcon, Type } from "lucide-react";
import {
  type FeatureField,
  FIELD_TYPE_LABELS,
  type FieldType,
} from "@/lib/products/schema";

export const FIELD_TYPE_ICONS: Record<FieldType, LucideIcon> = {
  text: Type,
  integer: Hash,
  date: Calendar,
};

/** The additional information of a feature as a compact list. */
export function FieldSummary({ fields }: { fields: FeatureField[] }) {
  if (fields.length === 0) {
    return <span className="text-ink-muted">Keine</span>;
  }
  return (
    <ul className="flex flex-col gap-1">
      {fields.map((field) => {
        const Icon = FIELD_TYPE_ICONS[field.type];
        return (
          <li
            key={field.name}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Icon
              size={14}
              strokeWidth={1.75}
              aria-hidden="true"
              className="shrink-0 text-ink-subtle"
            />
            <span className="text-ink">{field.name}</span>
            <span className="text-ink-muted">
              · {FIELD_TYPE_LABELS[field.type]}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
