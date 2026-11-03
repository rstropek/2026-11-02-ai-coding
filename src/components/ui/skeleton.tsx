/** Loading placeholder rows inside a card. */
export function SkeletonRows({ rows }: { rows: number }) {
  return (
    <div
      className="flex flex-col divide-y divide-line-subtle"
      role="status"
      aria-busy="true"
      aria-label="Wird geladen"
    >
      {Array.from({ length: rows }, (_, index) => (
        // biome-ignore lint/suspicious/noArrayIndexKey: static placeholders
        <div key={index} className="flex items-center gap-6 px-4 py-4">
          <div className="h-4 w-28 rounded bg-line-subtle motion-safe:animate-pulse" />
          <div className="h-4 flex-1 rounded bg-line-subtle motion-safe:animate-pulse" />
          <div className="hidden h-4 w-20 rounded bg-line-subtle motion-safe:animate-pulse md:block" />
        </div>
      ))}
    </div>
  );
}
