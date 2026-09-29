import { describe, expect, it } from "vitest";
import { quoteCart, computeShipping } from "@/server/checkout/pricing";
import { money } from "@/domain/money";
import type { CartItem } from "@/domain/cart";

const item = (over: Partial<CartItem> = {}): CartItem => ({
  id: "l1", productId: "custom-car-poster", sizeId: "50x70", carSlug: "bmw-m3-g80", templateId: "racing",
  customization: { name: "GEORGE" }, quantity: 1, ...over,
});

describe("quoteCart (authoritative pricing)", () => {
  it("prices from the catalog, not from the client", async () => {
    const q = await quoteCart([item()]);
    expect(q.lines[0]?.unitPrice).toEqual(money(7900));
    expect(q.totals.subtotal).toEqual(money(7900));
    expect(q.totals.shipping).toEqual(money(790)); // €79 is below the €100 free-shipping threshold
    expect(q.totals.total).toEqual(money(7900 + 790));
  });

  it("charges flat shipping below the free threshold and none above", async () => {
    const small = await quoteCart([item({ sizeId: "30x40" })]);
    expect(small.totals.shipping).toEqual(money(790));
    expect(small.totals.total).toEqual(money(3900 + 790));
    const big = await quoteCart([item({ quantity: 2 })]);
    expect(big.totals.subtotal).toEqual(money(15800));
    expect(big.totals.shipping).toEqual(money(0));
  });

  it("adds the template surcharge server-side (luxury)", async () => {
    const q = await quoteCart([item({ templateId: "luxury", sizeId: "40x60" })]);
    expect(q.lines[0]?.unitPrice).toEqual(money(5900 + 1000));
  });

  it("reports unknown products, cars and templates instead of pricing them", async () => {
    const q = await quoteCart([
      item({ id: "a", productId: "nope" }),
      item({ id: "b", carSlug: "not-a-car" }),
      item({ id: "c", templateId: "minimal" }),
    ]);
    expect(q.rejected.map((r) => r.itemId)).toEqual(["a", "b"]);
    expect(q.lines).toHaveLength(1);
  });

  it("has zero shipping for an empty cart", () => {
    expect(computeShipping(money(0))).toEqual(money(0));
  });
});
