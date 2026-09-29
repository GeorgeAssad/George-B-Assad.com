import type { Money } from "@/domain/money";
import { formatMoney, formatPrice } from "@/lib/format";

interface PriceProps {
  readonly value: Money;
  /** "from" shows a small prefix, e.g. "from €39". */
  readonly prefix?: string;
  readonly precise?: boolean;
  readonly className?: string;
}

/** Prices are the one place red type is used. Numerals are tabular for alignment. */
export function Price({ value, prefix, precise = false, className = "" }: PriceProps) {
  return (
    <span className={`tabular-nums ${className}`}>
      {prefix && <span className="mr-1.5 text-[0.6875rem] font-semibold uppercase tracking-[0.14em] text-subtle">{prefix}</span>}
      <span className="font-semibold text-red-text">{precise ? formatMoney(value) : formatPrice(value)}</span>
    </span>
  );
}
