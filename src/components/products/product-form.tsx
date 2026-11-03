"use client";

import { Plus, Trash2, X } from "lucide-react";
import Link from "next/link";
import {
  type FormEvent,
  useEffect,
  useId,
  useRef,
  useState,
  useTransition,
} from "react";
import type { FormActionResult } from "@/app/produkte/actions";
import { Alert } from "@/components/ui/alert";
import { Field, FieldError, fieldAria } from "@/components/ui/field";
import {
  buttonClass,
  cardClass,
  iconButtonClass,
  inputClass,
  textareaClass,
} from "@/components/ui/styles";
import { useToast } from "@/components/ui/toast";
import { useHydrated } from "@/components/ui/use-hydrated";
import {
  DESCRIPTION_MAX,
  ID_MAX,
  type Product,
  type ProductInput,
  tagSchema,
} from "@/lib/products/schema";
import { FeatureEditor } from "./feature-editor";
import {
  emptyFeature,
  errorsByTarget,
  type FeatureDraft,
  type FormProblem,
  featureLabel,
  ids,
  nextKey,
  type ProductDraft,
  summaryText,
  toDraft,
  toInput,
  toProblems,
  validate,
} from "./product-draft";

export type SaveProductAction = (
  mode: "create" | "update",
  input: ProductInput,
  expectedId?: string,
) => Promise<FormActionResult>;

type ProductFormProps = {
  /** The product to edit; missing when a new one is created. */
  product?: Product;
  /** Tags of all products, offered as suggestions. */
  knownTags: string[];
  /** Feature to open: its ID, or "neu" to start a new one. */
  initialFeature?: string;
  cancelHref: string;
  saveAction: SaveProductAction;
};

/** Moves focus after a re-render, once the target element exists. */
function focusLater(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}

/**
 * Create or edit a product including all its features. Everything is saved
 * together with one button, because products are only written as a whole.
 */
