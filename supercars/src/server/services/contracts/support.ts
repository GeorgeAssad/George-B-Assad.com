import type { PublicOrderView } from "@/domain/order";
import type { SupportAnswer, SupportTicket } from "@/domain/support";

/* SUPPORT AGENT BOUNDARY (server-only). The demo agent is rule-based over local
 * data; a future AI agent implements the same interface with tool access to
 * orders and catalog, behind auth, rate limits and prompt-injection guards. */

export interface ProductInfo {
  readonly title: string;
  readonly summary: string;
}

export interface SupportProvider {
  readonly id: string;
  answerCustomer(input: { message: string }): Promise<SupportAnswer>;
  getOrderStatus(orderId: string): Promise<PublicOrderView | null>;
  getProductInfo(query: string): Promise<ProductInfo | null>;
  getTracking(orderId: string): Promise<{ readonly carrier: string; readonly trackingNumber?: string } | null>;
  createSupportTicket(input: { subject: string; message: string; orderId?: string }): Promise<SupportTicket>;
  escalateToHuman(input: { conversationSummary: string }): Promise<SupportTicket>;
}
