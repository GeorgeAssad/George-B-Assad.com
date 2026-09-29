"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import type { ShippingDestination } from "@/domain/customer";
import type { Order } from "@/domain/order";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { OrderSummary } from "@/components/orders/OrderSummary";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconCart, IconCheck, IconLock } from "@/components/ui/icons";
import { Price } from "@/components/ui/Price";
import { Skeleton } from "@/components/ui/Skeleton";
import { track } from "@/lib/analytics";
import { formatMoney, personalizationSummary } from "@/lib/format";
import { ORDER_ID_PATTERN } from "@/lib/ids";
import { saveLocalOrder } from "@/lib/order-store";
import { useCart } from "@/lib/use-cart";
import { useCartQuote } from "@/lib/use-cart-quote";
import { addressSchema, customerInputSchema } from "@/lib/validation";
import { FormField } from "./FormField";

interface Values { name: string; email: string; phone: string; line1: string; line2: string; city: string; postalCode: string; country: string }
type Errors = Partial<Record<keyof Values, string>>;
type Phase = { kind: "idle" } | { kind: "processing"; step: number } | { kind: "error"; message: string };

const EMPTY: Values = { name: "", email: "", phone: "", line1: "", line2: "", city: "", postalCode: "", country: "" };
const PROCESSING = ["Creating a demo payment session", "Confirming the demo payment", "Creating your order"];
const ERROR_COPY: Record<string, string> = {
  cart_changed: "Your cart changed while checking out. Please review it and try again.",
  session_expired: "Your checkout session expired. Please try again.",
  items_unavailable: "Something in your cart is no longer available. Please review your cart.",
  rate_limited: "Too many attempts. Please wait a moment and try again.",
  payment_unavailable: "Checkout is temporarily unavailable. Please try again shortly.",
};

const pause = (ms: number) => new Promise<void>((r) => window.setTimeout(r, ms));

/** Client-side validation is UX only — the server re-validates everything and is authoritative. */
function validate(v: Values): Errors {
  const errors: Errors = {};
  const customer = customerInputSchema.safeParse({ name: v.name, email: v.email, phone: v.phone });
  if (!customer.success) for (const i of customer.error.issues) errors[i.path[0] as keyof Values] ??= i.message;
  const address = addressSchema.safeParse({ line1: v.line1, line2: v.line2, city: v.city, postalCode: v.postalCode, country: v.country });
  if (!address.success) for (const i of address.error.issues) errors[i.path[0] as keyof Values] ??= i.message;
  return errors;
}

