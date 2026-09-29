"use client";

import { IconMinus, IconPlus } from "@/components/ui/icons";
import { LIMITS } from "@/lib/validation";

interface QuantityStepperProps {
  readonly value: number;
  readonly onChange: (next: number) => void;
  /** Used in accessible names, e.g. "BMW M3 G80 poster". */
  readonly label: string;
}

export function QuantityStepper({ value, onChange, label }: QuantityStepperProps) {
  const btn = "flex size-9 items-center justify-center rounded-full text-muted transition-colors hover:text-fg disabled:cursor-not-allowed disabled:opacity-35";
  return (
    <div className="inline-flex items-center rounded-full border border-line-strong" role="group" aria-label={`Quantity for ${label}`}>
      <button type="button" className={btn} onClick={() => onChange(value - 1)} disabled={value <= 1} aria-label={`Decrease quantity of ${label}`}>
        <IconMinus size={16} />
      </button>
      <span className="min-w-6 text-center text-sm font-semibold tabular-nums" aria-live="polite" aria-atomic="true">{value}</span>
      <button type="button" className={btn} onClick={() => onChange(value + 1)} disabled={value >= LIMITS.quantity} aria-label={`Increase quantity of ${label}`}>
        <IconPlus size={16} />
      </button>
    </div>
  );
}
