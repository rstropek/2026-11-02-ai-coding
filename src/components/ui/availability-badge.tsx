/** Status pill for "Aktuell verfügbar". Text label, not color alone. */
export function AvailabilityBadge({ available }: { available: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium whitespace-nowrap ${
        available
          ? "bg-success-subtle text-success"
          : "bg-line-subtle text-ink-muted"
      }`}
    >
      <span className="size-1.5 rounded-full bg-current" aria-hidden="true" />
      {available ? "Verfügbar" : "Nicht verfügbar"}
    </span>
  );
}
