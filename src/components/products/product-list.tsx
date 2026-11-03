import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { AvailabilityBadge } from "@/components/ui/availability-badge";
import {
  cardClass,
  tableHeadCellClass,
  tagClass,
} from "@/components/ui/styles";
import { formatPrice, plural } from "@/lib/format";
import type { Product } from "@/lib/products/schema";

const productHref = (product: Product) =>
  `/produkte/${encodeURIComponent(product.id)}`;

/** All products: a table from md up, a divided list on phones. */
export function ProductList({ products }: { products: Product[] }) {
  if (products.length === 0) {
    return (
      <div
        className={`${cardClass} flex flex-col items-center gap-3 px-6 py-16 text-center`}
      >
        <p className="text-base font-semibold text-ink">Noch keine Produkte</p>
        <p className="max-w-sm text-sm text-ink-muted">
          Legen Sie das erste Produkt mit seinen freischaltbaren Features an.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-ink-muted">
        {plural(products.length, "Produkt", "Produkte")}
      </p>
      <div className={`${cardClass} overflow-hidden`}>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-sm">
            <caption className="sr-only">Produkte</caption>
            <thead className="bg-surface-muted">
              <tr className="border-b border-line">
                <th scope="col" className={tableHeadCellClass}>
                  ID
                </th>
                <th scope="col" className={tableHeadCellClass}>
                  Beschreibung
                </th>
                <th
                  scope="col"
                  className={`${tableHeadCellClass} hidden xl:table-cell`}
                >
                  Tags
                </th>
                <th scope="col" className={`${tableHeadCellClass} text-right`}>
                  Features
                </th>
                <th scope="col" className={`${tableHeadCellClass} text-right`}>
                  Preis
                </th>
                <th scope="col" className={tableHeadCellClass}>
                  Status
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line-subtle">
              {products.map((product) => (
                <tr key={product.id} className="hover:bg-surface-muted">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link
                      href={productHref(product)}
                      className="font-mono font-medium text-primary hover:underline"
                    >
                      {product.id}
                    </Link>
                  </td>
                  <td className="w-full max-w-0 px-4 py-3">
                    <p
                      className="truncate text-ink"
                      title={product.description}
                    >
                      {product.description}
                    </p>
                  </td>
                  <td className="hidden px-4 py-3 xl:table-cell">
                    <ul className="flex flex-nowrap gap-1.5" aria-label="Tags">
                      {product.tags.map((tag) => (
                        <li key={tag} className={tagClass}>
                          {tag}
                        </li>
                      ))}
                    </ul>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {product.features.length}
                  </td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    {formatPrice(product.price)}
                  </td>
                  <td className="px-4 py-3">
                    <AvailabilityBadge available={product.available} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Six columns do not fit a phone without hiding the ID. */}
        <ul
          className="divide-y divide-line-subtle md:hidden"
          aria-label="Produkte"
        >
          {products.map((product) => (
            <li key={product.id}>
              <Link
                href={productHref(product)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-surface-muted active:bg-line-subtle"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-3">
                    <span className="truncate font-mono font-medium text-primary">
                      {product.id}
                    </span>
                    <AvailabilityBadge available={product.available} />
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-ink-muted">
                    {product.description}
                  </p>
                  <p className="mt-1.5 text-sm text-ink tabular-nums">
                    {formatPrice(product.price)}{" "}
                    <span className="text-ink-muted">
                      · {plural(product.features.length, "Feature", "Features")}
                    </span>
                  </p>
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
      </div>
    </>
  );
}
