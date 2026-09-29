import type { Money } from "@/domain/money";
import type { PaymentStatus } from "@/domain/order";

/* PAYMENT PROVIDER BOUNDARY (server-only).
 * Secrets for a real provider (e.g. Stripe) are read from server env inside the
 * provider implementation and are never returned to the browser. The client
 * only ever receives: a session id, a status, and optionally a public checkout
 * URL. */

export interface CreateCheckoutSessionInput {
  readonly orderId: string;
  /** Server-computed total. Never a client-supplied price. */
  readonly amount: Money;
  /** Hash binding the session to the exact cart that was priced. */
  readonly cartHash: string;
  readonly description: string;
}

export interface CheckoutSession {
  readonly sessionId: string;
  readonly status: "open";
  readonly expiresAt: string;
  /** Present for hosted-checkout providers. Absent for the demo. */
  readonly checkoutUrl?: string;
  readonly demo: boolean;
}

export interface PaymentVerification {
  readonly status: PaymentStatus;
  readonly paymentId: string;
  readonly orderId: string;
  readonly amount: Money;
  readonly cartHash: string;
}

export interface PaymentProvider {
  readonly id: string;
  createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession>;
  /** Authoritative server-side confirmation. Real providers must call the provider API / verify webhook signatures. */
  verifyPayment(sessionId: string): Promise<PaymentVerification>;
  getPaymentStatus(paymentId: string): Promise<PaymentStatus>;
}
