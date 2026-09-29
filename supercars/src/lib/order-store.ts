import { z } from "zod";
import type { Order } from "@/domain/order";
import { ORDER_ID_PATTERN } from "./ids";

/* DEMO ORDER STORE (browser). The prototype has no database, so the order the
 * server just created is cached in this browser for the confirmation page.
 * It is display data only and is re-validated on every read. Replace with a real
 * OrderRepository lookup once orders are persisted server-side. */

const KEY = "sc.orders.v1";
const MAX_ORDERS = 10;

const money = z.object({ amount: z.number().int(), currency: z.literal("EUR") });
const str = (max: number) => z.string().max(max);

const orderSchema = z.object({
  id: z.string().regex(ORDER_ID_PATTERN),
  status: z.enum(["confirmed", "design", "print", "shipped", "delivered", "cancelled"]),
  customer: z.object({ id: str(64), name: str(120), email: str(254), phone: str(32).optional() }),
  shippingAddress: z.object({ line1: str(120), line2: str(120).optional(), city: str(80), postalCode: str(16), country: str(2) }),
  items: z.array(z.object({
    id: str(80), productId: str(64), sku: str(32), productName: str(80), carSlug: str(80), vehicleName: str(120),
    templateId: z.enum(["minimal", "blueprint", "racing", "heritage", "luxury"]), sizeId: z.enum(["30x40", "40x60", "50x70"]), sizeLabel: str(24),
    customization: z.object({ name: str(40), text: str(80).optional(), year: str(4).optional(), location: str(60).optional() }),
    quantity: z.number().int().min(1).max(10), unitPrice: money, lineTotal: money,
  })).max(20),
  subtotal: money, shipping: money, total: money,
  payment: z.object({ id: str(80), provider: str(32), status: z.enum(["pending", "paid", "failed", "refunded"]), amount: money, sessionId: str(700), demo: z.boolean() }),
  createdAt: str(40),
  estimatedDelivery: z.object({ from: str(20), to: str(20) }),
  mode: z.enum(["demo", "live"]),
}).passthrough();

function readAll(): Order[] {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = z.array(orderSchema).safeParse(JSON.parse(raw));
    return parsed.success ? (parsed.data as unknown as Order[]) : [];
  } catch {
    return [];
  }
}

export function saveLocalOrder(order: Order): void {
  try {
    const rest = readAll().filter((o) => o.id !== order.id);
    window.localStorage.setItem(KEY, JSON.stringify([order, ...rest].slice(0, MAX_ORDERS)));
  } catch {
    // Storage unavailable: the confirmation page falls back to the public lookup.
  }
}

export function getLocalOrder(id: string): Order | null {
  return readAll().find((o) => o.id === id) ?? null;
}
