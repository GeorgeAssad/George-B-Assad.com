import { z } from "zod";

/* SERVER-ONLY ENVIRONMENT. Never import this file from a client component.
 * Only public build-time variables (see config/site.ts) reach the browser, and none of them are
 * secrets. Secrets (payment, AI, fulfilment, email, database) will be read here
 * from Cloudflare secrets — see INTEGRATIONS.md. The prototype runs with NONE
 * of them set. */

const serverEnvSchema = z.object({
  APP_ENV: z.enum(["development", "preview", "production"]).default("development"),
  /** Provider selectors. Only "mock" exists today; real values fail closed. */
  PAYMENT_PROVIDER: z.enum(["mock", "stripe"]).default("mock"),
  AI_PROVIDER: z.enum(["mock", "openai"]).default("mock"),
  FULFILLMENT_PROVIDER: z.enum(["mock", "prodigi", "gelato"]).default("mock"),
  SUPPORT_PROVIDER: z.enum(["mock", "ai-agent"]).default("mock"),
  /** Signs stateless demo checkout sessions. Optional for the prototype. */
  CHECKOUT_SIGNING_SECRET: z.string().min(32).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

let cached: ServerEnv | undefined;

export function getServerEnv(source: Record<string, string | undefined> = process.env): ServerEnv {
  if (source === process.env && cached) return cached;
  const parsed = serverEnvSchema.safeParse(source);
  if (!parsed.success) {
    // Names only — never echo values, which may be secrets.
    const bad = parsed.error.issues.map((i) => i.path.join(".")).join(", ");
    throw new Error(`Invalid server environment configuration: ${bad}`);
  }
  if (source === process.env) cached = parsed.data;
  return parsed.data;
}

export const isProduction = (env: ServerEnv = getServerEnv()): boolean => env.APP_ENV === "production";
