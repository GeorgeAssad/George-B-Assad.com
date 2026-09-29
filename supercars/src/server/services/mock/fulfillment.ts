import { getRepositories } from "@/server/repositories";
import type { FulfillmentProvider } from "../contracts";
import { newId } from "@/lib/ids";

/* MOCK FULFILLMENT PROVIDER — no print partner is contacted. Newly created demo
 * orders enter the "design" stage; seeded sample orders keep their own state. */

export const mockFulfillmentProvider: FulfillmentProvider = {
  id: "mock",

  async createOrder(input) {
    return { fulfillmentOrderId: newId("ful_demo"), orderId: input.orderId, stage: "design", createdAt: new Date().toISOString() };
  },

  async getOrderStatus(orderId) {
    const order = await getRepositories().orders.get(orderId);
    if (!order || order.status === "cancelled") return null;
    return { orderId, stage: order.status, updatedAt: order.createdAt };
  },

  async getShipment(orderId) {
    return (await getRepositories().orders.get(orderId))?.shipment ?? null;
  },

  async cancelOrder(orderId) {
    const order = await getRepositories().orders.get(orderId);
    if (!order) return { cancelled: false, reason: "Order not found." };
    if (order.status === "confirmed" || order.status === "design") return { cancelled: true };
    return { cancelled: false, reason: "The order is already in production." };
  },
};
