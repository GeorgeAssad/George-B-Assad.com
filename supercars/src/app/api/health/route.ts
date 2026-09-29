import { withApi } from "@/server/security/api-handler";

/** GET /api/health — liveness probe for deploy verification. Exposes no version, config or environment details. */
export const GET = withApi({ route: "health", method: "GET" }, async () => ({ ok: true }));
