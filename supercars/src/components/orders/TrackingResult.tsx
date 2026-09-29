import type { PublicOrderView } from "@/domain/order";
import { Badge } from "@/components/ui/Badge";
import { formatDateRange } from "@/lib/format";
import { OrderTimeline } from "./OrderTimeline";

const STATUS_LABEL: Record<PublicOrderView["status"], string> = {
  confirmed: "Order confirmed",
  design: "In design",
  print: "In print",
  shipped: "Shipped",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

/** Renders the privacy-preserving public view of an order. */
export function TrackingResult({ order, animate = false }: { order: PublicOrderView; animate?: boolean }) {
  return (
    <article className="card p-6 sm:p-8" aria-label={`Order ${order.id}`}>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="spec">Order number</p>
          <h2 className="h-display mt-1 text-4xl sm:text-5xl">{order.id}</h2>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="red">{STATUS_LABEL[order.status]}</Badge>
          {order.mode === "demo" && <Badge tone="demo">Demo order</Badge>}
        </div>
      </div>

      <div className="mt-8"><OrderTimeline entries={order.timeline} animate={animate} /></div>

      <dl className="mt-10 grid grid-cols-1 gap-6 border-t border-line pt-8 sm:grid-cols-3">
        <div>
          <dt className="spec">Estimated delivery</dt>
          <dd className="mt-1.5 font-medium">{formatDateRange(order.estimatedDelivery.from, order.estimatedDelivery.to)}</dd>
        </div>
        <div>
          <dt className="spec">Shipping to</dt>
          <dd className="mt-1.5 font-medium">{order.shipTo.city}, {order.shipTo.country}</dd>
        </div>
        <div>
          <dt className="spec">Tracking</dt>
          <dd className="mt-1.5 font-medium">{order.shipment?.trackingNumber ? <>{order.shipment.trackingNumber} <span className="text-muted">({order.shipment.carrier})</span></> : <span className="text-muted">Available once shipped</span>}</dd>
        </div>
      </dl>

      <ul className="mt-8 divide-y divide-line rounded-xl border border-line" aria-label="Items">
        {order.items.map((i, idx) => (
          <li key={idx} className="flex items-center justify-between gap-4 px-4 py-3 text-sm">
            <span className="min-w-0"><span className="block truncate font-semibold">{i.vehicleName}</span><span className="block truncate text-muted">{i.productName} · {i.templateId} · {i.sizeLabel}</span></span>
            <span className="flex-none tabular-nums text-muted">×{i.quantity}</span>
          </li>
        ))}
      </ul>
      {order.mode === "demo" && <p className="mt-4 text-xs text-subtle">Demo data. In production this page reads live status from the fulfilment partner.</p>}
    </article>
  );
}
