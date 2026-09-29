import { getRepositories } from "@/server/repositories";
import { formatPrice, formatDateRange } from "@/lib/format";
import { newId } from "@/lib/ids";
import { shippingRules } from "@/data/shipping";
import { toPublicOrderView } from "@/server/checkout/public-order";
import type { SupportAnswer } from "@/domain/support";
import type { SupportProvider } from "../contracts";

/* MOCK SUPPORT AGENT — rule-based answers over LOCAL DEMO data. Nothing here is
 * a production policy. A future AI agent implements the same `SupportProvider`
 * with tool access to real orders and catalog. */

const ORDER_ID_IN_TEXT = /\bSC-[A-Z0-9]{6,8}\b/i;

const answer = (text: string, suggestions: string[] = [], escalate = false): SupportAnswer => ({ text, suggestions, escalate, demo: true });

const MENU = ["How much does a poster cost?", "How long is delivery?", "What sizes are available?", "Where is order SC-100234?"];

export const mockSupportAgent: SupportProvider = {
  id: "mock",

  async answerCustomer({ message }): Promise<SupportAnswer> {
    const text = message.toLowerCase();
    const repos = getRepositories();

    const orderMatch = ORDER_ID_IN_TEXT.exec(message);
    if (orderMatch) {
      const view = await mockSupportAgent.getOrderStatus(orderMatch[0].toUpperCase());
      if (!view) return answer(`I couldn't find order ${orderMatch[0].toUpperCase()} in the demo data. Double-check the number, or try SC-100234.`, ["Where is order SC-100234?"]);
      const current = view.timeline.find((t) => t.state === "active") ?? view.timeline[view.timeline.length - 1];
      const tracking = view.shipment?.trackingNumber ? ` Tracking: ${view.shipment.trackingNumber} (${view.shipment.carrier}).` : "";
      return answer(
        `Order ${view.id}: currently "${current?.label ?? view.status}". Estimated delivery ${formatDateRange(view.estimatedDelivery.from, view.estimatedDelivery.to)}.${tracking}`,
        ["Open the tracking page"],
      );
    }

    if (/(human|agent|person|complain|speak to|talk to)/.test(text)) {
      return answer("I'll flag this for a human teammate. In this demo no ticket is actually sent — in production this creates a support ticket.", [], true);
    }
    if (/(track|where.*order|order status)/.test(text)) {
      return answer("Send me your order number (like SC-100234) and I'll check its status, or use the Track Order page.", ["Where is order SC-100234?"]);
    }
    if (/(price|cost|how much|expensive|cheap)/.test(text)) {
      const products = await repos.products.listProducts();
      const sizes = await repos.products.listSizes();
      const lines = products.map((p) => {
        const list = p.variants.map((v) => `${sizes.find((s) => s.id === v.sizeId)?.label ?? v.sizeId} ${formatPrice(v.price)}`).join(", ");
        return `${p.name}: ${list}`;
      });
      return answer(`Demo prices — ${lines.join(" · ")}. The Luxury style adds a small surcharge. Shipping: ${formatPrice(shippingRules.flatRate)}, free over ${formatPrice(shippingRules.freeOver)}.`, ["What sizes are available?"]);
    }
    if (/(size|dimension|big|large|cm)/.test(text)) {
      const sizes = await repos.products.listSizes();
      return answer(`Available sizes: ${sizes.map((s) => s.label).join(", ")}.`, ["How much does a poster cost?"]);
    }
    if (/(deliver|ship|arrive|how long|when will)/.test(text)) {
      return answer(`Demo estimate: ${shippingRules.minBusinessDays}–${shippingRules.maxBusinessDays} business days including production. Shipping is ${formatPrice(shippingRules.flatRate)}, free over ${formatPrice(shippingRules.freeOver)}.`, ["Where is order SC-100234?"]);
    }
    if (/(return|refund|cancel)/.test(text)) {
      return answer("Our returns policy for personalised items is still being finalised. See the Returns page for the placeholder text — nothing here is a binding policy yet.", ["Talk to a human"]);
    }
    if (/(pay|card|secure|checkout)/.test(text)) {
      return answer("This prototype never collects card details. The DEMO PAYMENT button simulates a successful payment so you can see the whole flow. No money moves.");
    }
    if (/(style|template|design|look)/.test(text)) {
      const templates = await repos.templates.list();
      return answer(`Styles: ${templates.map((t) => `${t.name} (${t.tagline.toLowerCase().replace(/\.$/, "")})`).join("; ")}.`, ["How much does a poster cost?"]);
    }
    if (/(personal|name|text|custom|engrav)/.test(text)) {
      return answer("You can add your name (up to 24 characters), plus optional text, year and location. Everything is checked before we print.");
    }
    return answer("I can help with prices, sizes, delivery and order status. What would you like to know?", MENU);
  },

  async getOrderStatus(orderId) {
    const order = await getRepositories().orders.get(orderId);
    return order ? toPublicOrderView(order) : null;
  },

  async getProductInfo(query) {
    const products = await getRepositories().products.listProducts();
    const q = query.toLowerCase();
    const product = products.find((p) => p.name.toLowerCase().includes(q) || q.includes(p.kind));
    return product ? { title: product.name, summary: product.description } : null;
  },

  async getTracking(orderId) {
    const order = await getRepositories().orders.get(orderId);
    if (!order?.shipment) return null;
    return { carrier: order.shipment.carrier, ...(order.shipment.trackingNumber ? { trackingNumber: order.shipment.trackingNumber } : {}) };
  },

  async createSupportTicket() {
    return { id: newId("tkt_demo"), createdAt: new Date().toISOString(), status: "open" };
  },

  async escalateToHuman() {
    return { id: newId("tkt_demo"), createdAt: new Date().toISOString(), status: "open" };
  },
};

