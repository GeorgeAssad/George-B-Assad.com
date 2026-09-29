import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { assetCacheRules, contentSecurityPolicy, renderHeadersFile, securityHeaders } from "@/config/security-headers";

describe("security headers", () => {
  it("public/_headers is in sync with the source of truth", () => {
    const file = readFileSync(new URL("../../public/_headers", import.meta.url), "utf8");
    expect(file).toBe(renderHeadersFile());
  });

  it("fingerprinted assets are cached immutably; HTML/API are not touched by asset rules", () => {
    const rule = assetCacheRules.find((r) => r.path === "/_next/static/*");
    expect(rule?.value).toMatch(/immutable/);
    expect(assetCacheRules.every((r) => r.path !== "/*" && !r.path.startsWith("/api"))).toBe(true);
  });

  it("production CSP is locked down", () => {
    const csp = contentSecurityPolicy(false);
    expect(csp).toContain("default-src 'self'");
    expect(csp).toContain("object-src 'none'");
    expect(csp).toContain("frame-ancestors 'none'");
    expect(csp).toContain("base-uri 'self'");
    expect(csp).toContain("form-action 'self'");
    expect(csp).toContain("connect-src 'self'");
    expect(csp).not.toContain("'unsafe-eval'");
    expect(csp).not.toMatch(/ws:|wss:|\*/);
    expect(csp).not.toMatch(/https?:\/\//); // no third-party origins allowed at all
  });

  it("only development gets eval and websockets", () => {
    const dev = contentSecurityPolicy(true);
    expect(dev).toContain("'unsafe-eval'");
    expect(dev).toContain("ws:");
  });

  it("includes the full set of protective headers", () => {
    const keys = securityHeaders(false).map((h) => h.key);
    for (const k of ["Content-Security-Policy", "X-Content-Type-Options", "X-Frame-Options", "Referrer-Policy", "Permissions-Policy", "Strict-Transport-Security", "Cross-Origin-Opener-Policy", "Cross-Origin-Resource-Policy"]) {
      expect(keys).toContain(k);
    }
    expect(securityHeaders(false).find((h) => h.key === "X-Content-Type-Options")?.value).toBe("nosniff");
  });
});
