import { toPublicOrderView } from "@/lib/public-order";
import { ApiError, withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { getRepositories } from "@/server/repositories";
import { lookupRequestSchema } from "@/lib/validation";

/**
 * POST /api/orders/lookup — public order tracking by order number.
 * Returns a privacy-preserving view (no name, email, phone or street address).
 * Unknown ids get one generic 404 and the endpoint is rate limited to make
 * enumeration impractical. Production should also require the order email.
 */
export const POST = withApi(
  { route: "orders.lookup", method: "POST", schema: lookupRequestSchema, rateLimit: rateLimitPolicies.lookup, maxBodyBytes: 1024 },
  async ({ input }) => {
    const order = await getRepositories().orders.get(input.orderId);
    if (!order) throw new ApiError(404, "order_not_found", "We couldn't find that order.");
    return { order: toPublicOrderView(order) };
  },
);
