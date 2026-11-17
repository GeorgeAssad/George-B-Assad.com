import { z } from "zod";
import { PROMOTION_SCHEDULE } from "@/config/promotions";
import { buildTimePromotions } from "@/config/site";
import { money, type Money } from "@/domain/money";

/* OFFERS (time-boxed promotions). One pure module shared by the server, which
 * applies offers to prices, and the browser, which only displays them. An offer
 * is "on" when startsAt <= now < endsAt. The schedule lives in
 * src/config/promotions.ts; tests and preview builds may add offers through the
 * offers build variable (a JSON array of the same shape, read in config/site.ts). */

const isoWithZone = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})$/, "Use an ISO time with a UTC offset, e.g. 2026-11-28T18:00:00+01:00")
  .refine((v) => !Number.isNaN(Date.parse(v)), "Not a real date and time");

const base = {
  id: z.string().regex(/^[a-z0-9][a-z0-9-]{0,39}$/, "Use lowercase letters, numbers and dashes"),
  startsAt: isoWithZone,
  endsAt: isoWithZone,
  /** Short name shown in the banner, e.g. "Flash sale". */
  label: z.string().trim().min(1).max(40).optional(),
};

export const promotionSchema = z
  .discriminatedUnion("kind", [
    z.strictObject({ ...base, kind: z.literal("percent-off"), percent: z.number().int().min(1).max(90) }),
    z.strictObject({ ...base, kind: z.literal("free-shipping"), minSubtotal: z.number().int().min(0).max(100_000) }),
  ])
  .refine((p) => Date.parse(p.endsAt) > Date.parse(p.startsAt), { message: "endsAt must be after startsAt", path: ["endsAt"] });

export type PromotionInput = z.input<typeof promotionSchema>;

export interface PercentOffOffer {
  readonly id: string;
  readonly kind: "percent-off";
  readonly percent: number;
  readonly label: string;
  readonly startsAt: number;
  readonly endsAt: number;
}

export interface FreeShippingOffer {
  readonly id: string;
  readonly kind: "free-shipping";
  /** Goods total (after any discount) from which shipping is free. */
  readonly minSubtotal: Money;
  readonly label: string;
  readonly startsAt: number;
  readonly endsAt: number;
}

export type Offer = PercentOffOffer | FreeShippingOffer;

/** What is on at one moment: at most one discount and one free-shipping offer. */
export interface ActiveOffers {
  readonly discount: PercentOffOffer | null;
  readonly freeShipping: FreeShippingOffer | null;
}

export const NO_OFFERS: ActiveOffers = { discount: null, freeShipping: null };

function normalise(input: z.output<typeof promotionSchema>): Offer {
  const startsAt = Date.parse(input.startsAt);
  const endsAt = Date.parse(input.endsAt);
  return input.kind === "percent-off"
    ? { id: input.id, kind: "percent-off", percent: input.percent, label: input.label ?? `${input.percent}% off`, startsAt, endsAt }
    : { id: input.id, kind: "free-shipping", minSubtotal: money(input.minSubtotal * 100), label: input.label ?? "Free shipping", startsAt, endsAt };
}

/** Parses and validates a schedule. Throws with a readable message on a bad entry, so a broken edit fails the build instead of the shop. */
export function parseSchedule(entries: readonly unknown[]): readonly Offer[] {
  const ids = new Set<string>();
  return entries.map((entry, i) => {
    const parsed = promotionSchema.safeParse(entry);
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      throw new Error(`Offer #${i + 1} in src/config/promotions.ts is invalid: ${issue?.path.join(".") || "entry"}: ${issue?.message ?? "invalid"}`);
    }
    if (ids.has(parsed.data.id)) throw new Error(`Offer id "${parsed.data.id}" is used twice in src/config/promotions.ts`);
    ids.add(parsed.data.id);
    return normalise(parsed.data);
  });
}

function fromBuildVariable(): readonly unknown[] {
  const raw = buildTimePromotions;
  if (!raw) return [];
  try {
    const value: unknown = JSON.parse(raw);
    return Array.isArray(value) ? value : [];
  } catch {
    throw new Error("The offers build variable (see config/site.ts) is not valid JSON");
  }
}

/** The whole schedule (config file + optional build variable), validated once. */
export const OFFERS: readonly Offer[] = parseSchedule([...PROMOTION_SCHEDULE, ...fromBuildVariable()]);

const isOn = (o: Offer, at: number) => o.startsAt <= at && at < o.endsAt;

/** The offers running at `at` (ms since epoch). Bigger discount wins; lower free-shipping threshold wins. */
export function activeOffers(at: number, offers: readonly Offer[] = OFFERS): ActiveOffers {
  let discount: PercentOffOffer | null = null;
  let freeShipping: FreeShippingOffer | null = null;
  for (const o of offers) {
    if (!isOn(o, at)) continue;
    if (o.kind === "percent-off") {
      if (!discount || o.percent > discount.percent || (o.percent === discount.percent && o.endsAt > discount.endsAt)) discount = o;
    } else if (!freeShipping || o.minSubtotal.amount < freeShipping.minSubtotal.amount) {
      freeShipping = o;
    }
  }
  return { discount, freeShipping };
}

/** The next time anything starts or ends after `at`, or null. Lets the page switch offers on and off without a reload. */
export function nextOfferChange(at: number, offers: readonly Offer[] = OFFERS): number | null {
  let next: number | null = null;
  for (const o of offers) {
    for (const t of [o.startsAt, o.endsAt]) if (t > at && (next === null || t < next)) next = t;
  }
  return next;
}

/** Stable key of what is on, e.g. "flash-15|free-ship-80", for caches and re-fetching. */
export const offersKey = (a: ActiveOffers) => [a.discount?.id ?? "", a.freeShipping?.id ?? ""].join("|");

/** Discount amount for a goods total, rounded to the cent. */
export function discountAmount(subtotal: Money, offer: PercentOffOffer | null): Money {
  if (!offer || subtotal.amount <= 0) return money(0, subtotal.currency);
  return money(Math.round((subtotal.amount * offer.percent) / 100), subtotal.currency);
}

/** A single price with the discount applied (for display next to the crossed-out price). */
export function offerPrice(price: Money, offer: PercentOffOffer | null): Money {
  return money(price.amount - discountAmount(price, offer).amount, price.currency);
}
