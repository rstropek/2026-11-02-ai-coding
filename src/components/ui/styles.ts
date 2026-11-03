// Class recipes of the starfinanz-ui design system
// (.claude/skills/starfinanz-ui/references/components.md). Shared here so every
// screen uses exactly the same buttons, inputs, cards and tables.

const BUTTON =
  "inline-flex items-center justify-center gap-2 rounded-control px-4 h-10 text-sm font-medium tracking-wide whitespace-nowrap transition-colors disabled:cursor-not-allowed disabled:opacity-50";

const BUTTON_VARIANTS = {
  // One per view: the main task of the page.
  primary:
    "bg-primary text-white hover:bg-primary-hover active:bg-primary-strong",
  secondary: "border border-line bg-surface text-primary hover:bg-line-subtle",
  ghost: "text-primary hover:bg-primary-subtle",
  // Destructive. Outlined in pages, filled only inside the confirmation dialog.
  danger: "border border-danger bg-surface text-danger hover:bg-danger-subtle",
  dangerSolid: "bg-danger text-white hover:opacity-90",
};

export type ButtonVariant = keyof typeof BUTTON_VARIANTS;

/** Classes for a button or a link that looks like one. */
export function buttonClass(
  variant: ButtonVariant,
  { compact = false, className = "" } = {},
): string {
  return `${BUTTON} ${BUTTON_VARIANTS[variant]}${compact ? " h-8 px-3" : ""}${className ? ` ${className}` : ""}`;
}

/** Square icon-only button; needs aria-label and title. */
export const iconButtonClass =
  "inline-flex size-10 shrink-0 items-center justify-center rounded-control text-ink-muted transition-colors hover:bg-line-subtle hover:text-ink disabled:cursor-not-allowed disabled:opacity-40";

const INPUT_BASE =
  "w-full rounded-control border border-line-strong bg-surface px-3 text-ink placeholder:text-ink-subtle focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30 aria-invalid:border-danger aria-invalid:ring-danger/30 disabled:bg-canvas disabled:text-ink-muted read-only:bg-canvas read-only:text-ink-muted";

/** Text inputs and selects. */
export const inputClass = `${INPUT_BASE} h-10`;
/** Textareas (no fixed height). */
export const textareaClass = `${INPUT_BASE} py-2`;

export const cardClass =
  "rounded-control border border-line-subtle bg-surface shadow-card";

export const tableHeadCellClass =
  "px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-ink-muted";

export const textLinkClass =
  "text-primary underline underline-offset-2 hover:text-primary-hover";

export const tagClass =
  "rounded-full bg-line-subtle px-2.5 py-0.5 text-xs whitespace-nowrap text-ink-muted";
