import { money } from "@/domain/money";
import type { ShippingDestination } from "@/domain/customer";

/* DEMO SHIPPING RULES — placeholders. Real rates come from the fulfilment
 * provider / a shipping table on the server. */

export const shippingDestinations: readonly ShippingDestination[] = [
  { code: "AT", name: "Austria" },
  { code: "BE", name: "Belgium" },
  { code: "CH", name: "Switzerland" },
  { code: "CZ", name: "Czechia" },
  { code: "DE", name: "Germany" },
  { code: "DK", name: "Denmark" },
  { code: "ES", name: "Spain" },
  { code: "FI", name: "Finland" },
  { code: "FR", name: "France" },
  { code: "GB", name: "United Kingdom" },
  { code: "GR", name: "Greece" },
  { code: "IE", name: "Ireland" },
  { code: "IT", name: "Italy" },
  { code: "LU", name: "Luxembourg" },
  { code: "NL", name: "Netherlands" },
  { code: "NO", name: "Norway" },
  { code: "PL", name: "Poland" },
  { code: "PT", name: "Portugal" },
  { code: "SE", name: "Sweden" },
];

export const shippingRules = {
  flatRate: money(790),
  freeOver: money(10000),
  /** Estimated production + transit, in business days (placeholder). */
  minBusinessDays: 7,
  maxBusinessDays: 10,
} as const;
