"use client";

import { addBusinessDays } from "@/lib/delivery";
import { useHydrated } from "@/lib/use-hydrated";

const fmt = new Intl.DateTimeFormat("en-GB", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });

interface DeliveryEstimateProps {
  /** Business days, from the shipping rules (repositories). */
  readonly minDays: number;
  readonly maxDays: number;
  readonly className?: string;
  readonly compact?: boolean;
}

/** "Order today, arrives around Tue 25 Nov – Fri 28 Nov" from the visitor's own date (business days, placeholder estimate). */
export function DeliveryEstimate({ minDays, maxDays, className = "", compact = false }: DeliveryEstimateProps) {
  const hydrated = useHydrated();
  if (!hydrated) {
    return <span className={className}>Delivered in {minDays}–{maxDays} business days</span>;
  }
  const today = new Date();
  const from = fmt.format(addBusinessDays(today, minDays));
  const to = fmt.format(addBusinessDays(today, maxDays));
  return <span className={className}>{compact ? "Arrives" : "Order today, arrives"} around {from} – {to}</span>;
}
