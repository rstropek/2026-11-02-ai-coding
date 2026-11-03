"use client";

import { Box } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Suspense } from "react";

// Only areas that exist are listed; customers, licenses and the overview
// follow in later iterations.
const NAV = [{ label: "Produkte", href: "/produkte", Icon: Box }];

const itemClass =
  "relative flex items-center gap-3 px-6 py-2.5 text-sm tracking-wide text-ink-muted hover:bg-line-subtle hover:text-ink aria-[current=page]:bg-primary-subtle aria-[current=page]:font-medium aria-[current=page]:text-primary-strong aria-[current=page]:before:absolute aria-[current=page]:before:inset-y-1 aria-[current=page]:before:left-0 aria-[current=page]:before:w-1 aria-[current=page]:before:bg-primary";

type NavItemsProps = { onNavigate?: () => void };

/**
 * The current path is only known at request time, so the static shell shows
 * the items without highlight and the active one streams in.
 */
export function NavItems(props: NavItemsProps) {
  return (
    <Suspense fallback={<Items {...props} pathname="" />}>
      <ActiveNavItems {...props} />
    </Suspense>
  );
}

function ActiveNavItems(props: NavItemsProps) {
  return <Items {...props} pathname={usePathname()} />;
}

function Items({ onNavigate, pathname }: NavItemsProps & { pathname: string }) {
  return (
    <ul>
      {NAV.map(({ label, href, Icon }) => {
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <li key={href}>
            <Link
              href={href}
              aria-current={active ? "page" : undefined}
              className={itemClass}
              onClick={onNavigate}
            >
              <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
              {label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
