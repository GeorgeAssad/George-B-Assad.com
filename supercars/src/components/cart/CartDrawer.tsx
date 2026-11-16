"use client";

import { Button } from "@/components/ui/Button";
import { Dialog } from "@/components/ui/Dialog";
import { IconClose } from "@/components/ui/icons";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { useCart } from "@/lib/use-cart";
import { useCartQuote } from "@/lib/use-cart-quote";
import { closeCartDrawer, useCartDrawerOpen } from "@/lib/ui-store";
import { CartLines } from "./CartLines";

function DrawerBody() {
  const { items, setQuantity, remove } = useCart();
  const q = useCartQuote(items);
  const hasItems = items.length > 0;

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between gap-4 px-5 pb-2 pt-5">
        <h2 className="h-display text-[1.75rem]">Your cart</h2>
        <button type="button" onClick={closeCartDrawer} className="lg-icon-button bg-fill" aria-label="Close cart">
          <IconClose size={18} />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2">
        {hasItems ? (
          <CartLines items={items} status={q.status} quote={q.quote} compact onQuantity={setQuantity} onRemove={remove} onRetry={q.retry} onNavigate={closeCartDrawer} />
        ) : (
          <div className="flex h-full flex-col items-center justify-center py-16 text-center">
            <p className="h-display text-[1.75rem]">Nothing here yet</p>
            <p className="mt-3 max-w-xs text-muted">Pick your car, choose a style and add your name. Your poster will wait here.</p>
            <Button href="/create" className="mt-6" onClick={closeCartDrawer}>Create your poster</Button>
          </div>
        )}
      </div>

      {hasItems && (
        <div className="safe-bottom border-t border-line px-5 pt-4">
          {q.quote ? <OrderSummary totals={q.quote.totals} shippingPending /> : <p className="pb-2 text-sm text-muted">Calculating…</p>}
          <div className="mt-4 grid gap-2">
            <Button href="/checkout" size="lg" onClick={closeCartDrawer} aria-label="Checkout">Checkout</Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function CartDrawer() {
  const open = useCartDrawerOpen();
  return (
    <Dialog open={open} onClose={closeCartDrawer} label="Shopping cart" placement="right">
      <DrawerBody />
    </Dialog>
  );
}