export function ProductForm({
  product,
  knownTags,
  initialFeature,
  cancelHref,
  saveAction,
}: ProductFormProps) {
  const mode = product ? "update" : "create";
  const toast = useToast();
  const suggestionsId = useId();
  // Pages visited before stay in the DOM (hidden), so every element ID gets
  // a per-form prefix to stay unique.
  const prefix = useId();
  const dom = (target: string) => `${prefix}${target}`;
  const [draft, setDraftState] = useState<ProductDraft>(() => toDraft(product));
  // Blur validation runs right after a change; the ref has the latest draft.
  const draftRef = useRef(draft);
  const [open, setOpen] = useState<Set<number>>(() => new Set());
  const [errors, setErrors] = useState<Map<string, string>>(() => new Map());
  const [summary, setSummary] = useState<FormProblem[]>([]);
  const [message, setMessage] = useState<string>();
  const [tagInput, setTagInput] = useState("");
  const [pending, startTransition] = useTransition();
  const hydrated = useHydrated();
  const summaryRef = useRef<HTMLDivElement>(null);

  const setDraft = (next: ProductDraft) => {
    draftRef.current = next;
    setDraftState(next);
  };
  const patch = (changes: Partial<ProductDraft>) =>
    setDraft({ ...draftRef.current, ...changes });

  const setError = (target: string, error: string | undefined) =>
    setErrors((current) => {
      const next = new Map(current);
      if (error) {
        next.set(target, error);
      } else {
        next.delete(target);
      }
      return next;
    });

  const validateOne = (target: string) =>
    setError(target, errorsByTarget(validate(draftRef.current)).get(target));

  const addFeature = () => {
    const feature = emptyFeature();
    patch({ features: [...draftRef.current.features, feature] });
    setOpen((current) => new Set(current).add(feature.key));
    focusLater(dom(ids.featureId(feature.key)));
    requestAnimationFrame(() =>
      document
        .getElementById(dom(`feature-${feature.key}`))
        ?.scrollIntoView({ block: "start", behavior: "smooth" }),
    );
  };

  // ?feature=<ID> opens that feature, ?feature=neu starts a new one.
  const initialized = useRef(false);
  // biome-ignore lint/correctness/useExhaustiveDependencies: runs once on mount
  useEffect(() => {
    if (initialized.current) {
      return;
    }
    initialized.current = true;
    if (initialFeature === "neu") {
      addFeature();
      return;
    }
    const target = draftRef.current.features.find(
      (f) => f.id === initialFeature,
    );
    if (target) {
      setOpen(new Set([target.key]));
      requestAnimationFrame(() =>
        document.getElementById(dom(`feature-${target.key}`))?.scrollIntoView(),
      );
    }
  }, []);

  const updateFeature = (feature: FeatureDraft) =>
    patch({
      features: draftRef.current.features.map((f) =>
        f.key === feature.key ? feature : f,
      ),
    });

  const removeFeature = (feature: FeatureDraft, index: number) => {
    patch({ features: draftRef.current.features.filter((f) => f !== feature) });
    focusLater(dom("add-feature"));
    toast(
      `Feature ${featureLabel(feature, index)} entfernt. Es wird beim Speichern gelöscht.`,
      () => {
        const features = [...draftRef.current.features];
        features.splice(index, 0, feature);
        patch({ features });
        focusLater(dom(ids.featureId(feature.key)));
      },
    );
  };

  const addTag = () => {
    const parsed = tagSchema.safeParse(tagInput);
    if (tagInput.trim() === "") {
      return;
    }
    if (!parsed.success) {
      setError(ids.tagInput, parsed.error.issues[0]?.message);
      return;
    }
    const tag = parsed.data;
    if (
      draftRef.current.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    ) {
      setError(ids.tagInput, `Der Tag „${tag}“ ist bereits vergeben.`);
      return;
    }
    patch({ tags: [...draftRef.current.tags, tag] });
    setError(ids.tagInput, undefined);
    setTagInput("");
  };

  const showProblems = (problems: FormProblem[]) => {
    setErrors(errorsByTarget(problems));
    setSummary(problems);
    // Open every feature that has a problem, so the links in the summary work.
    const withProblems = draftRef.current.features
      .filter((f) =>
        problems.some((p) => p.target.startsWith(`feature-${f.key}-`)),
      )
      .map((f) => f.key);
    if (withProblems.length > 0) {
      setOpen((current) => new Set([...current, ...withProblems]));
    }
  };

  useEffect(() => {
    if (summary.length > 0 || message) {
      summaryRef.current?.focus({ preventScroll: true });
      summaryRef.current?.scrollIntoView({
        block: "start",
        behavior: "smooth",
      });
    }
  }, [summary, message]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const current = draftRef.current;
    const problems = validate(current);
    setMessage(undefined);
    showProblems(problems);
    if (problems.length > 0) {
      return;
    }
    startTransition(async () => {
      // On success the action redirects to the detail page.
      const result = await saveAction(mode, toInput(current), product?.id);
      setMessage(result.message);
      showProblems(
        toProblems(
          result.issues.filter((issue) => issue.path.length > 0),
          current,
        ),
      );
    });
  };

  const descriptionError = errors.get(ids.description);
  const idError = errors.get(ids.productId);
  const priceError = errors.get(ids.price);
  const tagError = errors.get(ids.tagInput);

  return (
    <form
      id={dom(ids.form)}
      noValidate
      onSubmit={submit}
      className="flex max-w-2xl flex-col gap-6"
    >
      <div className={`${cardClass} flex flex-col gap-8 p-5 sm:p-6`}>
        <div
          ref={summaryRef}
          tabIndex={-1}
          className="scroll-mt-6 empty:hidden focus:outline-none"
        >
          {message && <Alert title={message} />}
          {summary.length > 0 && (
            <Alert
              title={`Bitte prüfen Sie ${summary.length === 1 ? "eine Angabe" : `${summary.length} Angaben`}`}
              className={message ? "mt-3" : ""}
            >
              <ul className="mt-1 list-disc pl-5">
                {summary.map((problem) => (
                  <li key={`${problem.target}-${problem.message}`}>
                    <a
                      href={`#${problem.target}`}
                      className="underline underline-offset-2"
                      onClick={(event) => {
                        event.preventDefault();
                        document.getElementById(dom(problem.target))?.focus();
                      }}
                    >
                      {summaryText(problem)}
                    </a>
                  </li>
                ))}
              </ul>
            </Alert>
          )}
        </div>

        <fieldset className="flex flex-col gap-5">
          <legend className="mb-5 text-base font-semibold text-ink">
            Stammdaten
          </legend>
          <Field
            id={dom(ids.productId)}
            label="ID"
            required
            help={
              product
                ? "Die ID kann nicht geändert werden, weil Lizenzen auf sie verweisen werden."
                : "Kurzer Code, höchstens 20 Zeichen, zum Beispiel KASSE-T200."
            }
            counter={product ? undefined : `${draft.id.length} / ${ID_MAX}`}
            error={idError}
          >
            <input
              {...fieldAria(dom(ids.productId), { help: true, error: idError })}
              name="id"
              required
              readOnly={Boolean(product)}
              maxLength={ID_MAX}
              autoComplete="off"
              spellCheck={false}
              value={draft.id}
              className={`${inputClass} font-mono uppercase`}
              onChange={(event) => patch({ id: event.target.value })}
              onBlur={() => validateOne(ids.productId)}
            />
          </Field>

          <Field
            id={dom(ids.description)}
            label="Beschreibung"
            required
            counter={`${draft.description.length} / ${DESCRIPTION_MAX}`}
            error={descriptionError}
          >
            <textarea
              {...fieldAria(dom(ids.description), { error: descriptionError })}
              name="description"
              rows={4}
              required
              maxLength={DESCRIPTION_MAX}
              value={draft.description}
              className={textareaClass}
              onChange={(event) => patch({ description: event.target.value })}
              onBlur={() => validateOne(ids.description)}
            />
          </Field>

          <div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
            <Field
              id={dom(ids.price)}
              label="Preis"
              required
              help="In Euro, zum Beispiel 1.290,00"
              error={priceError}
            >
              <div className="relative">
                <input
                  {...fieldAria(dom(ids.price), {
                    help: true,
                    error: priceError,
                  })}
                  name="price"
                  inputMode="decimal"
                  autoComplete="off"
                  value={draft.price}
                  className={`${inputClass} pr-9 text-right tabular-nums`}
                  onChange={(event) => patch({ price: event.target.value })}
                  onBlur={() => validateOne(ids.price)}
                />
                <span
                  className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-ink-muted"
                  aria-hidden="true"
                >
                  €
                </span>
              </div>
            </Field>
            <div className="flex flex-col gap-1.5">
              <span className="text-sm font-medium text-ink" aria-hidden="true">
                Verfügbarkeit
              </span>
              <label className="flex min-h-10 items-center gap-3 text-ink sm:mt-7">
                <input
                  type="checkbox"
                  id={dom(ids.available)}
                  name="available"
                  checked={draft.available}
                  aria-describedby={`${dom(ids.available)}-help`}
                  className="size-4 accent-primary"
                  onChange={(event) =>
                    patch({ available: event.target.checked })
                  }
                />
                Aktuell verfügbar
              </label>
              <p
                id={`${dom(ids.available)}-help`}
                className="text-sm text-ink-muted"
              >
                Nicht verfügbare Produkte werden nicht mehr verkauft. Bestehende
                Lizenzen bleiben gültig.
              </p>
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3 border-t border-line-subtle pt-6">
          <legend className="float-left w-full text-base font-semibold text-ink">
            Externe Links
          </legend>
          <p
            id={dom("links-help")}
            className="clear-left -mt-2 mb-1 text-sm text-ink-muted"
          >
            Handbücher, Datenblätter oder Support-Seiten. Jeder Link beginnt mit
            https://.
          </p>
          <ul className="flex flex-col gap-3">
            {draft.links.length === 0 && (
              <li className="text-sm text-ink-muted">
                Keine Links hinterlegt.
              </li>
            )}
            {draft.links.map((link, index) => {
              const target = ids.link(link.key);
              const id = dom(target);
              const error = errors.get(target);
              return (
                <li key={link.key} className="flex items-start gap-2">
                  <div className="min-w-0 flex-1">
                    <label htmlFor={id} className="sr-only">
                      Link {index + 1}
                    </label>
                    <input
                      id={id}
                      type="url"
                      inputMode="url"
                      value={link.url}
                      placeholder="https://"
                      aria-invalid={error ? true : undefined}
                      aria-describedby={`${dom("links-help")}${error ? ` ${id}-error` : ""}`}
                      className={inputClass}
                      onChange={(event) =>
                        patch({
                          links: draftRef.current.links.map((l) =>
                            l.key === link.key
                              ? { ...l, url: event.target.value }
                              : l,
                          ),
                        })
                      }
                      onBlur={() => validateOne(target)}
                    />
                    <div className="mt-1.5 empty:hidden">
                      <FieldError id={id} error={error} />
                    </div>
                  </div>
                  <button
                    type="button"
                    className={iconButtonClass}
                    aria-label={`Link ${index + 1} entfernen`}
                    title="Link entfernen"
                    onClick={() => {
                      patch({
                        links: draftRef.current.links.filter((l) => l !== link),
                      });
                      setError(target, undefined);
                      focusLater(dom("add-link"));
                    }}
                  >
                    <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
                  </button>
                </li>
              );
            })}
          </ul>
          <div>
            <button
              type="button"
              id={dom("add-link")}
              className={buttonClass("ghost", {
                compact: true,
                className: "-ml-3",
              })}
              onClick={() => {
                const link = { key: nextKey(), url: "https://" };
                patch({ links: [...draftRef.current.links, link] });
                focusLater(dom(ids.link(link.key)));
              }}
            >
              <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
              Link hinzufügen
            </button>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3 border-t border-line-subtle pt-6">
          <legend className="float-left w-full text-base font-semibold text-ink">
            Tags
          </legend>
          <p
            id={`${dom(ids.tagInput)}-help`}
            className="clear-left -mt-2 mb-1 text-sm text-ink-muted"
          >
            Schlagworte zum Suchen und Filtern. Mit der Eingabetaste übernehmen.
          </p>
          <ul className="flex flex-wrap gap-2" aria-label="Vergebene Tags">
            {draft.tags.length === 0 && (
              <li className="text-sm text-ink-muted">Noch keine Tags.</li>
            )}
            {draft.tags.map((tag) => (
              <li
                key={tag}
                className="inline-flex items-center gap-1 rounded-full bg-line-subtle py-1 pr-1 pl-3 text-sm text-ink"
              >
                {tag}
                <button
                  type="button"
                  className="grid size-6 place-items-center rounded-full text-ink-muted hover:bg-line hover:text-ink"
                  aria-label={`Tag ${tag} entfernen`}
                  onClick={() => {
                    patch({
                      tags: draftRef.current.tags.filter((t) => t !== tag),
                    });
                    focusLater(dom(ids.tagInput));
                  }}
                >
                  <X size={14} strokeWidth={1.75} aria-hidden="true" />
                </button>
              </li>
            ))}
          </ul>
          <div className="flex flex-col gap-1.5">
            <div className="flex gap-3">
              <label htmlFor={dom(ids.tagInput)} className="sr-only">
                Tag hinzufügen
              </label>
              <input
                {...fieldAria(dom(ids.tagInput), {
                  help: true,
                  error: tagError,
                })}
                list={suggestionsId}
                autoComplete="off"
                placeholder="Tag hinzufügen"
                value={tagInput}
                className={`${inputClass} sm:max-w-xs`}
                onChange={(event) => setTagInput(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") {
                    event.preventDefault();
                    addTag();
                  }
                }}
              />
              <datalist id={suggestionsId}>
                {knownTags
                  .filter((tag) => !draft.tags.includes(tag))
                  .map((tag) => (
                    <option key={tag} value={tag} />
                  ))}
              </datalist>
              <button
                type="button"
                className={buttonClass("secondary")}
                onClick={addTag}
              >
                Hinzufügen
              </button>
            </div>
            <FieldError id={dom(ids.tagInput)} error={tagError} />
          </div>
        </fieldset>

        <fieldset className="border-t border-line-subtle pt-6">
          <legend className="float-left w-full text-base font-semibold text-ink">
            Features
          </legend>
          <p className="clear-left mb-3 pt-1 text-sm text-ink-muted">
            Funktionen, die Kund:innen mit einem Lizenzschlüssel freischalten.
          </p>
          <ol className="divide-y divide-line-subtle border-y border-line-subtle">
            {draft.features.length === 0 && (
              <li className="py-4 text-sm text-ink-muted">
                Noch keine Features. Fügen Sie die Funktionen hinzu, die
                Kund:innen für dieses Produkt freischalten können.
              </li>
            )}
            {draft.features.map((feature, index) => (
              <FeatureEditor
                key={feature.key}
                feature={feature}
                open={open.has(feature.key)}
                errors={errors}
                onToggle={(isOpen) =>
                  setOpen((current) => {
                    const next = new Set(current);
                    if (isOpen) {
                      next.add(feature.key);
                    } else {
                      next.delete(feature.key);
                    }
                    return next;
                  })
                }
                onChange={updateFeature}
                onRemove={() => removeFeature(feature, index)}
                onBlur={validateOne}
                dom={dom}
              />
            ))}
          </ol>
          <button
            type="button"
            id={dom("add-feature")}
            className={buttonClass("ghost", {
              compact: true,
              className: "mt-3 -ml-3",
            })}
            onClick={addFeature}
          >
            <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
            Feature hinzufügen
          </button>
        </fieldset>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href={cancelHref} className={buttonClass("secondary")}>
          Abbrechen
        </Link>
        <button
          type="submit"
          className={buttonClass("primary")}
          disabled={pending || !hydrated}
          aria-busy={pending || undefined}
        >
          {product ? "Änderungen speichern" : "Produkt anlegen"}
        </button>
      </div>
    </form>
  );
}
