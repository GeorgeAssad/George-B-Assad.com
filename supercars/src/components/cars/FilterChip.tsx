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
      className={`tap inline-flex min-h-9 flex-none items-center gap-1.5 rounded-full px-3.5 text-[0.8125rem] font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40 ${
        pressed ? "bg-fg text-bg" : "bg-surface text-fg shadow-[inset_0_0_0_1px_var(--line)] hover:bg-elevated"
      }`}
    >
      {children}
      {count !== undefined && <span className={`tabular-nums ${pressed ? "opacity-80" : "text-subtle"}`}>{count}</span>}
    </button>
  );
}
