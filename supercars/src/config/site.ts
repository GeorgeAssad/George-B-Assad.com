/* PUBLIC SITE CONFIG — safe for the browser. Nothing secret lives here.
 * Company details are placeholders until real information is available. */

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Only accept http(s) origins; anything else falls back to localhost. */
function safeOrigin(value: string): string {
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:" ? url.origin : "http://localhost:3000";
  } catch {
    return "http://localhost:3000";
  }
}

/** The public origin ONLY when it was explicitly configured (never the localhost fallback). */
export const configuredSiteOrigin: string | null = process.env.NEXT_PUBLIC_SITE_URL ? safeOrigin(process.env.NEXT_PUBLIC_SITE_URL) : null;

export const siteConfig = {
  name: "SuperCars",
  tagline: "Turn your car into art.",
  description:
    "Premium personalized automotive artwork, made for your car. Pick your car, choose a style, add your name — we create and ship it.",
  url: safeOrigin(rawSiteUrl),
  appEnv: process.env.NEXT_PUBLIC_APP_ENV ?? "development",
  /** Placeholder contact — replace before launch. `.example` is a reserved, non-routable domain. */
  contactEmail: "hello@supercars.example",
  social: {
    instagram: "https://www.instagram.com/",
    tiktok: "https://www.tiktok.com/",
  },
} as const;

export const isPreviewOrDev = siteConfig.appEnv !== "production";

/** Search-engine indexing is OFF by default: this is a prototype with placeholder legal text.
 * Set NEXT_PUBLIC_ALLOW_INDEXING=true (build variable) only for the real launch. */
export const allowIndexing = process.env.NEXT_PUBLIC_ALLOW_INDEXING === "true";
