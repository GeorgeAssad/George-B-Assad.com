"use client";

import type { Money } from "@/domain/money";
import { formatMoney, formatPrice } from "@/lib/format";
import { offerPrice } from "@/lib/promotions";
import { useOffers } from "@/lib/use-offers";

interface OfferPriceProps {
  readonly value: Money;
  /** Small word before the price, e.g. "From". */
  readonly prefix?: string;
  readonly precise?: boolean;
  readonly className?: string;
}

/**
 * A catalog price that shows the running discount: the new price, with the old one
 * crossed out. Without an offer (and during the server render) it is just the price.
 * Display only: the server applies the discount at checkout.
 */
export function OfferPrice({ value, prefix, precise = false, className = "" }: OfferPriceProps) {
  const { discount } = useOffers();
  const fmt = precise ? formatMoney : formatPrice;
  const now = discount ? offerPrice(value, discount) : null;
  return (
    <span className={`tabular-nums ${className}`}>
      {prefix && <span className="mr-1.5 text-[0.8125rem] font-medium text-subtle">{prefix}</span>}
      {now ? (
        <>
          <span className="sr-only">Was {fmt(value)}, now </span>
          <span className="font-semibold text-red-text">{fmt(now)}</span>
          <s aria-hidden="true" className="ml-1.5 text-[0.85em] font-normal text-subtle">{fmt(value)}</s>
        </>
      ) : (
        <span className="font-semibold">{fmt(value)}</span>
      )}
    </span>
  );
}
