import { CircleAlert, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";

type AlertProps = {
  title: string;
  children?: ReactNode;
  tone?: "danger" | "warning";
  className?: string;
};

const tones = {
  danger: "border-danger/30 bg-danger-subtle text-danger",
  warning: "border-warning/30 bg-warning-subtle text-warning",
};

/** Persistent inline message for errors and important warnings. */
export function Alert({
  title,
  children,
  tone = "danger",
  className = "",
}: AlertProps) {
  const Icon = tone === "danger" ? CircleAlert : TriangleAlert;
  return (
    <div
      role="alert"
      className={`flex gap-3 rounded-control border p-4 text-sm ${tones[tone]} ${className}`}
    >
      <Icon
        size={20}
        strokeWidth={1.75}
        aria-hidden="true"
        className="shrink-0"
      />
      <div className="min-w-0">
        <p className="font-semibold">{title}</p>
        {children}
      </div>
    </div>
  );
}
