"use client";

import { useEffect, useState } from "react";
import type { CartItem, CartQuote } from "@/domain/cart";

export type QuoteState =
  | { readonly status: "idle" | "loading"; readonly quote: CartQuote | null }
  | { readonly status: "ready"; readonly quote: CartQuote }
  | { readonly status: "error"; readonly quote: CartQuote | null };

/** Asks the SERVER to price the cart. The browser never computes or supplies a price. */
export function useCartQuote(items: readonly CartItem[], enabled = true): QuoteState & { retry: () => void } {
  const [state, setState] = useState<QuoteState>({ status: "idle", quote: null });
  const [attempt, setAttempt] = useState(0);
  const key = JSON.stringify(items);

  useEffect(() => {
    if (!enabled) return;
    if (items.length === 0) {
      setState({ status: "ready", quote: { lines: [], totals: { subtotal: { amount: 0, currency: "EUR" }, shipping: { amount: 0, currency: "EUR" }, total: { amount: 0, currency: "EUR" }, shippingNote: "" }, rejected: [] } });
      return;
    }
    const controller = new AbortController();
    setState((prev) => ({ status: "loading", quote: prev.quote }));
    fetch("/api/cart/quote", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ items }),
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as CartQuote;
      })
      .then((quote) => setState({ status: "ready", quote }))
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setState((prev) => ({ status: "error", quote: prev.quote }));
      });
    return () => controller.abort();
    // `key` is the serialised items; depending on it avoids refetching on identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, attempt]);

  return { ...state, retry: () => setAttempt((n) => n + 1) };
}
