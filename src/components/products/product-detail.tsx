import { ChevronRight, ExternalLink, Pencil, Plus } from "lucide-react";
import Link from "next/link";
import {
  buttonClass,
  cardClass,
  tableHeadCellClass,
  tagClass,
  textLinkClass,
} from "@/components/ui/styles";
import { formatPrice } from "@/lib/format";
import type { Feature, Product } from "@/lib/products/schema";
import { FieldSummary } from "./field-summary";

export const editHref = (product: Product, feature?: string) =>
  `/produkte/${encodeURIComponent(product.id)}/bearbeiten${
    feature ? `?feature=${encodeURIComponent(feature)}` : ""
  }`;

/** Key facts, tags and links of a product. */
export function ProductFacts({ product }: { product: Product }) {
  return (
    <section
      aria-labelledby={`facts-title-${product.id}`}
      className={`${cardClass} p-5 sm:p-6`}
    >
      <h2 id={`facts-title-${product.id}`} className="sr-only">
        Stammdaten
      </h2>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-5 md:grid-cols-4 xl:grid-cols-6">
        <div>
          <dt className="text-sm text-ink-muted">Preis</dt>
          <dd className="mt-1 text-ink tabular-nums">
            {formatPrice(product.price)}
          </dd>
        </div>
        <div>
          <dt className="text-sm text-ink-muted">Aktuell verfügbar</dt>
          <dd className="mt-1 text-ink">{product.available ? "Ja" : "Nein"}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-sm text-ink-muted">Tags</dt>
          <dd className="mt-1.5">
            {product.tags.length > 0 ? (
              <ul className="flex flex-wrap gap-1.5">
                {product.tags.map((tag) => (
                  <li key={tag} className={tagClass}>
                    {tag}
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-ink-muted">Keine Tags</span>
            )}
          </dd>
        </div>
        <div className="col-span-2">
          <dt className="text-sm text-ink-muted">Externe Links</dt>
          <dd className="mt-1">
            {product.links.length > 0 ? (
              <ul className="flex flex-col gap-1">
                {product.links.map((url) => (
                  <li key={url} className="min-w-0">
                    <a
                      href={url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${textLinkClass} inline-flex max-w-full items-center gap-1.5 text-sm`}
                    >
                      <span className="truncate">
                        {url.replace("https://", "")}
                      </span>
                      <ExternalLink
                        size={14}
                        strokeWidth={1.75}
                        aria-hidden="true"
                        className="shrink-0"
                      />
                      <span className="sr-only">(öffnet in neuem Tab)</span>
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <span className="text-ink-muted">Keine Links hinterlegt</span>
            )}
          </dd>
        </div>
      </dl>
    </section>
  );
}

/** The product's features with their additional information. */
export function FeatureSection({ product }: { product: Product }) {
  return (
    <section aria-labelledby={`features-title-${product.id}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-baseline gap-3">
          <h2
            id={`features-title-${product.id}`}
            className="text-xl font-semibold text-ink"
          >
            Features
          </h2>
          <span className="text-sm text-ink-muted">
            {product.features.length}
          </span>
        </div>
        <Link
          href={editHref(product, "neu")}
          className={buttonClass("secondary", { compact: true })}
        >
          <Plus size={16} strokeWidth={1.75} aria-hidden="true" />
          Feature anlegen
        </Link>
      </div>
      <p className="mb-4 max-w-prose text-sm text-ink-muted">
        Funktionen, die Kund:innen mit einem Lizenzschlüssel freischalten.
        Zusatzinformationen werden bei jeder Freischaltung abgefragt.
      </p>
      <div className={`${cardClass} overflow-hidden`}>
        {product.features.length > 0 ? (
          <>
            <FeatureTable product={product} />
            <FeatureCards product={product} />
          </>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
            <p className="text-base font-semibold text-ink">
              Noch keine Features
            </p>
            <p className="max-w-sm text-sm text-ink-muted">
              Legen Sie die Funktionen an, die Kund:innen für dieses Produkt
              freischalten können.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function FeatureTable({ product }: { product: Product }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-sm">
        <caption className="sr-only">Features von {product.id}</caption>
        <thead className="bg-surface-muted">
          <tr className="border-b border-line">
            <th scope="col" className={tableHeadCellClass}>
              Feature-ID
            </th>
            <th scope="col" className={tableHeadCellClass}>
              Beschreibung
            </th>
            <th scope="col" className={tableHeadCellClass}>
              Zusatzinformationen
            </th>
            <th scope="col" className="px-4 py-3">
              <span className="sr-only">Aktionen</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line-subtle">
          {product.features.map((feature) => (
            <tr key={feature.id} className="align-top hover:bg-surface-muted">
              <td className="px-4 py-3 whitespace-nowrap">
                <Link
                  href={editHref(product, feature.id)}
                  className="font-mono font-medium text-primary hover:underline"
                >
                  {feature.id}
                </Link>
              </td>
              <td className="w-full max-w-0 px-4 py-3">
                <p
                  className="line-clamp-2 text-ink"
                  title={feature.description}
                >
                  {feature.description}
                </p>
              </td>
              <td className="px-4 py-3">
                <FieldSummary fields={feature.fields} />
              </td>
              <td className="px-4 py-1.5 text-right">
                <Link
                  href={editHref(product, feature.id)}
                  className={buttonClass("ghost", { compact: true })}
                  aria-label={`${feature.id} bearbeiten`}
                >
                  <Pencil size={16} strokeWidth={1.75} aria-hidden="true" />
                  Bearbeiten
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function FeatureCards({ product }: { product: Product }) {
  return (
    <ul className="divide-y divide-line-subtle md:hidden" aria-label="Features">
      {product.features.map((feature: Feature) => (
        <li key={feature.id}>
          <Link
            href={editHref(product, feature.id)}
            className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted active:bg-line-subtle"
          >
            <div className="min-w-0 flex-1">
              <span className="font-mono font-medium text-primary">
                {feature.id}
              </span>
              <p className="mt-1 text-sm text-ink">{feature.description}</p>
              <div className="mt-2 text-sm">
                <FieldSummary fields={feature.fields} />
              </div>
            </div>
            <ChevronRight
              size={16}
              strokeWidth={1.75}
              aria-hidden="true"
              className="shrink-0 text-ink-subtle"
            />
          </Link>
        </li>
      ))}
    </ul>
  );
}
