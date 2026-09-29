"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, type FormEvent } from "react";
import type { PublicOrderView } from "@/domain/order";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconPackage, IconSearch } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { getLocalOrder } from "@/lib/order-store";
import { useHydrated } from "@/lib/use-hydrated";
import { toPublicOrderView } from "@/lib/public-order";
import { orderIdSchema } from "@/lib/validation";
import { TrackingResult } from "./TrackingResult";

type State =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "found"; order: PublicOrderView }
  | { kind: "notfound"; id: string }
  | { kind: "error"; message: string };

const SAMPLES = ["SC-100234", "SC-100235", "SC-100236"] as const;

export function TrackLookup() {
  const hydrated = useHydrated();
  return hydrated ? <TrackLookupInner /> : <div aria-busy="true"><Skeleton className="h-24 max-w-2xl" /></div>;
}

function TrackLookupInner() {
  // `?order=SC-…` links (used by the confirmation page). From the router, not window.location, so
  // client-side navigation sees the new URL.
  const searchParams = useSearchParams();
  const [initial] = useState(() => (searchParams.get("order") ?? "").slice(0, 20));
  const [value, setValue] = useState(initial);
  const [state, setState] = useState<State>(initial && orderIdSchema.safeParse(initial).success ? { kind: "loading" } : { kind: "idle" });
  const [fieldError, setFieldError] = useState<string | null>(() => (initial && !orderIdSchema.safeParse(initial).success ? "Enter an order number like SC-100234" : null));
  const abort = useRef<AbortController | null>(null);

  /** Fetches and settles the result. All state updates happen after an await, never synchronously in an effect. */
  const lookup = async (id: string) => {
    abort.current?.abort();
    const controller = new AbortController();
    abort.current = controller;
    try {
      const res = await fetch("/api/orders/lookup", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ orderId: id }), signal: controller.signal });
      if (res.ok) {
        const json = (await res.json()) as { order: PublicOrderView };
        return setState({ kind: "found", order: json.order });
      }
      if (res.status === 429) return setState({ kind: "error", message: "Too many lookups. Please wait a minute and try again." });
      // Prototype: orders placed in this browser aren't known to the server, so fall back to the local demo copy.
      const local = getLocalOrder(id);
      if (local) return setState({ kind: "found", order: toPublicOrderView(local) });
      if (res.status === 404) return setState({ kind: "notfound", id });
      setState({ kind: "error", message: "Something went wrong on our side. Please try again." });
    } catch (err) {
      if ((err as { name?: string }).name === "AbortError") return;
      const local = getLocalOrder(id);
      if (local) return setState({ kind: "found", order: toPublicOrderView(local) });
      setState({ kind: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  };

  const search = (raw: string) => {
    const parsed = orderIdSchema.safeParse(raw);
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Enter an order number like SC-100234");
      return;
    }
    setFieldError(null);
    setState({ kind: "loading" });
    void lookup(parsed.data);
  };

  useEffect(() => {
    const parsed = initial ? orderIdSchema.safeParse(initial) : null;
    // Async fetch for the deep-linked order: state is only set after the await, never synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (parsed?.success) void lookup(parsed.data);
    return () => abort.current?.abort();
    // Runs once on mount for the deep-linked order.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    search(value);
  };

  return (
    <div>
      <form onSubmit={onSubmit} noValidate className="max-w-2xl" aria-label="Track an order">
        <label htmlFor="track-order" className="text-sm font-semibold">Order number</label>
        <div className="mt-2 flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <IconSearch className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-muted" size={20} />
            <input
              id="track-order"
              type="text"
              inputMode="text"
              autoComplete="off"
              autoCapitalize="characters"
              spellCheck={false}
              maxLength={20}
              value={value}
              onChange={(e) => { setValue(e.target.value); if (fieldError) setFieldError(null); }}
              placeholder="SC-100234"
              aria-invalid={fieldError ? true : undefined}
              aria-describedby={fieldError ? "track-err" : "track-hint"}
              className="field h-14 pl-12"
            />
          </div>
          <Button type="submit" size="lg" disabled={state.kind === "loading"}>{state.kind === "loading" ? "Looking up…" : "Track order"}</Button>
        </div>
        {fieldError ? <p id="track-err" role="alert" className="mt-2 text-sm font-medium text-red-text">{fieldError}</p> : <p id="track-hint" className="mt-2 text-xs text-subtle">You&apos;ll find it in your confirmation. No account needed.</p>}
      </form>

      <p className="mt-5 text-sm text-muted">
        Try a demo order:{" "}
        {SAMPLES.map((s, i) => (
          <span key={s}>
            <button type="button" onClick={() => { setValue(s); search(s); }} className="rounded-full border border-line-strong px-3 py-1 text-xs font-semibold tracking-wide hover:border-fg">{s}</button>
            {i < SAMPLES.length - 1 && " "}
          </span>
        ))}
      </p>

      <div className="mt-10" aria-live="polite">
        {state.kind === "loading" && <div aria-busy="true" role="status"><span className="sr-only">Looking up your order</span><Skeleton className="h-96" /></div>}
        {state.kind === "found" && <TrackingResult order={state.order} />}
        {state.kind === "notfound" && (
          <EmptyState icon={<IconPackage size={24} />} title="No order found." message={`We couldn't find an order numbered ${state.id}. Check the number in your confirmation, or try one of the demo orders above.`} secondary={{ label: "Create a poster", href: "/create" }} />
        )}
        {state.kind === "error" && (
          <div role="alert" className="rounded-2xl border border-red-text/50 bg-surface p-6">
            <p className="font-semibold">Couldn&apos;t track that order</p>
            <p className="mt-1 text-sm text-muted">{state.message}</p>
            <Button variant="secondary" size="sm" className="mt-4" onClick={() => search(value)}>Try again</Button>
          </div>
        )}
      </div>
    </div>
  );
}
