import { ApiError, withApi } from "@/server/security/api-handler";
import { rateLimitPolicies } from "@/server/security/rate-limit";
import { getRepositories } from "@/server/repositories";
import { getServices } from "@/server/services";
import { designRequestSchema } from "@/lib/validation";

/**
 * POST /api/design/generate — browser → this endpoint → AI provider → result.
 * The most expensive endpoint, so it has the tightest rate limits. Provider keys
 * (none needed for the demo provider) only ever live server-side. Future: add
 * authentication and per-account quotas here before calling a paid model.
 */
export const POST = withApi(
  { route: "design.generate", method: "POST", schema: designRequestSchema, rateLimit: rateLimitPolicies.designGenerate, maxBodyBytes: 4 * 1024 },
  async ({ input }) => {
    const repos = getRepositories();
    const [car, template] = await Promise.all([repos.cars.getEntryBySlug(input.carSlug), repos.templates.getById(input.templateId)]);
    if (!car || !template) throw new ApiError(404, "design_unavailable", "That design isn't available.");
    return getServices().ai.generatePoster(input);
  },
);
