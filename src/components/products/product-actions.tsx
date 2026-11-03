"use client";

import { Power, Trash2 } from "lucide-react";
import { type ReactNode, useId, useState, useTransition } from "react";
import type { ActionResult } from "@/app/produkte/actions";
import { Alert } from "@/components/ui/alert";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { buttonClass, cardClass } from "@/components/ui/styles";
import { useToast } from "@/components/ui/toast";
import { useHydrated } from "@/components/ui/use-hydrated";
import { plural } from "@/lib/format";

type AvailabilityToggleProps = {
  id: string;
  available: boolean;
  setAvailability: (id: string, available: boolean) => Promise<ActionResult>;
};

/** "Deaktivieren"/"Aktivieren" with undo. Deactivated products stay for existing licenses. */
export function AvailabilityToggle({
  id,
  available,
  setAvailability,
}: AvailabilityToggleProps) {
  const toast = useToast();
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  const change = (next: boolean, undoable: boolean) =>
    startTransition(async () => {
      const result = await setAvailability(id, next);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setError(undefined);
      if (undoable) {
        toast(
          next
            ? `${id} ist wieder verfügbar.`
            : `${id} ist jetzt nicht verfügbar. Bestehende Lizenzen bleiben gültig.`,
          () => change(!next, false),
        );
      }
    });

  return (
    <>
      <button
        type="button"
        className={buttonClass("secondary")}
        disabled={pending || !hydrated}
        aria-busy={pending || undefined}
        onClick={() => change(!available, true)}
      >
        <Power size={16} strokeWidth={1.75} aria-hidden="true" />
        {available ? "Deaktivieren" : "Aktivieren"}
      </button>
      {error && (
        <Alert
          title="Verfügbarkeit nicht geändert"
          className="w-full basis-full"
        >
          <p>{error}</p>
        </Alert>
      )}
    </>
  );
}

type DeleteProductProps = {
  id: string;
  featureCount: number;
  deleteProduct: (id: string) => Promise<ActionResult>;
};

/**
 * Deleting is allowed only while no licenses reference the product. Licenses
 * do not exist yet, so it is always possible for now.
 */
export function DeleteProduct({
  id,
  featureCount,
  deleteProduct,
}: DeleteProductProps) {
  const [open, setOpen] = useState(false);
  const uid = useId();
  const hydrated = useHydrated();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();
  // "Das Produkt KASSE-T200 und seine 4 Features werden endgültig entfernt."
  const what = (name: ReactNode) =>
    featureCount === 0 ? (
      <>Das Produkt {name} wird</>
    ) : (
      <>
        Das Produkt {name} und {featureCount === 1 ? "sein" : "seine"}{" "}
        {plural(featureCount, "Feature", "Features")} werden
      </>
    );

  return (
    <section
      aria-labelledby={`${uid}-title`}
      className={`${cardClass} flex flex-col gap-4 p-5 sm:p-6`}
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 id={`${uid}-title`} className="text-base font-semibold text-ink">
            Produkt löschen
          </h2>
          <p
            id={`${uid}-help`}
            className="mt-1 max-w-prose text-sm text-ink-muted"
          >
            Löschen ist nur möglich, solange es keine Lizenzen für das Produkt
            gibt. {what("")} endgültig entfernt. Wenn es nur nicht mehr verkauft
            wird, deaktivieren Sie es.
          </p>
        </div>
        <button
          type="button"
          className={buttonClass("danger")}
          aria-describedby={`${uid}-help`}
          disabled={!hydrated}
          onClick={() => setOpen(true)}
        >
          <Trash2 size={16} strokeWidth={1.75} aria-hidden="true" />
          Produkt löschen
        </button>
      </div>
      {error && (
        <Alert title="Produkt nicht gelöscht">
          <p>{error}</p>
        </Alert>
      )}
      <ConfirmDialog
        open={open}
        title={`${id} löschen?`}
        confirmLabel="Produkt löschen"
        pending={pending}
        onClose={() => setOpen(false)}
        onConfirm={() =>
          startTransition(async () => {
            // On success the action redirects to the product list.
            const result = await deleteProduct(id);
            if (!result.ok) {
              setOpen(false);
              setError(result.message);
            }
          })
        }
      >
        <p>
          {what(<span className="font-mono text-ink">{id}</span>)} endgültig
          entfernt. Das lässt sich nicht rückgängig machen.
        </p>
      </ConfirmDialog>
    </section>
  );
}
