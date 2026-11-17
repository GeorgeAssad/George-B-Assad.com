import type { CartTotals } from "@/domain/cart";
import { formatMoney, formatPrice } from "@/lib/format";
import { IconCheck } from "@/components/ui/icons";

/** "Add €13.70 more for free shipping" with a progress bar; only while a free-shipping offer runs. */
export function FreeShippingProgress({ totals, className = "" }: { totals: CartTotals; className?: string }) {
  const free = totals.freeShipping;
  if (!free || free.minSubtotal.amount === 0) return null;
  const done = free.remaining.amount === 0;
  const pct = Math.min(100, Math.round(((free.minSubtotal.amount - free.remaining.amount) / free.minSubtotal.amount) * 100));
  return (
    <div className={`rounded-[var(--lg-radius-sm)] bg-fill px-3.5 py-3 ${className}`} role="status" aria-live="polite">
      <p className="flex items-center gap-2 text-[0.875rem]">
        {done ? (
          <><span className="flex size-5 flex-none items-center justify-center rounded-full bg-positive text-surface"><IconCheck size={12} /></span><span><strong className="font-semibold">Free shipping unlocked.</strong> {free.label} applies to this order.</span></>
        ) : (
          <span>Add <strong className="font-semibold tabular-nums">{formatMoney(free.remaining)}</strong> more for <strong className="font-semibold">free shipping</strong> (orders over {formatPrice(free.minSubtotal)})</span>
        )}
      </p>
      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--lg-fill-strong)]" aria-hidden="true">
        <div className={`h-full rounded-full transition-[width] duration-500 ${done ? "bg-positive" : "bg-red"}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
