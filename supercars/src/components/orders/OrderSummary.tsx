import type { CartTotals } from "@/domain/cart";
import { Price } from "@/components/ui/Price";
import { formatMoney } from "@/lib/format";

interface OrderSummaryProps {
  readonly totals: CartTotals;
  readonly className?: string;
  /** Show "At checkout" instead of the shipping amount (cart drawer). */
  readonly shippingPending?: boolean;
}

/** Subtotal, offer discount, shipping and total, exactly as the server priced them. */
export function OrderSummary({ totals, className = "", shippingPending = false }: OrderSummaryProps) {
  const freeShipping = totals.shipping.amount === 0;
  const hasDiscount = totals.discount.amount > 0;
  const goods = { ...totals.subtotal, amount: totals.subtotal.amount - totals.discount.amount };
  return (
    <dl className={`space-y-2.5 text-[0.9375rem] ${className}`}>
      <div className="flex justify-between gap-4"><dt className="text-muted">Subtotal</dt><dd className="tabular-nums">{formatMoney(totals.subtotal)}</dd></div>
      {hasDiscount && (
        <div className="flex justify-between gap-4">
          <dt className="text-red-text">{totals.offer ? `${totals.offer.label} · ${totals.offer.percent}% off` : "Discount"}</dt>
          <dd className="font-semibold tabular-nums text-red-text">−{formatMoney(totals.discount)}</dd>
        </div>
      )}
      <div className="flex justify-between gap-4">
        <dt className="text-muted">Shipping</dt>
        <dd className="tabular-nums">{shippingPending && !freeShipping ? <span className="text-muted">At checkout</span> : freeShipping ? <span className="font-semibold text-positive">Free</span> : formatMoney(totals.shipping)}</dd>
      </div>
      {totals.shippingNote && <p className="text-[0.8125rem] text-subtle">{totals.shippingNote}</p>}
      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-4">
        <dt className="font-semibold">Total</dt>
        <dd className="text-xl tracking-[-0.02em]"><Price value={shippingPending && !freeShipping ? goods : totals.total} precise /></dd>
      </div>
    </dl>
  );
}
