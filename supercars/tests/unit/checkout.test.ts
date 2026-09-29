import { describe, expect, it } from "vitest";
import { confirmCheckout, hashCart, startCheckout, type CheckoutDeps } from "@/server/checkout/checkout-service";
import { getRepositories } from "@/server/repositories";
import { createServices } from "@/server/services";
import { createMockPaymentProvider } from "@/server/services/mock/payment";
import { getServerEnv } from "@/config/env";
import { ApiError } from "@/server/security/api-handler";
import type { CheckoutRequest } from "@/lib/validation";
import { checkoutRequestSchema } from "@/lib/validation";

const request = (over: Partial<CheckoutRequest> = {}): CheckoutRequest =>
  checkoutRequestSchema.parse({
    items: [{ id: "l1", productId: "custom-car-poster", sizeId: "50x70", carSlug: "bmw-m3-g80", templateId: "racing", customization: { name: "GEORGE" }, quantity: 1 }],
    customer: { name: "George Assad", email: "g@example.com" },
    shipping: { line1: "1 Demo Street", city: "Berlin", postalCode: "10115", country: "DE" },
    ...over,
  });

const deps = (over: Partial<CheckoutDeps> = {}): CheckoutDeps => ({
  repos: getRepositories(),
  services: createServices(getServerEnv({ APP_ENV: "development" })),
  now: () => new Date("2026-10-01T09:00:00.000Z"),
  newOrderId: () => "SC-TEST01",
  ...over,
});

describe("checkout flow (demo)", () => {
  it("start → confirm creates a server-authored demo order", async () => {
    const d = deps({ newOrderId: () => "SC-FLOW01" });
    const req = request();
    const start = await startCheckout(req, d);
    expect(start.orderId).toBe("SC-FLOW01");
    expect(start.totals.total.amount).toBe(7900 + 790);
    expect(start.demo).toBe(true);
    expect(start.sessionId.startsWith("cs_demo_")).toBe(true);

    const order = await confirmCheckout({ sessionId: start.sessionId, checkout: req }, d);
    expect(order).toMatchObject({ id: "SC-FLOW01", status: "design", mode: "demo" });
    expect(order.payment).toMatchObject({ status: "paid", provider: "mock", demo: true });
    expect(order.total.amount).toBe(7900 + 790);
    expect(order.items[0]).toMatchObject({ unitPrice: { amount: 7900 }, vehicleName: "BMW M3 G80" });
    expect(order.estimatedDelivery.from > "2026-10-01").toBe(true);
    expect(order.customer.id).toMatch(/^cus_/);
  });

  it("is idempotent: confirming twice returns the same order", async () => {
    const d = deps({ newOrderId: () => "SC-IDEM01" });
    const req = request();
    const { sessionId } = await startCheckout(req, d);
    const a = await confirmCheckout({ sessionId, checkout: req }, d);
    const b = await confirmCheckout({ sessionId, checkout: req }, d);
    expect(b).toBe(a);
  });

  it("rejects a cart changed after the session was created (price/cart tampering) with 409", async () => {
    const d = deps({ newOrderId: () => "SC-TAMP01" });
    const cheap = request();
    const { sessionId } = await startCheckout(cheap, d);
    const upgraded = request({ items: [{ ...cheap.items[0]!, quantity: 5 }] });
    await expect(confirmCheckout({ sessionId, checkout: upgraded }, d)).rejects.toMatchObject({ status: 409, code: "cart_changed" });
    const otherCar = request({ items: [{ ...cheap.items[0]!, carSlug: "porsche-911-992" }] });
    await expect(confirmCheckout({ sessionId, checkout: otherCar }, d)).rejects.toMatchObject({ status: 409 });
  });

  it("rejects forged, tampered and foreign sessions with 400", async () => {
    const d = deps();
    const req = request();
    const { sessionId } = await startCheckout(req, d);
    const [head, sig] = sessionId.split(".");
    for (const bad of ["cs_demo_garbage", "nonsense", `${head}.AAAA`, `${head!.slice(0, -2)}xx.${sig}`, "cs_demo_.x"]) {
      await expect(confirmCheckout({ sessionId: bad, checkout: req }, d)).rejects.toMatchObject({ status: 400 });
    }
    // Session signed with a different key is not accepted.
    const other = createMockPaymentProvider("a-completely-different-signing-key-1234567890");
    const foreign = await other.createCheckoutSession({ orderId: "SC-FORGE1", amount: { amount: 1, currency: "EUR" }, cartHash: "x", description: "x" });
    await expect(confirmCheckout({ sessionId: foreign.sessionId, checkout: req }, d)).rejects.toMatchObject({ status: 400 });
  });

  it("rejects expired sessions with 410", async () => {
    let t = 1_000_000;
    const payment = createMockPaymentProvider(undefined, () => t);
    const base = deps();
    const d = { ...base, services: { ...base.services, payment } };
    const req = request();
    const { sessionId } = await startCheckout(req, d);
    t += 31 * 60 * 1000;
    await expect(confirmCheckout({ sessionId, checkout: req }, d)).rejects.toMatchObject({ status: 410 });
  });

  it("refuses to price unknown items", async () => {
    const d = deps();
    const bad = request({ items: [{ ...request().items[0]!, productId: "hacked-product" }] });
    await expect(startCheckout(bad, d)).rejects.toBeInstanceOf(ApiError);
  });

  it("cart hash changes with any customization change", async () => {
    const a = request().items;
    const b = request({ items: [{ ...a[0]!, customization: { name: "GEORGF", text: undefined, year: undefined, location: undefined } }] }).items;
    expect(await hashCart(a, "DE")).not.toBe(await hashCart(b, "DE"));
    expect(await hashCart(a, "DE")).toBe(await hashCart(a, "DE"));
  });
});

describe("service factory fails closed", () => {
  it("throws when a real provider is selected but not implemented", () => {
    expect(() => createServices(getServerEnv({ PAYMENT_PROVIDER: "stripe" }))).toThrow(/not implemented/);
    expect(() => createServices(getServerEnv({ AI_PROVIDER: "openai" }))).toThrow(/not implemented/);
    expect(() => createServices(getServerEnv({ FULFILLMENT_PROVIDER: "prodigi" }))).toThrow(/not implemented/);
  });
  it("rejects invalid env without echoing values", () => {
    expect(() => getServerEnv({ APP_ENV: "hunter2-super-secret" })).toThrow(/APP_ENV/);
    try { getServerEnv({ APP_ENV: "hunter2-super-secret" }); } catch (e) { expect(String(e)).not.toContain("hunter2"); }
  });
});
