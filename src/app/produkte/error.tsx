"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { buttonClass } from "@/components/ui/styles";

/** Product data could not be read (e.g. the data folder is not reachable). */
export default function ProductsError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <Alert
      title="Die Produktdaten konnten nicht geladen werden"
      className="max-w-2xl"
    >
      <p>
        Bitte versuchen Sie es erneut. Wenn der Fehler bleibt, wenden Sie sich
        an den IT-Support.
      </p>
      <button
        type="button"
        className={buttonClass("secondary", {
          compact: true,
          className: "mt-3",
        })}
        onClick={() => retry()}
      >
        Erneut versuchen
      </button>
    </Alert>
  );
}
