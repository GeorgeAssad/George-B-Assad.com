"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import type { Order, PublicOrderView } from "@/domain/order";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { Price } from "@/components/ui/Price";
import { IconArrow, IconPackage } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatDateRange, formatMoney, personalizationSummary } from "@/lib/format";
import { getLocalOrder } from "@/lib/order-store";
import { useHydrated } from "@/lib/use-hydrated";
import { buildTimeline } from "@/lib/order-timeline";
import { OrderSummary } from "./OrderSummary";
import { OrderTimeline } from "./OrderTimeline";
import { TrackingResult } from "./TrackingResult";

type Remote = { kind: "loading" } | { kind: "public"; view: PublicOrderView } | { kind: "unknown" };

interface OrderSuccessProps {
  readonly orderId: string;
  readonly cars: readonly CarEntry[];
  readonly templates: readonly DesignTemplate[];
}

export function OrderSuccess({ orderId, cars, templates }: OrderSuccessProps) {
  const [remote, setRemote] = useState<Remote>({ kind: "loading" });
  const [copied, setCopied] = useState(false);
  const hydrated = useHydrated();
  // Orders placed in this browser are cached locally (prototype persistence); derive, don't sync via effect.
  const local = useMemo<Order | null>(() => (hydrated ? getLocalOrder(orderId) : null), [hydrated, orderId]);

  useEffect(() => {
    if (!hydrated || local) return;
    const controller = new AbortController();
    fetch("/api/orders/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId }), signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) return setRemote({ kind: "unknown" });
        const json = (await res.json()) as { order: PublicOrderView };
        setRemote({ kind: "public", view: json.order });
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name !== "AbortError") setRemote({ kind: "unknown" });
      });
    return () => controller.abort();
  }, [hydrated, local, orderId]);

  const state: { kind: "loading" } | { kind: "full"; order: Order } | Exclude<Remote, { kind: "loading" }> = !hydrated ? { kind: "loading" } : local ? { kind: "full", order: local } : remote;

  if (state.kind === "loading") {
    return <div aria-busy="true" className="space-y-6"><Skeleton className="mx-auto size-20 rounded-full" /><Skeleton className="mx-auto h-16 w-80 max-w-full" /><Skeleton className="h-72" /></div>;
  }

  if (state.kind === "unknown") {
    return (
      <EmptyState
        icon={<IconPackage size={24} />}
        title="Unknown order."
        message="We couldn't find that order on this device. Orders from this prototype are stored in your browser, so open the confirmation on the same device you used to check out, or try tracking by number."
        action={{ label: "Track an order", href: "/track" }}
        secondary={{ label: "Create a poster", href: "/create" }}
      />
    );
  }

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(orderId);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard unavailable (insecure context / permissions): the number is selectable text.
    }
  };

  const header = (
    <header className="text-center">
      <div className="mx-auto flex size-20 items-center justify-center rounded-full bg-red text-on-red [animation:pop_0.8s_var(--ease)_backwards] shadow-[0_0_0_10px_color-mix(in_srgb,var(--red)_18%,transparent)]" aria-hidden="true">
        <svg viewBox="0 0 24 24" width="38" height="38" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5" strokeDasharray="24" strokeDashoffset="24" style={{ animation: "draw 0.7s 0.5s var(--ease) forwards" }} /></svg>
      </div>
      <p className="eyebrow mt-8 justify-center">SC / Confirmation</p>
      <h1 className="h-display mt-4 text-[clamp(3rem,10vw,6.5rem)]">Order confirmed.</h1>
      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
        <p className="rounded-full border border-line-strong px-4 py-2 text-sm">Order number <strong className="ml-1 select-all font-semibold tabular-nums">{orderId}</strong></p>
        <button type="button" onClick={copy} className="rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted hover:text-fg" aria-live="polite">{copied ? "Copied" : "Copy"}</button>
        <Badge tone="demo">Demo order · no payment taken</Badge>
      </div>
    </header>
  );

  const actions = (
    <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
      <Button href={`/track?order=${encodeURIComponent(orderId)}`} size="lg">Track order <IconArrow size={18} /></Button>
      <Button href="/create" variant="secondary" size="lg">Create another poster</Button>
    </div>
  );

  if (state.kind === "public") {
    return <div>{header}<div className="mt-12"><TrackingResult order={state.view} animate /></div>{actions}</div>;
  }

  const { order } = state;
  const carBySlug = new Map(cars.map((c) => [c.generation.slug, c]));
  const tplById = new Map(templates.map((t) => [t.id as string, t]));
  const timeline = buildTimeline(order.status, order.createdAt);
  const firstName = order.customer.name.split(" ")[0] ?? "";

  return (
    <div>
      {header}
      <p className="mx-auto mt-6 max-w-lg text-center text-muted">Thank you{firstName ? `, ${firstName}` : ""}. A confirmation would be sent to <strong className="text-fg">{order.customer.email}</strong> — email delivery isn&apos;t connected in this prototype.</p>

      <section aria-labelledby="progress-title" className="card mt-12 p-6 sm:p-8">
        <h2 id="progress-title" className="h-display text-3xl">Order progress</h2>
        <div className="mt-6"><OrderTimeline entries={timeline} animate /></div>
      </section>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_1fr]">
        <section aria-labelledby="items-title" className="card p-6 sm:p-8">
          <h2 id="items-title" className="h-display text-3xl">Your order</h2>
          <ul className="mt-5 divide-y divide-line">
            {order.items.map((i) => {
              const car = carBySlug.get(i.carSlug);
              const tpl = tplById.get(i.templateId);
              return (
                <li key={i.id} className="flex gap-4 py-5 first:pt-0">
                  <div className="w-20 flex-none overflow-hidden rounded-[3px] ring-1 ring-line-strong sm:w-24">
                    {car && tpl ? <PosterPreview template={tpl} vehicle={car.generation.vehicle} customization={i.customization} vehicleName={car.generation.displayName} specs={car.generation.specs} sizeId={i.sizeId} /> : <div className="aspect-[5/7] bg-elevated" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="spec">{i.productName}</p>
                    <h3 className="h-display mt-1 text-2xl">{i.vehicleName}</h3>
                    <p className="mt-1 text-sm text-muted">{tpl?.name ?? i.templateId} style · {i.sizeLabel} · ×{i.quantity}</p>
                    <p className="truncate text-sm text-muted">{personalizationSummary(i.customization)}</p>
                  </div>
                  <Price value={i.lineTotal} precise className="flex-none text-base" />
                </li>
              );
            })}
          </ul>
          <div className="mt-2 border-t border-line pt-5">
            <OrderSummary totals={{ subtotal: order.subtotal, shipping: order.shipping, total: order.total, shippingNote: "" }} />
          </div>
        </section>

        <section aria-labelledby="ship-title" className="card space-y-6 p-6 sm:p-8">
          <div>
            <h2 id="ship-title" className="h-display text-3xl">Shipping</h2>
            <address className="mt-4 not-italic leading-relaxed text-muted">
              <span className="font-medium text-fg">{order.customer.name}</span><br />
              {order.shippingAddress.line1}<br />
              {order.shippingAddress.line2 && <>{order.shippingAddress.line2}<br /></>}
              {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />
              {order.shippingAddress.country}
            </address>
          </div>
          <div className="border-t border-line pt-6">
            <p className="spec">Estimated delivery</p>
            <p className="mt-1.5 text-lg font-medium">{formatDateRange(order.estimatedDelivery.from, order.estimatedDelivery.to)}</p>
            <p className="mt-1 text-xs text-subtle">Placeholder estimate for the prototype.</p>
          </div>
          <div className="border-t border-line pt-6">
            <p className="spec">Payment</p>
            <p className="mt-1.5 font-medium">Demo payment · {formatMoney(order.payment.amount)}</p>
            <p className="mt-1 text-xs text-subtle">No card data was collected. No money moved.</p>
          </div>
        </section>
      </div>

      {actions}
      <p className="mt-6 text-center text-xs text-subtle">Need help? <Link href="/shipping" className="underline underline-offset-4">Shipping</Link> · <Link href="/returns" className="underline underline-offset-4">Returns</Link></p>
    </div>
  );
}
