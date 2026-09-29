import { ApiError, withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { designRequestSchema } from "@/lib/validation";

/** POST /api/design/render — plans/produces every deliverable (web, social, print image, print PDF, master). */
export const POST = withApi(
  { route: "design.render", method: "POST", schema: designRequestSchema, rateLimit: rateLimitPolicies.designProcess, maxBodyBytes: 4 * 1024 },
  async ({ input }) => {
    const car = await getRepositories().cars.getEntryBySlug(input.carSlug);
    if (!car) throw new ApiError(404, "design_unavailable", "That design isn't available.");
    const assets = await getServices().ai.renderPrintAssets(input);
    return { assets, demo: true };
  },
);
