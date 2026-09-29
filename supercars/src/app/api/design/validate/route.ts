import { withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { getServices } from "@/server/services";
import { printSpecFor } from "@/lib/print-spec";
import { validateArtworkRequestSchema } from "@/lib/validation";

/** POST /api/design/validate — checks resolution and aspect ratio against a size's print spec. */
export const POST = withApi(
  { route: "design.validate", method: "POST", schema: validateArtworkRequestSchema, rateLimit: rateLimitPolicies.designProcess, maxBodyBytes: 2 * 1024 },
  async ({ input }) => {
    const validation = await getServices().ai.validateArtwork({
      asset: { kind: "print_image", mimeType: "image/png", widthPx: input.widthPx, heightPx: input.heightPx },
      spec: printSpecFor(input.sizeId),
    });
    return { validation, demo: true };
  },
);
