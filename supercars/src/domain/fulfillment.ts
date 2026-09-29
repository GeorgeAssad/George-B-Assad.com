import type { Address } from "./customer";
import type { OrderStage } from "./order";

/* FULFILLMENT DOMAIN — printing and shipping. Vendor-neutral; a provider maps
 * its own status vocabulary onto these shapes. */

export type ShipmentStatus = "pending" | "label_created" | "in_transit" | "out_for_delivery" | "delivered" | "exception";

export interface ShipmentEvent {
  readonly at: string;
  readonly status: ShipmentStatus;
  readonly description: string;
}

export interface Shipment {
  readonly id: string;
  readonly carrier: string;
  readonly trackingNumber?: string;
  readonly trackingUrl?: string;
  readonly status: ShipmentStatus;
  readonly events: readonly ShipmentEvent[];
}

export interface FulfillmentLineItem {
  readonly sku: string;
  readonly quantity: number;
  /** Reference to the print-ready asset produced by the design pipeline. */
  readonly printAssetId?: string;
  readonly widthMm: number;
  readonly heightMm: number;
}

export interface CreateFulfillmentOrderInput {
  /** Our own order id; used as the idempotency key. */
  readonly orderId: string;
  readonly recipient: { readonly name: string; readonly address: Address };
  readonly items: readonly FulfillmentLineItem[];
}

export interface FulfillmentOrder {
  readonly fulfillmentOrderId: string;
  readonly orderId: string;
  readonly stage: OrderStage;
  readonly createdAt: string;
}
