"use client";

import { type ReactNode, useEffect, useId, useRef } from "react";
import { buttonClass } from "./styles";

type ConfirmDialogProps = {
  open: boolean;
  title: string;
  children: ReactNode;
  confirmLabel: string;
  pending?: boolean;
  onConfirm: () => void;
  onClose: () => void;
};

/**
 * Confirmation for destructive actions, built on the native <dialog> (focus
 * trap and Escape for free). Focus starts on "Abbrechen".
 */
export function ConfirmDialog({
  open,
  title,
  children,
  confirmLabel,
  pending = false,
  onConfirm,
  onClose,
}: ConfirmDialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
      // Destructive dialogs start on the safe choice.
      cancelRef.current?.focus();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      className="m-auto w-[calc(100%-2rem)] max-w-md rounded-control bg-surface p-6 shadow-overlay backdrop:bg-ink/40"
    >
      <h2 id={titleId} className="text-lg font-semibold text-ink">
        {title}
      </h2>
      <div className="mt-2 text-sm text-ink-muted">{children}</div>
      <div className="mt-6 flex flex-wrap justify-end gap-3">
        <button
          ref={cancelRef}
          type="button"
          className={buttonClass("secondary")}
          onClick={onClose}
        >
          Abbrechen
        </button>
        <button
          type="button"
          className={buttonClass("dangerSolid")}
          disabled={pending}
          aria-busy={pending || undefined}
          onClick={onConfirm}
        >
          {confirmLabel}
        </button>
      </div>
    </dialog>
  );
}
