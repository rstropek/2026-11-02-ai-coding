"use client";

import { useId, useState } from "react";
import { add, formatNumber, parseNumber } from "@/lib/calculator";

const inputClassName =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-lg tabular-nums shadow-sm outline-none transition focus:border-teal-600 focus:ring-2 focus:ring-teal-600/30 dark:border-slate-600 dark:bg-slate-900";

/** Adds two user-provided numbers. Sample component to verify the setup. */
export function Calculator() {
  const firstId = useId();
  const secondId = useId();
  const [first, setFirst] = useState("");
  const [second, setSecond] = useState("");

  const a = parseNumber(first);
  const b = parseNumber(second);
  const sum = a !== undefined && b !== undefined ? add(a, b) : undefined;

  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(event) => event.preventDefault()}
    >
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-3">
        <div className="flex flex-col gap-1">
          <label htmlFor={firstId} className="text-sm font-medium">
            Erste Zahl
          </label>
          <input
            id={firstId}
            className={inputClassName}
            inputMode="decimal"
            autoComplete="off"
            value={first}
            onChange={(event) => setFirst(event.target.value)}
          />
        </div>
        <span aria-hidden="true" className="pb-2 text-2xl text-slate-400">
          +
        </span>
        <div className="flex flex-col gap-1">
          <label htmlFor={secondId} className="text-sm font-medium">
            Zweite Zahl
          </label>
          <input
            id={secondId}
            className={inputClassName}
            inputMode="decimal"
            autoComplete="off"
            value={second}
            onChange={(event) => setSecond(event.target.value)}
          />
        </div>
      </div>
      <output
        htmlFor={`${firstId} ${secondId}`}
        aria-live="polite"
        className="rounded-lg bg-teal-50 px-4 py-3 text-lg text-teal-900 dark:bg-teal-950 dark:text-teal-100"
      >
        {sum === undefined
          ? "Bitte zwei gültige Zahlen eingeben."
          : `Summe: ${formatNumber(sum)}`}
      </output>
    </form>
  );
}
