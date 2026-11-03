"use client";

import { ArrowDown, ArrowUp, ChevronRight, Plus, Trash2 } from "lucide-react";
import { Field, FieldError, fieldAria } from "@/components/ui/field";
import {
  buttonClass,
  iconButtonClass,
  inputClass,
  textareaClass,
} from "@/components/ui/styles";
import { plural } from "@/lib/format";
import {
  DESCRIPTION_MAX,
  FIELD_TYPE_LABELS,
  FIELD_TYPES,
  type FieldType,
  ID_MAX,
} from "@/lib/products/schema";
import { FIELD_TYPE_ICONS } from "./field-summary";
import {
  type FeatureDraft,
  type FieldDraft,
  ids,
  nextKey,
} from "./product-draft";

// One feature of the product form: a collapsible row with ID, description,
// the additional information fields and a preview of the unlock form.
// Features are only saved together with their product.

type FeatureEditorProps = {
  feature: FeatureDraft;
  open: boolean;
  errors: Map<string, string>;
  onToggle: (open: boolean) => void;
  onChange: (feature: FeatureDraft) => void;
  onRemove: () => void;
  onBlur: (target: string) => void;
  /** Turns a target from ids into the element ID (unique per form). */
  dom: (target: string) => string;
};

const fieldCountLabel = (count: number) =>
  count > 0
    ? plural(count, "Zusatzinformation", "Zusatzinformationen")
    : "Keine Zusatzinformationen";

