import Link from "next/link";
import type { ReactNode } from "react";
import { NavDrawer } from "./nav-drawer";
import { NavItems } from "./nav-items";

const SAFE_X =
  "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:px-6";

/** Header with wordmark, side navigation (drawer on phones) and the main area. */
export function AppShell({ children }: { children: ReactNode }) {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-control focus:bg-surface focus:px-4 focus:py-2 focus:shadow-overlay"
      >
        Zum Inhalt springen
      </a>
      <header
        className={`flex h-14 items-center gap-3 border-b border-line-subtle bg-surface lg:h-16 lg:gap-6 lg:px-6 ${SAFE_X}`}
      >
        <NavDrawer />
        <Link href="/produkte" className="flex items-center gap-3">
          <span aria-hidden="true" className="h-7 w-0.5 bg-brand-red lg:h-8" />
          <span className="text-lg text-ink-muted lg:text-xl">
            Lizenz<span className="font-semibold text-ink">verwaltung</span>
          </span>
        </Link>
      </header>
      <div className="flex flex-1">
        <nav
          aria-label="Hauptnavigation"
          className="hidden w-60 shrink-0 border-r border-line-subtle bg-surface py-4 lg:block"
        >
          <NavItems />
        </nav>
        <main
          id="main"
          tabIndex={-1}
          className={`min-w-0 flex-1 py-5 focus:outline-none lg:px-8 lg:py-8 ${SAFE_X}`}
        >
          <div className="mx-auto max-w-screen-2xl">{children}</div>
        </main>
      </div>
    </>
  );
}
