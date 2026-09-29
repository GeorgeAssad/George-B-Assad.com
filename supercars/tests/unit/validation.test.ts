import { describe, expect, it } from "vitest";
import { checkoutRequestSchema, customizationSchema, normalizeText, orderIdSchema, quoteRequestSchema } from "@/lib/validation";

const validCheckout = () => ({
  items: [{ id: "l1", productId: "custom-car-poster", sizeId: "50x70", carSlug: "bmw-m3-g80", templateId: "racing", customization: { name: "George" }, quantity: 1 }],
  customer: { name: "George Assad", email: "George@Example.com", phone: "+49 30 1234567" },
  shipping: { line1: "1 Demo Street", city: "Berlin", postalCode: "10115", country: "DE" },
});

describe("normalizeText", () => {
  it("strips control, zero-width and bidi-override characters and collapses whitespace", () => {
    expect(normalizeText("  Ge​orge‮   A\u0000ssad \n ")).toBe("Ge orge A ssad");
  });
});

describe("customizationSchema", () => {
  it("accepts a normal name and drops empty optionals", () => {
    const r = customizationSchema.parse({ name: "GEORGE", text: "", year: "", location: "" });
    expect(r).toEqual({ name: "GEORGE", text: undefined, year: undefined, location: undefined });
  });
  it("rejects markup-ish characters and over-long names", () => {
    expect(customizationSchema.safeParse({ name: "<script>alert(1)</script>" }).success).toBe(false);
    expect(customizationSchema.safeParse({ name: "A".repeat(25) }).success).toBe(false);
    expect(customizationSchema.safeParse({ name: "" }).success).toBe(false);
  });
  it("validates years", () => {
    expect(customizationSchema.safeParse({ name: "A", year: "2024" }).success).toBe(true);
    expect(customizationSchema.safeParse({ name: "A", year: "24" }).success).toBe(false);
    expect(customizationSchema.safeParse({ name: "A", year: "3024" }).success).toBe(false);
  });
  it("accepts international letters", () => {
    expect(customizationSchema.safeParse({ name: "Zoë Müller-Åberg", location: "Nürburgring" }).success).toBe(true);
  });
  it("rejects unknown keys", () => {
    expect(customizationSchema.safeParse({ name: "A", price: 1 }).success).toBe(false);
  });
});

describe("checkoutRequestSchema (strict)", () => {
  it("accepts a valid request and normalises the email", () => {
    const r = checkoutRequestSchema.parse(validCheckout());
    expect(r.customer.email).toBe("george@example.com");
  });
  it("REJECTS any client-supplied price / status / owner field at every level", () => {
    for (const [path, extra] of [
      ["root", { price: 1 }],
      ["root", { total: 1 }],
      ["root", { paymentStatus: "paid" }],
      ["root", { userId: "admin" }],
    ] as const) {
      const body = { ...validCheckout(), ...extra };
      expect(checkoutRequestSchema.safeParse(body).success, `${path}:${Object.keys(extra)[0]}`).toBe(false);
    }
    const withItemPrice = validCheckout();
    (withItemPrice.items[0] as Record<string, unknown>).price = 1;
    expect(checkoutRequestSchema.safeParse(withItemPrice).success).toBe(false);
    const withStatus = validCheckout();
    (withStatus.customer as Record<string, unknown>).isAdmin = true;
    expect(checkoutRequestSchema.safeParse(withStatus).success).toBe(false);
  });
  it("enforces quantity bounds and cart size", () => {
    const zero = validCheckout(); zero.items[0]!.quantity = 0;
    const many = validCheckout(); many.items[0]!.quantity = 11;
    const frac = validCheckout(); frac.items[0]!.quantity = 1.5;
    expect([zero, many, frac].map((b) => checkoutRequestSchema.safeParse(b).success)).toEqual([false, false, false]);
    const big = validCheckout();
    big.items = Array.from({ length: 21 }, (_, i) => ({ ...big.items[0]!, id: `l${i}` }));
    expect(checkoutRequestSchema.safeParse(big).success).toBe(false);
  });
  it("validates email, country and postal code", () => {
    const bad = validCheckout(); bad.customer.email = "nope";
    const country = validCheckout(); country.shipping.country = "zz1";
    const postal = validCheckout(); postal.shipping.postalCode = "<>";
    expect([bad, country, postal].map((b) => checkoutRequestSchema.safeParse(b).success)).toEqual([false, false, false]);
  });
});

describe("orderIdSchema / quoteRequestSchema", () => {
  it("normalises and validates order numbers", () => {
    expect(orderIdSchema.parse(" sc-100234 ")).toBe("SC-100234");
    expect(orderIdSchema.safeParse("DROP TABLE").success).toBe(false);
  });
  it("quote requests are strict too", () => {
    expect(quoteRequestSchema.safeParse({ items: [], price: 1 }).success).toBe(false);
  });
});
