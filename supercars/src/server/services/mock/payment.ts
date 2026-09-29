import type { PaymentStatus } from "@/domain/order";
import { money, type CurrencyCode } from "@/domain/money";
import { fromBase64Url, hmacSign, hmacVerify, toBase64Url } from "@/server/security/sign";
import { ProviderError } from "../errors";
import type { CheckoutSession, CreateCheckoutSessionInput, PaymentProvider, PaymentVerification } from "../contracts";

/* MOCK PAYMENT PROVIDER — no money moves, no card data exists anywhere.
 * Sessions are stateless HMAC-signed tokens because Workers isolates do not
 * share memory. The fallback key below is a PUBLIC demo constant, NOT a secret:
 * forging a demo session can only create a demo order. A real provider reads
 * its secret from server env and fails closed when it is missing. */

export const DEMO_ONLY_SIGNING_KEY = "supercars-demo-only-public-constant-not-a-secret";
const SESSION_PREFIX = "cs_demo_";
const SESSION_TTL_MS = 30 * 60 * 1000;

interface SessionPayload {
  o: string;
  a: number;
  c: CurrencyCode;
  h: string;
  e: number;
}

export function createMockPaymentProvider(signingKey: string = DEMO_ONLY_SIGNING_KEY, now: () => number = Date.now): PaymentProvider {
  const encoder = new TextEncoder();
  const decoder = new TextDecoder();

  return {
    id: "mock",

    async createCheckoutSession(input: CreateCheckoutSessionInput): Promise<CheckoutSession> {
      const expires = now() + SESSION_TTL_MS;
      const payload: SessionPayload = { o: input.orderId, a: input.amount.amount, c: input.amount.currency, h: input.cartHash, e: expires };
      const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
      const signature = await hmacSign(signingKey, body);
      return { sessionId: `${SESSION_PREFIX}${body}.${signature}`, status: "open", expiresAt: new Date(expires).toISOString(), demo: true };
    },

    async verifyPayment(sessionId: string): Promise<PaymentVerification> {
      if (!sessionId.startsWith(SESSION_PREFIX)) throw new ProviderError("invalid_session", "Unrecognised checkout session.");
      const [body, signature] = sessionId.slice(SESSION_PREFIX.length).split(".");
      if (!body || !signature || !(await hmacVerify(signingKey, body, signature))) {
        throw new ProviderError("invalid_session", "Checkout session could not be verified.");
      }
      let payload: SessionPayload;
      try {
        payload = JSON.parse(decoder.decode(fromBase64Url(body))) as SessionPayload;
      } catch {
        throw new ProviderError("invalid_session", "Checkout session could not be read.");
      }
      if (typeof payload.e !== "number" || payload.e < now()) throw new ProviderError("session_expired", "Checkout session expired.");
      return {
        status: "paid",
        paymentId: `pay_demo_${payload.o}`,
        orderId: payload.o,
        amount: money(payload.a, payload.c),
        cartHash: payload.h,
      };
    },

    async getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
      return paymentId.startsWith("pay_demo_") ? "paid" : "failed";
    },
  };
}

export const mockPaymentProvider = createMockPaymentProvider();