export function CheckoutForm({ destinations }: { destinations: readonly ShippingDestination[] }) {
  const router = useRouter();
  const { items, hydrated, clear } = useCart();
  const q = useCartQuote(items, hydrated);
  const [values, setValues] = useState<Values>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [phase, setPhase] = useState<Phase>({ kind: "idle" });
  const [done, setDone] = useState(false);
  const summaryRef = useRef<HTMLDivElement>(null);
  const started = useRef(false);

  useEffect(() => {
    if (hydrated && items.length > 0 && !started.current) {
      started.current = true;
      track("checkout_started", { itemCount: items.length });
    }
  }, [hydrated, items.length]);

  const set = (k: keyof Values) => (e: { target: { value: string } }) => {
    setValues((v) => ({ ...v, [k]: e.target.value }));
    if (errors[k]) setErrors((er) => ({ ...er, [k]: undefined }));
  };

  const total = q.quote?.totals.total;
  const errorList = useMemo(() => Object.entries(errors).filter(([, m]) => m) as [keyof Values, string][], [errors]);

  if (!hydrated) return <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_26rem]" aria-busy="true"><div className="space-y-4"><Skeleton className="h-64" /><Skeleton className="h-64" /></div><Skeleton className="h-80" /></div>;

  if (items.length === 0 && !done) {
    return <EmptyState icon={<IconCart size={24} />} title="Nothing to check out." message="Your cart is empty. Create a poster first, then come back to pay." action={{ label: "Create your poster", href: "/create" }} secondary={{ label: "Explore cars", href: "/cars" }} />;
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (phase.kind === "processing") return;
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) {
      window.setTimeout(() => summaryRef.current?.focus(), 0);
      return;
    }

    const checkout = {
      items,
      customer: { name: values.name, email: values.email, ...(values.phone ? { phone: values.phone } : {}) },
      shipping: { line1: values.line1, ...(values.line2 ? { line2: values.line2 } : {}), city: values.city, postalCode: values.postalCode, country: values.country },
    };

    const post = async (url: string, body: unknown) => {
      const res = await fetch(url, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
      const json = (await res.json().catch(() => null)) as { error?: { code?: string; message?: string } } | null;
      if (!res.ok) throw Object.assign(new Error(json?.error?.message ?? "Checkout failed"), { code: json?.error?.code ?? "unknown" });
      return json as unknown;
    };

    try {
      setPhase({ kind: "processing", step: 0 });
      const session = (await post("/api/checkout/session", checkout)) as { sessionId: string };
      setPhase({ kind: "processing", step: 1 });
      await pause(650);
      const { order } = (await post("/api/checkout/demo-confirm", { sessionId: session.sessionId, checkout })) as { order: Order };
      setPhase({ kind: "processing", step: 2 });
      await pause(550);
      if (!ORDER_ID_PATTERN.test(order.id)) throw Object.assign(new Error("Unexpected order id"), { code: "unknown" });
      saveLocalOrder(order);
      track("demo_purchase_completed", { orderId: order.id, itemCount: order.items.length });
      setDone(true);
      clear();
      router.push(`/order/success/${encodeURIComponent(order.id)}`);
    } catch (err) {
      const code = (err as { code?: string }).code ?? "unknown";
      const network = err instanceof TypeError;
      setPhase({ kind: "error", message: network ? "We couldn't reach the server. Check your connection and try again — nothing was charged." : (ERROR_COPY[code] ?? "Something went wrong on our side. Nothing was charged. Please try again.") });
    }
  };

  const processing = phase.kind === "processing";

  return (
    <form onSubmit={submit} noValidate className="grid grid-cols-1 items-start gap-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14" aria-busy={processing}>
      <div className="space-y-12">
        {errorList.length > 0 && (
          <div ref={summaryRef} tabIndex={-1} role="alert" className="rounded-2xl border border-red-text/60 bg-surface p-5 outline-none">
            <p className="font-semibold">Please fix {errorList.length === 1 ? "this field" : `these ${errorList.length} fields`}:</p>
            <ul className="mt-2 list-inside list-disc space-y-1 text-sm">
              {errorList.map(([k, m]) => <li key={k}><a className="underline underline-offset-4" href={`#co-${k}`}>{m}</a></li>)}
            </ul>
          </div>
        )}

        <fieldset disabled={processing} className="space-y-5">
          <legend className="mb-5 flex items-center gap-3"><span className="spec">01</span><span className="h-display text-3xl">Customer</span></legend>
          <FormField id="co-name" label="Full name" required error={errors.name}>{(a) => <input {...a} name="name" type="text" autoComplete="name" value={values.name} onChange={set("name")} className="field" maxLength={80} />}</FormField>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="co-email" label="Email" required error={errors.email} hint="For your order confirmation.">{(a) => <input {...a} name="email" type="email" inputMode="email" autoComplete="email" value={values.email} onChange={set("email")} className="field" maxLength={254} />}</FormField>
            <FormField id="co-phone" label="Phone (optional)" error={errors.phone} hint="Only used for delivery updates.">{(a) => <input {...a} name="phone" type="tel" inputMode="tel" autoComplete="tel" value={values.phone} onChange={set("phone")} className="field" maxLength={24} />}</FormField>
          </div>
        </fieldset>

        <fieldset disabled={processing} className="space-y-5">
          <legend className="mb-5 flex items-center gap-3"><span className="spec">02</span><span className="h-display text-3xl">Shipping</span></legend>
          <FormField id="co-line1" label="Address" required error={errors.line1}>{(a) => <input {...a} name="line1" type="text" autoComplete="address-line1" value={values.line1} onChange={set("line1")} className="field" maxLength={100} />}</FormField>
          <FormField id="co-line2" label="Apartment, suite (optional)" error={errors.line2}>{(a) => <input {...a} name="line2" type="text" autoComplete="address-line2" value={values.line2} onChange={set("line2")} className="field" maxLength={100} />}</FormField>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormField id="co-city" label="City" required error={errors.city}>{(a) => <input {...a} name="city" type="text" autoComplete="address-level2" value={values.city} onChange={set("city")} className="field" maxLength={60} />}</FormField>
            <FormField id="co-postalCode" label="Postal code" required error={errors.postalCode}>{(a) => <input {...a} name="postalCode" type="text" autoComplete="postal-code" value={values.postalCode} onChange={set("postalCode")} className="field" maxLength={12} />}</FormField>
          </div>
          <FormField id="co-country" label="Country" required error={errors.country}>
            {(a) => (
              <select {...a} name="country" autoComplete="country" value={values.country} onChange={set("country")} className="field">
                <option value="">Select a country…</option>
                {destinations.map((d) => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
            )}
          </FormField>
        </fieldset>

        <section aria-labelledby="co-pay-title">
          <div className="mb-5 flex items-center gap-3"><span className="spec">03</span><h2 id="co-pay-title" className="h-display text-3xl">Payment</h2></div>
          <div className="card p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="flex items-center gap-2 font-semibold"><IconLock size={18} className="text-red-text" /> Secure checkout</p>
              <Badge tone="demo">Demo payment</Badge>
            </div>
            <p className="mt-3 text-sm text-muted">This is a prototype store. <strong className="text-fg">No card details are collected and no money moves.</strong> The button below simulates a successful payment so you can see the whole order flow. A real payment provider will handle cards on its own hosted page.</p>

            {phase.kind === "error" && (
              <div role="alert" className="mt-5 rounded-xl border border-red-text/60 p-4 text-sm">
                <p className="font-semibold">Checkout error</p>
                <p className="mt-1 text-muted">{phase.message}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="mt-6 w-full" disabled={processing || !total} aria-disabled={processing || !total}>
              {processing ? "Processing…" : <>Demo payment{total ? ` · ${formatMoney(total)}` : ""}</>}
            </Button>
            <p className="mt-3 text-center text-xs text-subtle">By continuing you agree this is a demonstration. <Link href="/terms" className="underline underline-offset-4">Terms (placeholder)</Link></p>
          </div>
        </section>
      </div>

      <aside aria-label="Order summary" className="card p-6 lg:sticky lg:top-28">
        <h2 className="h-display text-3xl">Order</h2>
        <ul className="mt-4 divide-y divide-line">
          {(q.quote?.lines ?? []).map((l) => (
            <li key={l.item.id} className="flex gap-3 py-4 first:pt-0">
              <div className="w-14 flex-none overflow-hidden rounded-[3px] ring-1 ring-line-strong"><PosterPreview template={l.template} vehicle={l.vehicle} customization={l.item.customization} vehicleName={l.vehicleName} specs={l.specs} sizeId={l.item.sizeId} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{l.vehicleName}</p>
                <p className="truncate text-xs text-muted">{l.template.name} · {l.sizeLabel} · ×{l.item.quantity}</p>
                <p className="truncate text-xs text-subtle">{personalizationSummary(l.item.customization)}</p>
              </div>
              <Price value={l.lineTotal} precise className="text-sm" />
            </li>
          ))}
          {!q.quote && <li className="py-2"><Skeleton className="h-16" /></li>}
        </ul>
        <div className="mt-5 border-t border-line pt-5">{q.quote ? <OrderSummary totals={q.quote.totals} /> : <Skeleton className="h-28" />}</div>
        {q.status === "error" && <p className="mt-3 text-sm text-muted" role="alert">Couldn&apos;t load prices. <button type="button" className="underline" onClick={q.retry}>Retry</button></p>}
      </aside>

      {processing && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center bg-bg/90 backdrop-blur-sm" role="alertdialog" aria-modal="true" aria-label="Processing demo payment">
          <div className="w-[min(92vw,26rem)] rounded-3xl border border-line-strong bg-surface p-8">
            <p className="spec">Demo payment</p>
            <h2 className="h-display mt-2 text-4xl">Processing…</h2>
            <ol className="mt-6 space-y-3">
              {PROCESSING.map((label, i) => {
                const step = (phase as { step: number }).step;
                const finished = i < step;
                const active = i === step;
                return (
                  <li key={label} className={`flex items-center gap-3 text-sm ${finished || active ? "text-fg" : "text-subtle"}`}>
                    <span className={`flex size-6 items-center justify-center rounded-full border text-[0.65rem] ${finished ? "border-red bg-red text-on-red" : active ? "border-red [animation:pulse-ring_1.2s_ease-out_infinite]" : "border-line-strong"}`}>{finished ? <IconCheck size={13} /> : i + 1}</span>
                    {label}
                  </li>
                );
              })}
            </ol>
            <p className="mt-6 text-xs text-subtle">No card data is collected. No money moves.</p>
          </div>
        </div>
      )}
    </form>
  );
}
