import { beforeAll, describe, expect, it, vi } from "vitest";
import type { CheckoutRequest } from "@/lib/validation";

/* Offers end to end on the server: the schedule is supplied the way preview builds do
 * (NEXT_PUBLIC_PROMOTIONS), then pricing and checkout are loaded fresh so they see it. */

const FLASH = { id: "flash-15", kind: "percent-off", percent: 15, startsAt: "2026-11-28T18:00:00+01:00", endsAt: "2026-11-28T21:00:00+01:00", label: "Flash sale" };
const SHIP = { id: "free-ship-80", kind: "free-shipping", minSubtotal: 80, startsAt: "2026-11-28T00:00:00+01:00", endsAt: "2026-11-30T00:00:00+01:00" };
const IN_FLASH = Date.parse("2026-11-28T19:00:00+01:00");
const AFTER_FLASH = Date.parse("2026-11-28T21:05:00+01:00");
const NO_OFFER = Date.parse("2026-12-05T12:00:00+01:00");

type Pricing = typeof import("@/server/checkout/pricing");
type Checkout = typeof import("@/server/checkout/checkout-service");
let pricing: Pricing;
let checkout: Checkout;
let deps: (now: number, paymentNow: () => number) => import("@/server/checkout/checkout-service").CheckoutDeps;
let request: (over?: Partial<CheckoutRequest>) => CheckoutRequest;

beforeAll(async () => {
  vi.stubEnv("NEXT_PUBLIC_PROMOTIONS", JSON.stringify([FLASH, SHIP]));
  vi.resetModules();
  pricing = await import("@/server/checkout/pricing");
  checkout = await import("@/server/checkout/checkout-service");
  const { getRepositories } = await import("@/server/repositories");
  const { createServices } = await import("@/server/services");
  const { createMockPaymentProvider } = await import("@/server/services/mock/payment");
  const { getServerEnv } = await import("@/config/env");
  const { checkoutRequestSchema } = await import("@/lib/validation");
  deps = (now, paymentNow) => {
    const services = createServices(getServerEnv({ APP_ENV: "development" }));
    return { repos: getRepositories(), services: { ...services, payment: createMockPaymentProvider(undefined, paymentNow) }, now: () => new Date(now), newOrderId: () => `SC-OFR${String(Math.floor(Math.random() * 900) + 100)}` };
  };
  request = (over = {}) =>
    checkoutRequestSchema.parse({
      items: [{ id: "l1", productId: "custom-car-poster", sizeId: "50x70", carSlug: "bmw-m3-g80", templateId: "racing", customization: { name: "GEORGE" }, quantity: 1 }],
      customer: { name: "George Assad", email: "g@example.com" },
      shipping: { line1: "1 Demo Street", city: "Berlin", postalCode: "10115", country: "DE" },
      ...over,
    });
});

const item = (over: Record<string, unknown> = {}) => ({ id: "l1", productId: "custom-car-poster", sizeId: "50x70" as const, carSlug: "bmw-m3-g80", templateId: "racing" as const, customization: { name: "GEORGE" }, quantity: 1, ...over });

describe("server pricing with offers", () => {
  it("takes the discount off the goods and keeps the flat rate below the free-shipping amount", async () => {
    const q = await pricing.quoteCart([item()], undefined, IN_FLASH);
    expect(q.totals.subtotal.amount).toBe(7900);
    expect(q.totals.discount.amount).toBe(1185);
    expect(q.totals.shipping.amount).toBe(790); // €67.15 after the discount is below €80
    expect(q.totals.total.amount).toBe(7900 - 1185 + 790);
    expect(q.totals.offer).toMatchObject({ id: "flash-15", percent: 15, label: "Flash sale" });
    expect(q.totals.freeShipping?.remaining.amount).toBe(8000 - 6715);
  });

  it("ships free once the discounted goods reach the free-shipping amount", async () => {
    const q = await pricing.quoteCart([item({ quantity: 2 })], undefined, IN_FLASH);
    expect(q.totals.discount.amount).toBe(2370);
    expect(q.totals.shipping.amount).toBe(0);
    expect(q.totals.total.amount).toBe(15800 - 2370);
    expect(q.totals.freeShipping?.remaining.amount).toBe(0);
  });

  it("is back to normal prices when no offer runs", async () => {
    const q = await pricing.quoteCart([item({ quantity: 2 })], undefined, NO_OFFER);
    expect(q.totals.discount.amount).toBe(0);
    expect(q.totals.shipping.amount).toBe(790);
    expect(q.totals.offer).toBeNull();
    expect(q.totals.freeShipping).toBeNull();
  });
});

describe("checkout with offers and gifts", () => {
  it("honours the offer for a checkout that started during it, even if it ends before payment", async () => {
    const d = deps(IN_FLASH, () => IN_FLASH);
    const req = request();
    const start = await checkout.startCheckout(req, d);
    expect(start.totals.total.amount).toBe(7900 - 1185 + 790);
    // Payment is confirmed 10 minutes later, after the offer ended (the session is still valid).
    const late = deps(AFTER_FLASH, () => IN_FLASH + 10 * 60 * 1000);
    const order = await checkout.confirmCheckout({ sessionId: start.sessionId, checkout: req }, late);
    expect(order.total.amount).toBe(7900 - 1185 + 790);
    expect(order.discount.amount).toBe(1185);
    expect(order.offer).toEqual({ id: "flash-15", label: "Flash sale", percent: 15 });
  });

  it("keeps a gift note on the order and binds it to the session", async () => {
    const d = deps(NO_OFFER, () => NO_OFFER);
    const req = request({ gift: { note: "Happy birthday, Dad!" } });
    const start = await checkout.startCheckout(req, d);
    const order = await checkout.confirmCheckout({ sessionId: start.sessionId, checkout: req }, d);
    expect(order.gift).toEqual({ note: "Happy birthday, Dad!" });
    const { toPublicOrderView } = await import("@/lib/public-order");
    const view = toPublicOrderView(order);
    expect(view.gift).toBe(true);
    expect(JSON.stringify(view)).not.toContain("Happy birthday");

    const other = await checkout.startCheckout(req, d);
    const swapped = request({ gift: { note: "Something else" } });
    await expect(checkout.confirmCheckout({ sessionId: other.sessionId, checkout: swapped }, d)).rejects.toMatchObject({ status: 409, code: "cart_changed" });
  });

  it("validates the gift note like poster text", async () => {
    const { giftSchema } = await import("@/lib/validation");
    expect(giftSchema.parse({ note: "  " })).toEqual({ note: undefined });
    expect(giftSchema.safeParse({ note: "x".repeat(201) }).success).toBe(false);
    expect(giftSchema.safeParse({ note: "<script>" }).success).toBe(false);
    expect(giftSchema.safeParse({ note: "Love you, mum!", price: 0 }).success).toBe(false);
  });
});
