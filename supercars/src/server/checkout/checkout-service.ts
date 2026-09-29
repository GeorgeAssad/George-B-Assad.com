import { ApiError } from "@/server/security/api-handler";
import { sha256Hex } from "@/server/security/sign";
import { getRepositories, type Repositories } from "@/server/repositories";
import { getServices, type Services } from "@/server/services";
import { ProviderError } from "@/server/services/errors";
import type { CartItem, CartTotals } from "@/domain/cart";
import type { Order, OrderItem } from "@/domain/order";
import type { CheckoutRequest } from "@/lib/validation";
import { generateOrderId } from "@/lib/ids";
import { estimateDelivery } from "@/lib/delivery";
import { printSpecFor } from "@/lib/print-spec";
import { shippingRules } from "@/data/shipping";
import { quoteCart } from "./pricing";

/* CHECKOUT ORCHESTRATION.
 * startCheckout:   validate → price from catalog → payment session
 * confirmCheckout: verify payment → re-price → bind check → create order → fulfilment
 * The client never supplies owner, payment status, fulfilment status or price. */

export interface CheckoutDeps {
  readonly repos: Repositories;
  readonly services: Services;
  readonly now: () => Date;
  readonly newOrderId: () => string;
}

const defaultDeps = (): CheckoutDeps => ({ repos: getRepositories(), services: getServices(), now: () => new Date(), newOrderId: generateOrderId });

/** Hash of exactly what was priced, so a session cannot be reused for a different cart. */
export async function hashCart(items: readonly CartItem[], country: string): Promise<string> {
  const canonical = items.map((i) => ({
    p: i.productId, s: i.sizeId, c: i.carSlug, t: i.templateId, q: i.quantity,
    n: i.customization.name, x: i.customization.text ?? "", y: i.customization.year ?? "", l: i.customization.location ?? "",
  }));
  return sha256Hex(JSON.stringify({ canonical, country }));
}

async function priceOrThrow(items: readonly CartItem[], repos: Repositories) {
  const quote = await quoteCart(items, repos);
  if (quote.rejected.length > 0 || quote.lines.length === 0) {
    throw new ApiError(422, "items_unavailable", "Some items in your cart are no longer available.");
  }
  return quote;
}

export interface StartCheckoutResult {
  readonly sessionId: string;
  readonly orderId: string;
  readonly expiresAt: string;
  readonly totals: CartTotals;
  readonly demo: boolean;
}

export async function startCheckout(req: CheckoutRequest, deps: CheckoutDeps = defaultDeps()): Promise<StartCheckoutResult> {
  const quote = await priceOrThrow(req.items, deps.repos);
  const orderId = deps.newOrderId();
  const session = await deps.services.payment.createCheckoutSession({
    orderId,
    amount: quote.totals.total,
    cartHash: await hashCart(req.items, req.shipping.country),
    description: `SuperCars order ${orderId}`,
  });
  return { sessionId: session.sessionId, orderId, expiresAt: session.expiresAt, totals: quote.totals, demo: session.demo };
}

export async function confirmCheckout(input: { sessionId: string; checkout: CheckoutRequest }, deps: CheckoutDeps = defaultDeps()): Promise<Order> {
  let verification;
  try {
    verification = await deps.services.payment.verifyPayment(input.sessionId);
  } catch (err) {
    if (err instanceof ProviderError && err.code === "session_expired") throw new ApiError(410, "session_expired", "Your checkout session expired. Please try again.");
    if (err instanceof ProviderError && err.code === "invalid_session") throw new ApiError(400, "invalid_session", "Your checkout session is not valid.");
    throw err;
  }
  if (verification.status !== "paid") throw new ApiError(402, "payment_not_completed", "Payment was not completed.");

  const { checkout } = input;
  const quote = await priceOrThrow(checkout.items, deps.repos);
  const expectedHash = await hashCart(checkout.items, checkout.shipping.country);
  if (expectedHash !== verification.cartHash || quote.totals.total.amount !== verification.amount.amount) {
    throw new ApiError(409, "cart_changed", "Your cart changed since checkout started. Please review it and try again.");
  }

  const orderId = verification.orderId;
  const now = deps.now();
  const customer = await deps.repos.customers.upsertByEmail(checkout.customer);

  const items: OrderItem[] = quote.lines.map((line, idx) => ({
    id: `oi_${orderId}_${idx + 1}`,
    productId: line.item.productId,
    sku: line.sku,
    productName: line.productName,
    carSlug: line.item.carSlug,
    vehicleName: line.vehicleName,
    templateId: line.item.templateId,
    sizeId: line.item.sizeId,
    sizeLabel: line.sizeLabel,
    customization: line.item.customization,
    quantity: line.item.quantity,
    unitPrice: line.unitPrice,
    lineTotal: line.lineTotal,
  }));

  const fulfillment = await deps.services.fulfillment.createOrder({
    orderId,
    recipient: { name: checkout.customer.name, address: checkout.shipping },
    items: items.map((i) => {
      const spec = printSpecFor(i.sizeId);
      return { sku: i.sku, quantity: i.quantity, widthMm: spec.widthMm, heightMm: spec.heightMm };
    }),
  });

  const order: Order = {
    id: orderId,
    status: fulfillment.stage,
    customer,
    shippingAddress: checkout.shipping,
    items,
    subtotal: quote.totals.subtotal,
    shipping: quote.totals.shipping,
    total: quote.totals.total,
    payment: {
      id: verification.paymentId,
      provider: deps.services.payment.id,
      status: verification.status,
      amount: verification.amount,
      sessionId: input.sessionId,
      demo: deps.services.payment.id === "mock",
    },
    createdAt: now.toISOString(),
    estimatedDelivery: estimateDelivery(now, shippingRules.minBusinessDays, shippingRules.maxBusinessDays),
    mode: deps.services.payment.id === "mock" ? "demo" : "live",
  };

  return deps.repos.orders.create(order);
}
