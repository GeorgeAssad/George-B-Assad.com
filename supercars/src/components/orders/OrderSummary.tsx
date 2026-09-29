import type { CartTotals } from "@/domain/cart";
import { Price } from "@/components/ui/Price";
import { formatMoney } from "@/lib/format";

interface OrderSummaryProps {
  readonly totals: CartTotals;
  readonly className?: string;
  /** Show "Calculated at checkout" instead of the shipping amount (cart page). */
  readonly shippingPending?: boolean;
}

export function OrderSummary({ totals, className = "", shippingPending = false }: OrderSummaryProps) {
  const freeShipping = totals.shipping.amount === 0;
  return (
    <dl className={`space-y-3 text-sm ${className}`}>
      <div className="flex justify-between gap-4"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd></div>
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Shipping <span className="text-subtle">(placeholder rate)</span></dt>
        <dd className="tabular-nums">{shippingPending ? <span className="text-muted">At checkout</span> : freeShipping ? "Free" : formatMoney(totals.shipping)}</dd>
      </div>
      {totals.shippingNote && <p className="text-xs text-subtle">{totals.shippingNote}</p>}
      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <dt className="font-semibold uppercase tracking-[0.14em]">Total</dt>
        <dd className="text-xl"><Price value={shippingPending ? totals.subtotal : totals.total} precise /></dd>
      </div>
    </dl>
  );
}
