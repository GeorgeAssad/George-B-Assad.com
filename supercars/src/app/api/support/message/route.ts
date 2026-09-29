import { withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { getServices } from "@/server/services";
import { supportRequestSchema } from "@/lib/validation";

/** POST /api/support/message — asks the support agent (demo: rule-based over local data). */
export const POST = withApi(
  { route: "support.message", method: "POST", schema: supportRequestSchema, rateLimit: rateLimitPolicies.support, maxBodyBytes: 2 * 1024 },
  async ({ input }) => getServices().support.answerCustomer({ message: input.message }),
);
