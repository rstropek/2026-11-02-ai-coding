"use client";

import { Menu, X } from "lucide-react";
import { useRef } from "react";
import { iconButtonClass } from "@/components/ui/styles";
import { NavItems } from "./nav-items";

/** Navigation for phones: a menu button that opens a modal side drawer. */
export function NavDrawer() {
  const ref = useRef<HTMLDialogElement>(null);
  const close = () => ref.current?.close();

  return (
    <>
      <button
        type="button"
        className={`${iconButtonClass} -ml-2 lg:hidden`}
        aria-label="Navigation öffnen"
        aria-haspopup="dialog"
        onClick={() => ref.current?.showModal()}
      >
        <Menu size={20} strokeWidth={1.75} aria-hidden="true" />
      </button>
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: closing by backdrop click is for pointers; keyboard users close with Escape or the close button */}
      <dialog
        ref={ref}
        aria-label="Navigation"
        className="m-0 h-dvh max-h-none w-72 max-w-[85vw] bg-surface shadow-overlay backdrop:bg-ink/40"
        onClick={(event) => {
          // A click on the backdrop targets the dialog itself.
          if (event.target === event.currentTarget) {
            close();
          }
        }}
      >
        <div className="flex h-14 items-center justify-between border-b border-line-subtle pr-2 pl-[max(1.5rem,env(safe-area-inset-left))]">
          <span className="text-lg text-ink-muted">
            Lizenz<span className="font-semibold text-ink">verwaltung</span>
          </span>
          <button
            type="button"
            className={iconButtonClass}
            aria-label="Navigation schließen"
            onClick={close}
          >
            <X size={20} strokeWidth={1.75} aria-hidden="true" />
          </button>
        </div>
        <nav
          aria-label="Hauptnavigation"
          className="py-4 pl-[env(safe-area-inset-left)]"
        >
          <NavItems onNavigate={close} />
        </nav>
      </dialog>
    </>
  );
}
