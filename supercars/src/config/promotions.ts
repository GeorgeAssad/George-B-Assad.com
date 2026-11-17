/* ==========================================================================
   OFFERS — the owner's switchboard.

   Add one line per offer. Each offer switches itself ON at `startsAt` and OFF at
   `endsAt`; nothing needs to be redeployed when it starts or ends, only when you
   add, change or remove a line here. While no offer is running the store shows no
   banner, no countdown and no crossed-out prices, and shipping is the flat rate.

   Times: ISO 8601 with your UTC offset, e.g. "2026-11-28T18:00:00+01:00"
   (+01:00 = Paris/Berlin in winter, +02:00 = Paris/Berlin in summer or Beirut in
   winter, Z = UTC).

   Two kinds of offer:

     { id: "flash-15", kind: "percent-off", percent: 15,
       startsAt: "2026-11-28T18:00:00+01:00", endsAt: "2026-11-28T21:00:00+01:00",
       label: "Flash sale" },
       → 15% off every poster for those three hours, with a countdown.

     { id: "free-ship-80", kind: "free-shipping", minSubtotal: 80,
       startsAt: "2026-11-29T00:00:00+01:00", endsAt: "2026-12-01T00:00:00+01:00" },
       → free shipping on orders of €80 or more for that weekend
         (minSubtotal is in whole euros; 0 = free shipping on every order).

   Both kinds can run at the same time. If two discounts overlap, the bigger one
   applies. The server applies every offer to the price; the page only shows it.
   ========================================================================== */

import type { PromotionInput } from "@/lib/promotions";

export const PROMOTION_SCHEDULE: readonly PromotionInput[] = [
  // Add offers here, one per line (see the examples above).
];
