import { getServerEnv, type ServerEnv } from "@/config/env";
import { ProviderError } from "./errors";
import { createMockPaymentProvider, DEMO_ONLY_SIGNING_KEY } from "./mock/payment";
import { mockAiDesignProvider } from "./mock/ai-design";
import { mockFulfillmentProvider } from "./mock/fulfillment";
import { mockSupportAgent } from "./mock/support";
import type { AiDesignProvider, FulfillmentProvider, PaymentProvider, SupportProvider } from "./contracts";

/* SERVICE FACTORY — the single place providers are chosen. Adding a real
 * provider = implement the contract, add a case here, set its env vars.
 * Selecting a provider that has no implementation FAILS CLOSED (throws) so a
 * future integration can never run half-configured by accident. */

export interface Services {
  readonly payment: PaymentProvider;
  readonly ai: AiDesignProvider;
  readonly fulfillment: FulfillmentProvider;
  readonly support: SupportProvider;
}

const notConfigured = (what: string): never => {
  throw new ProviderError("not_configured", `${what} provider is selected but not implemented.`);
};

export function createServices(env: ServerEnv): Services {
  return {
    payment: env.PAYMENT_PROVIDER === "mock" ? createMockPaymentProvider(env.CHECKOUT_SIGNING_SECRET ?? DEMO_ONLY_SIGNING_KEY) : notConfigured("Payment"),
    ai: env.AI_PROVIDER === "mock" ? mockAiDesignProvider : notConfigured("AI design"),
    fulfillment: env.FULFILLMENT_PROVIDER === "mock" ? mockFulfillmentProvider : notConfigured("Fulfillment"),
    support: env.SUPPORT_PROVIDER === "mock" ? mockSupportAgent : notConfigured("Support"),
  };
}

let cached: Services | undefined;

export function getServices(): Services {
  return (cached ??= createServices(getServerEnv()));
}
