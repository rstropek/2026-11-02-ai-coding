import Link from "next/link";
import { Fragment, type ReactNode } from "react";

export type Crumb = { label: string; href?: string };

type PageHeaderProps = {
  title: string;
  crumbs?: Crumb[];
  /** Shown next to the title, e.g. a status badge. */
  badge?: ReactNode;
  description?: ReactNode;
  /** Secondary actions first, the one primary action last. */
  actions?: ReactNode;
};

/** The header every page starts with: breadcrumb, serif title, description, actions. */
export function PageHeader({
  title,
  crumbs = [],
  badge,
  description,
  actions,
}: PageHeaderProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-4 lg:mb-6">
      <div className="flex min-w-0 flex-col gap-2">
        {crumbs.length > 0 && (
          <nav aria-label="Brotkrumen" className="text-sm text-ink-muted">
            {crumbs.map((crumb, index) => (
              <Fragment key={crumb.href ?? crumb.label}>
                {index > 0 && <span aria-hidden="true"> / </span>}
                {crumb.href ? (
                  <Link href={crumb.href} className="hover:text-primary">
                    {crumb.label}
                  </Link>
                ) : (
                  <span aria-current="page">{crumb.label}</span>
                )}
              </Fragment>
            ))}
          </nav>
        )}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
          <h1 className="font-serif text-page-title break-words text-primary-strong">
            {title}
          </h1>
          {badge}
        </div>
        {description && (
          <p className="max-w-prose text-ink-muted">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex w-full flex-wrap gap-3 sm:w-auto [&>*]:flex-1 sm:[&>*]:flex-none">
          {actions}
        </div>
      )}
    </div>
  );
}
