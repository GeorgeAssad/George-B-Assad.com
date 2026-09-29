import { startCheckout } from "@/server/checkout/checkout-service";
import { ApiError, withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { ProviderError } from "@/server/services/errors";
import { checkoutRequestSchema } from "@/lib/validation";

/**
 * POST /api/checkout/session — creates a payment session.
 * The client sends product REFERENCES and contact details only. The server
 * prices the cart from the catalog, so there is no field in which a client
 * could supply a price, discount, shipping cost or payment/order status
 * (the schema is strict and rejects unknown keys).
 * The response carries only safe values: session id, status, totals.
 */
export const POST = withApi(
  { route: "checkout.session", method: "POST", schema: checkoutRequestSchema, rateLimit: rateLimitPolicies.checkout, maxBodyBytes: 24 * 1024 },
  async ({ input }) => {
    try {
      return await startCheckout(input);
    } catch (err) {
      if (err instanceof ProviderError) throw new ApiError(503, "payment_unavailable", "Checkout is temporarily unavailable. Please try again.");
      throw err;
    }
  },
);
