import type { Money } from "@/domain/money";
import { formatMoney, formatPrice } from "@/lib/format";

interface PriceProps {
  readonly value: Money;
  /** "from" shows a small prefix, e.g. "from €39". */
  readonly prefix?: string;
  readonly precise?: boolean;
  readonly className?: string;
}

/** Prices are plain, semibold text (the accent colour is kept for actions). Numerals are tabular for alignment. */
export function Price({ value, prefix, precise = false, className = "" }: PriceProps) {
  return (
    <span className={`tabular-nums ${className}`}>
      {prefix && <span className="mr-1.5 text-[0.8125rem] font-medium text-subtle">{prefix}</span>}
      <span className="font-semibold">{precise ? formatMoney(value) : formatPrice(value)}</span>
    </span>
  );
}
