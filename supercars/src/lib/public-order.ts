import type { Order, PublicOrderView } from "@/domain/order";
import { buildTimeline } from "@/lib/order-timeline";

/** Privacy-preserving projection of an order for public lookup: no name, email,
 * phone or street address — only what a tracking page needs. */
export function toPublicOrderView(order: Order): PublicOrderView {
  return {
    id: order.id,
    status: order.status,
    createdAt: order.createdAt,
    estimatedDelivery: order.estimatedDelivery,
    items: order.items.map((i) => ({
      productName: i.productName,
      vehicleName: i.vehicleName,
      templateId: i.templateId,
      sizeLabel: i.sizeLabel,
      quantity: i.quantity,
    })),
    shipTo: { city: order.shippingAddress.city, country: order.shippingAddress.country },
    timeline: buildTimeline(order.status, order.createdAt),
    ...(order.shipment
      ? { shipment: { carrier: order.shipment.carrier, ...(order.shipment.trackingNumber ? { trackingNumber: order.shipment.trackingNumber } : {}), status: order.shipment.status } }
      : {}),
    mode: order.mode,
  };
}
