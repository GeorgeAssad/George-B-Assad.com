import { shippingRules } from "@/data/shipping";
import { addMoney, money, multiplyMoney, type Money } from "@/domain/money";
import type { CartItem, CartQuote, CartTotals, QuotedLine } from "@/domain/cart";
import { activeOffers, discountAmount, type ActiveOffers } from "@/lib/promotions";
import { formatPrice } from "@/lib/format";
import { getRepositories } from "@/server/repositories";
import type { Repositories } from "@/server/repositories";

/* AUTHORITATIVE PRICING. The browser says WHICH product/variant/template; this
 * module decides what it costs, from the catalog and the offer schedule
 * (src/config/promotions.ts). There is deliberately no input anywhere that
 * carries a client price, discount or shipping amount. `at` is the moment the
 * price is for: now for a quote, the checkout start for a confirmation. */

const subtract = (a: Money, b: Money): Money => money(Math.max(0, a.amount - b.amount), a.currency);

/** Shipping for a goods total (after discount): flat rate, unless a free-shipping offer is running and the total reaches it. */
export function computeShipping(goods: Money, offers: ActiveOffers = { discount: null, freeShipping: null }): Money {
  if (goods.amount === 0) return money(0);
  const free = offers.freeShipping;
  return free && goods.amount >= free.minSubtotal.amount ? money(0) : shippingRules.flatRate;
}

export function computeTotals(lines: readonly Pick<QuotedLine, "lineTotal">[], at: number = Date.now()): CartTotals {
  const offers = activeOffers(at);
  const subtotal = lines.reduce((sum, l) => addMoney(sum, l.lineTotal), money(0));
  const discount = discountAmount(subtotal, offers.discount);
  const goods = subtract(subtotal, discount);
  const shipping = computeShipping(goods, offers);
  const free = offers.freeShipping;
  return {
    subtotal,
    discount,
    shipping,
    total: addMoney(goods, shipping),
    offer: offers.discount
      ? { id: offers.discount.id, label: offers.discount.label, percent: offers.discount.percent, endsAt: new Date(offers.discount.endsAt).toISOString() }
      : null,
    freeShipping: free
      ? { id: free.id, label: free.label, minSubtotal: free.minSubtotal, remaining: subtract(free.minSubtotal, goods), endsAt: new Date(free.endsAt).toISOString() }
      : null,
    shippingNote: free
      ? `${free.minSubtotal.amount === 0 ? "Free shipping on every order" : `Free shipping on orders over ${formatPrice(free.minSubtotal)}`} · limited-time offer`
      : "",
  };
}

export async function quoteCart(items: readonly CartItem[], repos: Repositories = getRepositories(), at: number = Date.now()): Promise<CartQuote> {
  const lines: QuotedLine[] = [];
  const rejected: { itemId: string; reason: string }[] = [];
  const [sizes, products] = await Promise.all([repos.products.listSizes(), repos.products.listProducts()]);
  const framed = products.find((p) => p.kind === "framed-poster");

  for (const item of items) {
    const [product, variant, entry, template] = await Promise.all([
      repos.products.getProductById(item.productId),
      repos.products.getVariant(item.productId, item.sizeId),
      repos.cars.getEntryBySlug(item.carSlug),
      repos.templates.getById(item.templateId),
    ]);
    if (!product || !variant) {
      rejected.push({ itemId: item.id, reason: "This product is no longer available." });
      continue;
    }
    if (!entry) {
      rejected.push({ itemId: item.id, reason: "This car is not available." });
      continue;
    }
    if (!template) {
      rejected.push({ itemId: item.id, reason: "This design style is not available." });
      continue;
    }
    const unitPrice = addMoney(variant.price, template.surcharge);
    // A print can be upgraded to the framed poster of the same size; the server says what that costs.
    const framedVariant = product.kind === "poster" && framed ? framed.variants.find((v) => v.sizeId === item.sizeId) : undefined;
    const upgradePrice = framedVariant ? addMoney(framedVariant.price, template.surcharge) : null;
    lines.push({
      item,
      productName: product.name,
      productKind: product.kind,
      sku: variant.sku,
      vehicleName: entry.generation.displayName,
      generationLabel: `${entry.generation.specs.years}`,
      specs: entry.generation.specs,
      vehicle: entry.generation.vehicle,
      template,
      sizeLabel: sizes.find((s) => s.id === item.sizeId)?.label ?? item.sizeId,
      unitPrice,
      lineTotal: multiplyMoney(unitPrice, item.quantity),
      ...(framed && upgradePrice ? { upgrade: { productId: framed.id, unitPrice: upgradePrice, difference: subtract(upgradePrice, unitPrice) } } : {}),
    });
  }

  return { lines, totals: computeTotals(lines, at), rejected };
}
