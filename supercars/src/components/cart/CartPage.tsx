"use client";

import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconArrow, IconCart } from "@/components/ui/icons";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { Skeleton } from "@/components/ui/Skeleton";
import { useCart } from "@/lib/use-cart";
import { useCartQuote } from "@/lib/use-cart-quote";
import { CartLines } from "./CartLines";

export function CartPage() {
  const { items, hydrated, setQuantity, remove } = useCart();
  const q = useCartQuote(items, hydrated);

  if (!hydrated) {
    return (
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_24rem]" aria-busy="true">
        <div className="space-y-5"><Skeleton className="h-40" /><Skeleton className="h-40" /></div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <EmptyState
        icon={<IconCart size={24} />}
        title="Your cart is empty."
        message="Pick your car, choose a style and add your name. Your poster will wait here until you're ready."
        action={{ label: "Create your poster", href: "/create" }}
        secondary={{ label: "Explore cars", href: "/cars" }}
      />
    );
  }

  return (
    <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:gap-14">
      <section aria-label="Cart items">
        <CartLines items={items} status={q.status} quote={q.quote} onQuantity={setQuantity} onRemove={remove} onRetry={q.retry} />
      </section>
      <aside aria-label="Order summary" className="card p-6 lg:sticky lg:top-28">
        <h2 className="h-display text-3xl">Summary</h2>
        <div className="mt-5">
          {q.quote ? <OrderSummary totals={q.quote.totals} shippingPending /> : <Skeleton className="h-32" />}
        </div>
        <Button href="/checkout" size="lg" className="mt-6 w-full" aria-disabled={!q.quote || q.quote.lines.length === 0}>Checkout <IconArrow size={18} /></Button>
        <p className="mt-4 text-center text-xs text-subtle">Demo store — checkout simulates a payment. No money moves.</p>
      </aside>
    </div>
  );
}
