/** Moves focus after a re-render, once the target element exists. */
export function focusLater(id: string) {
  requestAnimationFrame(() => document.getElementById(id)?.focus());
}
