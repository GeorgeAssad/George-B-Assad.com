/* SECURITY HEADERS — single source of truth.
 * Consumed by next.config.ts (pages/API served by the Worker) and mirrored into
 * public/_headers (static assets served by Workers Assets). A unit test keeps the
 * two in sync. This file must stay dependency-free (it is imported by next.config).
 *
 * CSP notes (deliberate trade-offs, see ARCHITECTURE.md):
 *  - script-src 'unsafe-inline' is required because Next.js emits inline hydration
 *    scripts on statically cached pages, where per-request nonces are impossible.
 *    Mitigations: no third-party scripts, no HTML injection anywhere (audited),
 *    connect-src/form-action/base-uri locked to 'self', object-src 'none'.
 *    Upgrade path: nonce-based CSP once pages are rendered dynamically, or Next SRI.
 *  - style-src 'unsafe-inline' is required for React style props / SVG styling.
 *  - Development additionally needs 'unsafe-eval' and websockets for HMR.
 *  - upgrade-insecure-requests is intentionally omitted (breaks http://localhost);
 *    HSTS + Cloudflare "Always Use HTTPS" cover production.
 */

export interface HeaderRule { readonly key: string; readonly value: string }

export function contentSecurityPolicy(isDev: boolean): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : [])],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "blob:"],
    "font-src": ["'self'"],
    "connect-src": ["'self'", ...(isDev ? ["ws:", "wss:"] : [])],
    "media-src": ["'self'"],
    "manifest-src": ["'self'"],
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  return Object.entries(directives).map(([k, v]) => `${k} ${v.join(" ")}`).join("; ");
}

export function securityHeaders(isDev: boolean): HeaderRule[] {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy(isDev) },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), bluetooth=(), serial=(), interest-cohort=()" },
    // Browsers ignore HSTS over plain http, so it is safe to send everywhere (including localhost).
    { key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains" },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
    { key: "Cross-Origin-Resource-Policy", value: "same-origin" },
  ];
}

/** Renders the Workers Assets `_headers` file for the production policy. */
export function renderHeadersFile(): string {
  const lines = securityHeaders(false).map((h) => `  ${h.key}: ${h.value}`);
  return ["# GENERATED from src/config/security-headers.ts — run `npm run headers:write`. Do not edit by hand.", "/*", ...lines, ""].join("\n");
}
