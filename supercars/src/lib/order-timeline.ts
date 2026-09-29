import { ORDER_STAGES, type OrderStage, type OrderStatus, type TimelineEntry } from "@/domain/order";

/* Pure timeline builder shared by server (public order view) and client (local
 * demo snapshot). `status` is the CURRENT stage: earlier stages are done, the
 * current stage is active, later ones pending. `delivered` is fully done. */

const COPY: Record<OrderStage, { label: string; active: string; done: string; pending: string }> = {
  confirmed: { label: "Order confirmed", active: "Payment received. Getting your artwork queued.", done: "Payment received (demo).", pending: "Awaiting payment." },
  design: { label: "Design", active: "Your artwork is being composed and checked.", done: "Artwork approved for print.", pending: "We'll compose your artwork next." },
  print: { label: "Print", active: "Printing and quality inspection.", done: "Printed and inspected.", pending: "Printed on premium paper." },
  shipped: { label: "Shipped", active: "On its way to you.", done: "Handed to the carrier.", pending: "Ships with tracking." },
  delivered: { label: "Delivered", active: "Arriving today.", done: "Delivered.", pending: "Delivered to your door." },
};

const STAGE_OFFSET_HOURS: Record<OrderStage, number> = { confirmed: 0, design: 1, print: 24, shipped: 72, delivered: 168 };

export function buildTimeline(status: OrderStatus, createdAtIso: string): TimelineEntry[] {
  const created = new Date(createdAtIso).getTime();
  const currentIdx = status === "cancelled" ? -1 : ORDER_STAGES.indexOf(status);
  return ORDER_STAGES.map((stage, idx): TimelineEntry => {
    const copy = COPY[stage];
    const finished = currentIdx === ORDER_STAGES.length - 1 || idx < currentIdx;
    const state = finished ? "done" : idx === currentIdx ? "active" : "pending";
    const at = Number.isNaN(created) ? undefined : new Date(created + STAGE_OFFSET_HOURS[stage] * 3_600_000).toISOString();
    return {
      stage,
      label: copy.label,
      detail: state === "done" ? copy.done : state === "active" ? copy.active : copy.pending,
      state,
      ...(state === "done" && at ? { at } : {}),
    };
  });
}