/** Moves focus after a re-render, once the target element exists. */
function focusLater(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

export function FeatureEditor({
  feature,
  open,
  errors,
  onToggle,
  onChange,
  onRemove,
  onBlur,
  dom,
}: FeatureEditorProps) {
  const k = feature.key;
  const name = feature.id.trim().toUpperCase();
  const idError = errors.get(ids.featureId(k));
  const descriptionError = errors.get(ids.featureDescription(k));

  const setFields = (fields: FieldDraft[]) => onChange({ ...feature, fields });
  const updateField = (index: number, patch: Partial<FieldDraft>) =>
    setFields(
      feature.fields.map((field, i) =>
        i === index ? { ...field, ...patch } : field,
      ),
    );

  const addField = () => {
    const field: FieldDraft = { key: nextKey(), name: "", type: "text" };
    setFields([...feature.fields, field]);
    focusLater(dom(ids.fieldName(k, field.key)));
  };

  const moveField = (from: number, direction: -1 | 1) => {
    const to = from + direction;
    const fields = [...feature.fields];
    const [moved] = fields.splice(from, 1);
    if (!moved) {
      return;
    }
    fields.splice(to, 0, moved);
    setFields(fields);
    // Keep focus on the moved row: the same button if it is still enabled,
    // otherwise the opposite one.
    const atEdge = direction === -1 ? to === 0 : to === fields.length - 1;
    const button = (direction === -1) !== atEdge ? "up" : "down";
    focusLater(`${dom(ids.fieldName(k, moved.key))}-${button}`);
  };

  const removeField = (index: number) => {
    setFields(feature.fields.filter((_, i) => i !== index));
    focusLater(dom(`feature-${k}-add-field`));
  };

  return (
    <li id={dom(`feature-${k}`)} className="scroll-mt-6">
      <details
        open={open}
        onToggle={(event) => {
          const isOpen = event.currentTarget.open;
          if (isOpen !== open) {
            onToggle(isOpen);
          }
        }}
        className="group"
      >
        <summary className="-mx-2 flex cursor-pointer list-none items-center gap-3 rounded-control px-2 py-3 hover:bg-surface-muted [&::-webkit-details-marker]:hidden">
          <ChevronRight
            size={16}
            strokeWidth={1.75}
            aria-hidden="true"
            className="shrink-0 text-ink-subtle transition-transform group-open:rotate-90"
          />
          <span
            className={`min-w-0 truncate font-mono font-medium ${name ? "text-ink" : "text-ink-subtle"}`}
          >
            {name || "Neues Feature"}
          </span>
          <span className="ml-auto shrink-0 text-sm text-ink-muted">
            {fieldCountLabel(feature.fields.length)}
          </span>
        </summary>

        <div className="flex flex-col gap-5 pt-2 pb-6 sm:pl-7">
          <Field
            id={dom(ids.featureId(k))}
            label="Feature-ID"
            required
            help={
              feature.persisted
                ? "Die Feature-ID kann nicht geändert werden, weil Lizenzen auf sie verweisen werden."
                : "Kurzer Code, höchstens 20 Zeichen, eindeutig innerhalb des Produkts."
            }
            counter={
              feature.persisted ? undefined : `${feature.id.length} / ${ID_MAX}`
            }
            error={idError}
          >
            <input
              {...fieldAria(dom(ids.featureId(k)), {
                help: true,
                error: idError,
              })}
              value={feature.id}
              readOnly={feature.persisted}
              maxLength={ID_MAX}
              autoComplete="off"
              spellCheck={false}
              className={`${inputClass} font-mono uppercase`}
              onChange={(event) =>
                onChange({ ...feature, id: event.target.value })
              }
              onBlur={() => onBlur(ids.featureId(k))}
            />
          </Field>

          <Field
            id={dom(ids.featureDescription(k))}
            label="Beschreibung"
            required
            counter={`${feature.description.length} / ${DESCRIPTION_MAX}`}
            error={descriptionError}
          >
            <textarea
              {...fieldAria(dom(ids.featureDescription(k)), {
                error: descriptionError,
              })}
              value={feature.description}
              rows={2}
              maxLength={DESCRIPTION_MAX}
              className={textareaClass}
              onChange={(event) =>
                onChange({ ...feature, description: event.target.value })
              }
              onBlur={() => onBlur(ids.featureDescription(k))}
            />
          </Field>

          <fieldset>
            <legend className="text-sm font-medium text-ink">
              Zusatzinformationen bei der Freischaltung
            </legend>
            <p className="mt-1 mb-3 text-sm text-ink-muted">
              Angaben, die bei jeder Freischaltung eingegeben werden müssen, zum
              Beispiel eine Anzahl oder ein Datum „gültig bis“.
            </p>
            {feature.fields.length > 0 && (
              <>
                <div
                  className="mb-2 hidden grid-cols-[minmax(0,1fr)_9rem_7.5rem] gap-3 md:grid"
                  aria-hidden="true"
                >
                  <span className="text-xs font-semibold tracking-wider text-ink-muted uppercase">
                    Feldname
                  </span>
                  <span className="text-xs font-semibold tracking-wider text-ink-muted uppercase">
                    Datentyp
                  </span>
                </div>
                <ol className="flex flex-col divide-y divide-line-subtle md:gap-3 md:divide-y-0">
                  {feature.fields.map((field, index) => {
                    const nameTarget = ids.fieldName(k, field.key);
                    const nameId = dom(nameTarget);
                    const typeId = dom(ids.fieldType(k, field.key));
                    const nameError = errors.get(nameTarget);
                    return (
                      <li
                        key={field.key}
                        className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-2 py-4 first:pt-0 md:grid-cols-[minmax(0,1fr)_9rem_7.5rem] md:py-0"
                      >
                        <div className="col-span-2 flex flex-col gap-1.5 md:col-span-1">
                          <label
                            htmlFor={nameId}
                            className="text-sm font-medium text-ink md:sr-only"
                          >
                            Feldname
                            <span className="sr-only"> {index + 1}</span>
                          </label>
                          <input
                            {...fieldAria(nameId, { error: nameError })}
                            value={field.name}
                            placeholder="zum Beispiel Anzahl Benutzer:innen"
                            autoComplete="off"
                            className={inputClass}
                            onChange={(event) =>
                              updateField(index, { name: event.target.value })
                            }
                            onBlur={() => onBlur(nameTarget)}
                          />
                          <FieldError id={nameId} error={nameError} />
                        </div>
                        <div className="flex flex-col gap-1.5">
                          <label
                            htmlFor={typeId}
                            className="text-sm font-medium text-ink md:sr-only"
                          >
                            Datentyp
                            <span className="sr-only">
                              {" "}
                              von Feld {index + 1}
                            </span>
                          </label>
                          <select
                            id={typeId}
                            value={field.type}
                            className={inputClass}
                            onChange={(event) =>
                              updateField(index, {
                                type: event.target.value as FieldType,
                              })
                            }
                          >
                            {FIELD_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {FIELD_TYPE_LABELS[type]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div className="flex self-end md:self-start">
                          <button
                            type="button"
                            id={`${nameId}-up`}
                            className={iconButtonClass}
                            aria-label={`Feld ${index + 1} nach oben`}
                            title="Nach oben"
                            disabled={index === 0}
                            onClick={() => moveField(index, -1)}
                          >
                            <ArrowUp
                              size={16}
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            type="button"
                            id={`${nameId}-down`}
                            className={iconButtonClass}
                            aria-label={`Feld ${index + 1} nach unten`}
                            title="Nach unten"
                            disabled={index === feature.fields.length - 1}
                            onClick={() => moveField(index, 1)}
                          >
                            <ArrowDown
                              size={16}
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </button>
                          <button
                            type="button"
                            className={iconButtonClass}
                            aria-label={`Feld ${index + 1} entfernen`}
                            title="Entfernen"
                            onClick={() => removeField(index)}
                          >
                            <Trash2
                              size={16}
                              strokeWidth={1.75}
                              aria-hidden="true"
                            />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </>
            )}
            <button
              type="button"
              id={dom(`feature-${k}-add-field`)}
              className={buttonClass("ghost", {
                compact: true,
                className: "mt-2 -ml-3",
              })}
              onClick={addField}
            >
              <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
              Feld hinzufügen
            </button>
          </fieldset>

          <UnlockPreview fields={feature.fields} />

          <div>
            <button
              type="button"
              className={buttonClass("danger", { compact: true })}
              onClick={onRemove}
            >
              <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
              Feature entfernen
            </button>
          </div>
        </div>
      </details>
    </li>
  );
}

/** Shows what unlocking the feature will ask for. Inert: it is a picture, not a form. */
function UnlockPreview({ fields }: { fields: FieldDraft[] }) {
  const label = (field: FieldDraft) => field.name.trim() || "Unbenanntes Feld";
  return (
    <div className="rounded-control bg-canvas p-4">
      <p className="text-sm font-medium text-ink">Vorschau der Freischaltung</p>
      <p className="mt-0.5 mb-4 text-sm text-ink-muted">
        So fragt das Freischaltformular die Zusatzinformationen ab.
      </p>
      <p className="sr-only">
        {fields.length > 0
          ? `Vorschau: Die Freischaltung fragt ${plural(fields.length, "Angabe", "Angaben")} ab: ${fields
              .map(
                (field) => `${label(field)} (${FIELD_TYPE_LABELS[field.type]})`,
              )
              .join(", ")}.`
          : "Vorschau: Die Freischaltung fragt keine Zusatzinformationen ab."}
      </p>
      <div inert aria-hidden="true" className="flex flex-col gap-4">
        {fields.length > 0 ? (
          fields.map((field) => {
            const Icon = FIELD_TYPE_ICONS[field.type];
            return (
              <div key={field.key} className="flex flex-col gap-1.5">
                <span
                  className={`text-sm font-medium ${field.name.trim() ? "text-ink" : "text-ink-subtle"}`}
                >
                  {label(field)} <span className="text-danger">*</span>
                </span>
                <span className="flex items-center gap-1.5 text-xs text-ink-muted">
                  <Icon size={12} strokeWidth={1.75} />
                  {FIELD_TYPE_LABELS[field.type]}
                </span>
                {field.type === "text" && (
                  <input type="text" tabIndex={-1} className={inputClass} />
                )}
                {field.type === "integer" && (
                  <input
                    type="number"
                    step={1}
                    tabIndex={-1}
                    className={`${inputClass} text-right tabular-nums sm:max-w-40`}
                  />
                )}
                {field.type === "date" && (
                  <input
                    type="date"
                    tabIndex={-1}
                    className={`${inputClass} sm:max-w-48`}
                  />
                )}
              </div>
            );
          })
        ) : (
          <p className="text-sm text-ink-muted">
            Keine Zusatzinformationen. Das Feature wird ohne weitere Angaben
            freigeschaltet.
          </p>
        )}
      </div>
    </div>
  );
}
