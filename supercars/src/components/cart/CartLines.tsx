"use client";

import type { CartItem, CartQuote } from "@/domain/cart";
import { Button } from "@/components/ui/Button";
import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";
import { CartLineItem } from "./CartLineItem";

interface CartLinesProps {
  readonly items: readonly CartItem[];
  readonly status: "idle" | "loading" | "ready" | "error";
  readonly quote: CartQuote | null;
  readonly compact?: boolean;
  readonly onQuantity: (id: string, quantity: number) => void;
  readonly onRemove: (id: string) => void;
  readonly onRetry: () => void;
  readonly onNavigate?: () => void;
}

export function CartLinesSkeleton({ rows = 2 }: { rows?: number }) {
  return (
    <LoadingRegion label="Loading your cart">
      <ul className="space-y-5">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex gap-4">
            <Skeleton className="h-32 w-24 flex-none" />
            <div className="flex-1 space-y-3">
              <Skeleton className="h-3 w-24" />
              <Skeleton className="h-7 w-48" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}

/** Priced lines plus any lines the server could not price (reported, never silently dropped). */
export function CartLines({ items, status, quote, compact, onQuantity, onRemove, onRetry, onNavigate }: CartLinesProps) {
  if (!quote && (status === "loading" || status === "idle")) return <CartLinesSkeleton rows={Math.min(items.length, 3) || 1} />;

  if (!quote && status === "error") {
    return (
      <div className="rounded-2xl border border-line p-6 text-center" role="alert">
        <p className="font-semibold">We couldn&apos;t load your cart prices.</p>
        <p className="mt-1 text-sm text-muted">Check your connection and try again. Your items are safe.</p>
        <Button variant="secondary" size="sm" className="mt-4" onClick={onRetry}>Try again</Button>
      </div>
    );
  }

  const priced = new Set((quote?.lines ?? []).map((l) => l.item.id));
  const rejected = items.filter((i) => !priced.has(i.id) && quote);

  return (
    <div aria-busy={status === "loading"}>
      <ul>
        {(quote?.lines ?? []).map((line) => (
          <CartLineItem key={line.item.id} line={line} compact={compact ?? false} onQuantity={onQuantity} onRemove={onRemove} {...(onNavigate ? { onNavigate } : {})} />
        ))}
      </ul>
      {rejected.length > 0 && (
        <ul className="mt-4 space-y-3" aria-label="Unavailable items">
          {rejected.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 rounded-xl border border-red-text/40 bg-elevated px-4 py-3 text-sm" role="alert">
              <span>An item in your cart is no longer available.</span>
              <Button variant="ghost" size="sm" onClick={() => onRemove(item.id)}>Remove</Button>
            </li>
          ))}
        </ul>
      )}
      {status === "error" && quote && (
        <p className="mt-3 text-sm text-muted" role="status">Prices may be out of date. <button type="button" className="underline" onClick={onRetry}>Refresh</button></p>
      )}
    </div>
  );
}
