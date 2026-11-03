import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * False in the server HTML and until React has hydrated, then true. Buttons
 * that only work with JavaScript stay disabled until then, so a click is
 * never lost (or turned into a native form submit).
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
