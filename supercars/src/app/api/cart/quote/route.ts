import { quoteCart } from "@/server/checkout/pricing";
import { withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { quoteRequestSchema } from "@/lib/validation";
import type { CartItem } from "@/domain/cart";

/** Prices a cart from the catalog. Input carries references only; there is no price field to trust. */
export const POST = withApi(
  { route: "cart.quote", method: "POST", schema: quoteRequestSchema, rateLimit: rateLimitPolicies.quote },
  async ({ input }) => quoteCart(input.items as CartItem[]),
);
