import { withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { getServices } from "@/server/services";
import { printSpecFor } from "@/lib/print-spec";
import { validateArtworkRequestSchema } from "@/lib/validation";

/** POST /api/design/upscale — brings an artwork up to the exact print dimensions for a size. */
export const POST = withApi(
  { route: "design.upscale", method: "POST", schema: validateArtworkRequestSchema, rateLimit: rateLimitPolicies.designProcess, maxBodyBytes: 2 * 1024 },
  async ({ input }) => {
    const asset = await getServices().ai.upscaleArtwork({
      asset: { kind: "master_source", mimeType: "image/png", widthPx: input.widthPx, heightPx: input.heightPx },
      target: printSpecFor(input.sizeId),
    });
    return { asset, demo: true };
  },
);
