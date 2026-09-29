import { confirmCheckout } from "@/server/checkout/checkout-service";
import { ApiError, withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { getServices } from "@/server/services";
import { ProviderError } from "@/server/services/errors";
import { confirmRequestSchema } from "@/lib/validation";

/**
 * POST /api/checkout/demo-confirm — completes a DEMO payment.
 * Only exists while the mock payment provider is active; with a real provider,
 * the order is created from the provider's signed webhook instead, and this
 * route answers 404. The order's owner, payment status and fulfilment status
 * are all decided here, never by the client.
 */
export const POST = withApi(
  { route: "checkout.demo-confirm", method: "POST", schema: confirmRequestSchema, rateLimit: rateLimitPolicies.checkout, maxBodyBytes: 32 * 1024 },
  async ({ input }) => {
    try {
      if (getServices().payment.id !== "mock") throw new ApiError(404, "not_found", "Not found.");
      const order = await confirmCheckout(input);
      return { order };
    } catch (err) {
      if (err instanceof ProviderError) throw new ApiError(503, "payment_unavailable", "Checkout is temporarily unavailable. Please try again.");
      throw err;
    }
  },
);
