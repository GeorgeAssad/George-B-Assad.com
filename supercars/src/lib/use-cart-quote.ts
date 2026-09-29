"use client";

import { useEffect, useState } from "react";
import type { CartItem, CartQuote } from "@/domain/cart";

export type QuoteState =
  | { readonly status: "idle" | "loading"; readonly quote: CartQuote | null }
  | { readonly status: "ready"; readonly quote: CartQuote }
  | { readonly status: "error"; readonly quote: CartQuote | null };

const ZERO = { amount: 0, currency: "EUR" } as const;
const EMPTY_QUOTE: CartQuote = { lines: [], totals: { subtotal: ZERO, shipping: ZERO, total: ZERO, shippingNote: "" }, rejected: [] };

interface Settled { readonly key: string; readonly result: { status: "ready"; quote: CartQuote } | { status: "error" } }

/**
 * Asks the SERVER to price the cart. The browser never computes or supplies a price.
 * State is derived: while the settled result belongs to an older request key the hook
 * reports "loading" (keeping the previous quote so the UI doesn't flash).
 */
export function useCartQuote(items: readonly CartItem[], enabled = true): QuoteState & { retry: () => void } {
  const [settled, setSettled] = useState<Settled | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [lastQuote, setLastQuote] = useState<CartQuote | null>(null);
  const key = `${attempt}:${JSON.stringify(items)}`;
  const empty = items.length === 0;

  useEffect(() => {
    if (!enabled || empty) return;
    const controller = new AbortController();
    fetch("/api/cart/quote", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ items }), signal: controller.signal })
      .then(async (res) => {
        if (!res.ok) throw new Error(String(res.status));
        return (await res.json()) as CartQuote;
      })
      .then((quote) => {
        setSettled({ key, result: { status: "ready", quote } });
        setLastQuote(quote);
      })
      .catch((err: unknown) => {
        if ((err as { name?: string }).name === "AbortError") return;
        setSettled({ key, result: { status: "error" } });
      });
    return () => controller.abort();
    // `key` is the serialised request; depending on it avoids refetching on identity changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, enabled, empty]);

  const retry = () => setAttempt((n) => n + 1);

  if (!enabled) return { status: "idle", quote: null, retry };
  if (empty) return { status: "ready", quote: EMPTY_QUOTE, retry };
  if (settled?.key === key) {
    return settled.result.status === "ready" ? { status: "ready", quote: settled.result.quote, retry } : { status: "error", quote: lastQuote, retry };
  }
  return { status: "loading", quote: lastQuote, retry };
}
