"use client";

import { formatPrice } from "@/lib/format";
import { formatCountdown, useOffers, useSecondClock } from "@/lib/use-offers";

const dayFmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short" });

/** Announcement bar above the header. Exists only while an offer runs; counts down to its end and disappears by itself. */
export function PromoBar() {
  const { discount, freeShipping } = useOffers();
  const now = useSecondClock(Boolean(discount));
  if (!discount && !freeShipping) return null;

  const shippingText = freeShipping
    ? freeShipping.minSubtotal.amount === 0
      ? "Free shipping on every order"
      : `Free shipping on orders over ${formatPrice(freeShipping.minSubtotal)}`
    : null;

  return (
    <div role="region" aria-label="Current offer" className="promo-bar relative z-[60] bg-red text-on-red">
      <div className="container-x flex min-h-10 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 py-2 text-center text-[0.875rem] leading-snug">
        {discount && (
          <p>
            <strong className="font-semibold">{discount.label}: {discount.percent}% off every poster</strong>
            {now !== null && (
              <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-black/20 px-2 py-0.5 text-[0.8125rem] font-semibold tabular-nums">
                <span className="sr-only">Ends in </span><span aria-hidden="true">Ends in</span> {formatCountdown(discount.endsAt - now)}
              </span>
            )}
          </p>
        )}
        {discount && shippingText && <span aria-hidden="true" className="max-sm:hidden">·</span>}
        {shippingText && freeShipping && (
          <p>
            <strong className="font-semibold">{shippingText}</strong>
            <span> until {dayFmt.format(new Date(freeShipping.endsAt - 1))}</span>
          </p>
        )}
      </div>
    </div>
  );
}
