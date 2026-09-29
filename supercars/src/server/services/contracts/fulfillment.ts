import type { CreateFulfillmentOrderInput, FulfillmentOrder, Shipment } from "@/domain/fulfillment";
import type { OrderStage } from "@/domain/order";

/* FULFILLMENT PROVIDER BOUNDARY (server-only). No component knows which print
 * partner is behind it. Future flow: payment confirmed → design generated →
 * print file validated → fulfilment order created → tracking returned →
 * customer notified. */

export interface FulfillmentStatus {
  readonly orderId: string;
  readonly stage: OrderStage;
  readonly updatedAt: string;
}

export interface FulfillmentProvider {
  readonly id: string;
  createOrder(input: CreateFulfillmentOrderInput): Promise<FulfillmentOrder>;
  getOrderStatus(orderId: string): Promise<FulfillmentStatus | null>;
  getShipment(orderId: string): Promise<Shipment | null>;
  cancelOrder(orderId: string): Promise<{ readonly cancelled: boolean; readonly reason?: string }>;
}
