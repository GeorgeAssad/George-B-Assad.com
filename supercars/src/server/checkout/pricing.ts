import { shippingRules } from "@/data/shipping";
import { addMoney, money, multiplyMoney, type Money } from "@/domain/money";
import type { CartItem, CartQuote, CartTotals, QuotedLine } from "@/domain/cart";
import { formatPrice } from "@/lib/format";
import { getRepositories } from "@/server/repositories";
import type { Repositories } from "@/server/repositories";

/* AUTHORITATIVE PRICING. The browser says WHICH product/variant/template; this
 * module decides what it costs, from the catalog. There is deliberately no
 * input anywhere that carries a client price, discount or shipping amount. */

export function computeShipping(subtotal: Money): Money {
  if (subtotal.amount === 0) return money(0);
  return subtotal.amount >= shippingRules.freeOver.amount ? money(0) : shippingRules.flatRate;
}

export function computeTotals(lines: readonly Pick<QuotedLine, "lineTotal">[]): CartTotals {
  const subtotal = lines.reduce((sum, l) => addMoney(sum, l.lineTotal), money(0));
  const shipping = computeShipping(subtotal);
  return {
    subtotal,
    shipping,
    total: addMoney(subtotal, shipping),
    shippingNote: `Free shipping over ${formatPrice(shippingRules.freeOver)}`,
  };
}

export async function quoteCart(items: readonly CartItem[], repos: Repositories = getRepositories()): Promise<CartQuote> {
  const lines: QuotedLine[] = [];
  const rejected: { itemId: string; reason: string }[] = [];
  const sizes = await repos.products.listSizes();

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
    });
  }

  return { lines, totals: computeTotals(lines), rejected };
}
