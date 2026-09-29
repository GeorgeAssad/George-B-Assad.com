"use client";

import type { ReactNode } from "react";

interface FilterChipProps {
  readonly pressed: boolean;
  readonly onClick: () => void;
  readonly children: ReactNode;
  readonly count?: number;
  readonly disabled?: boolean;
}

/** Toggle chip. Uses aria-pressed so screen readers announce the state. */
export function FilterChip({ pressed, onClick, children, count, disabled }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={pressed}
      disabled={disabled}
      className={`inline-flex flex-none items-center gap-2 rounded-full border px-4 py-2 text-[0.8125rem] font-semibold tracking-wide transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? "border-red bg-red text-on-red" : "border-line-strong text-muted hover:border-fg hover:text-fg"
      }`}
    >
      {children}
      {count !== undefined && <span className={`text-[0.6875rem] tabular-nums ${pressed ? "text-on-red/80" : "text-subtle"}`}>{count}</span>}
    </button>
  );
}
