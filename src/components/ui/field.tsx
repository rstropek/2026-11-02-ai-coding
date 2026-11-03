import { CircleAlert } from "lucide-react";
import type { ReactNode } from "react";

type FieldProps = {
  /** ID of the control; help, counter and error IDs derive from it. */
  id: string;
  label: ReactNode;
  required?: boolean;
  help?: ReactNode;
  /** e.g. "12 / 20" */
  counter?: string;
  error?: string;
  /** Hide the label visually (it stays for screen readers). */
  hideLabel?: boolean;
  children: ReactNode;
};

/** Label above, help below the label, the control, error below the control. */
export function Field({
  id,
  label,
  required = false,
  help,
  counter,
  error,
  hideLabel = false,
  children,
}: FieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between gap-4">
        <label
          htmlFor={id}
          className={`text-sm font-medium text-ink${hideLabel ? " sr-only" : ""}`}
        >
          {label}
          {required && (
            <>
              {" "}
              <span aria-hidden="true" className="text-danger">
                *
              </span>
            </>
          )}
        </label>
        {counter && (
          <span className="text-xs text-ink-muted tabular-nums">{counter}</span>
        )}
      </div>
      {help && (
        <p id={`${id}-help`} className="text-sm text-ink-muted">
          {help}
        </p>
      )}
      {children}
      <FieldError id={id} error={error} />
    </div>
  );
}

export function FieldError({ id, error }: { id: string; error?: string }) {
  if (!error) {
    return null;
  }
  return (
    <p
      id={`${id}-error`}
      className="flex items-center gap-1.5 text-sm text-danger"
    >
      <CircleAlert
        size={16}
        strokeWidth={1.75}
        aria-hidden="true"
        className="shrink-0"
      />
      {error}
    </p>
  );
}

/** ARIA attributes that connect a control to its help text and error. */
export function fieldAria(
  id: string,
  { help = false, error }: { help?: boolean; error?: string },
) {
  const describedBy = [help && `${id}-help`, error && `${id}-error`]
    .filter(Boolean)
    .join(" ");
  return {
    id,
    "aria-invalid": error ? true : undefined,
    "aria-describedby": describedBy || undefined,
  } as const;
}
