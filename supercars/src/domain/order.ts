import type { Address, Customer } from "./customer";
import type { Customization } from "./cart";
import type { SizeId, TemplateId } from "./catalog";
import type { Money } from "./money";
import type { Shipment } from "./fulfillment";

/* ORDER DOMAIN — server-authored. Every field here is set by the server;
 * a client may never specify owner, payment status or fulfilment status. */

export type OrderStage = "confirmed" | "design" | "print" | "shipped" | "delivered";
export const ORDER_STAGES: readonly OrderStage[] = [
  "confirmed",
  "design",
  "print",
  "shipped",
  "delivered",
];

export type OrderStatus = OrderStage | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export interface Payment {
  readonly id: string;
  readonly provider: string;
  readonly status: PaymentStatus;
  readonly amount: Money;
  readonly sessionId: string;
  /** True for every prototype payment. No money moves. */
  readonly demo: boolean;
}

export interface OrderItem {
  readonly id: string;
  readonly productId: string;
  readonly sku: string;
  readonly productName: string;
  readonly carSlug: string;
  readonly vehicleName: string;
  readonly templateId: TemplateId;
  readonly sizeId: SizeId;
  readonly sizeLabel: string;
  readonly customization: Customization;
  readonly quantity: number;
  /** Server snapshot at order time. */
  readonly unitPrice: Money;
  readonly lineTotal: Money;
}

export interface Order {
  /** Human-friendly public order number, e.g. "SC-7K3M9Q". */
  readonly id: string;
  readonly status: OrderStatus;
  readonly customer: Customer;
  readonly shippingAddress: Address;
  readonly items: readonly OrderItem[];
  readonly subtotal: Money;
  readonly shipping: Money;
  readonly total: Money;
  readonly payment: Payment;
  readonly shipment?: Shipment;
  readonly createdAt: string;
  readonly estimatedDelivery: { readonly from: string; readonly to: string };
  /** Always "demo" until a real payment provider is connected. */
  readonly mode: "demo" | "live";
}

/** Privacy-preserving view returned by public order lookup (no contact details). */
export interface PublicOrderView {
  readonly id: string;
  readonly status: OrderStatus;
  readonly createdAt: string;
  readonly estimatedDelivery: { readonly from: string; readonly to: string };
  readonly items: readonly Pick<
    OrderItem,
    "productName" | "vehicleName" | "templateId" | "sizeLabel" | "quantity"
  >[];
  readonly shipTo: { readonly city: string; readonly country: string };
  readonly timeline: readonly TimelineEntry[];
  readonly shipment?: Pick<Shipment, "carrier" | "trackingNumber" | "status">;
  readonly mode: "demo" | "live";
}

export type TimelineState = "done" | "active" | "pending";

export interface TimelineEntry {
  readonly stage: OrderStage;
  readonly label: string;
  readonly detail: string;
  readonly state: TimelineState;
  /** ISO timestamp when done, or an estimate label when pending. */
  readonly at?: string;
}
