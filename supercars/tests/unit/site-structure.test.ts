import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import sitemap from "@/app/sitemap";
import { hasOwnCreateCta } from "@/lib/layout-rules";
import { footerLinks, trackLink } from "@/config/nav";

/* The store is order-first: few pages, no duplicated navigation. These tests pin that structure. */

describe("redirects for removed pages", async () => {
  const rules = (await nextConfig.redirects?.()) ?? [];
  const to = (source: string) => rules.find((r) => r.source === source)?.destination;

  it("sends browsing pages into the designer", () => {
    expect(to("/shop")).toBe("/create");
    expect(to("/cars")).toBe("/create");
    expect(to("/products/:slug")).toBe("/create?product=:slug");
    expect(to("/products/:slug/customize")).toBe("/create?product=:slug");
  });

  it("folds info pages into home, shipping and checkout", () => {
    expect(to("/how-it-works")).toBe("/");
    expect(to("/about")).toBe("/");
    expect(to("/returns")).toBe("/shipping");
    expect(to("/cart")).toBe("/checkout");
  });

  it("are permanent and never redirect to themselves", () => {
    for (const r of rules) {
      expect(r.permanent).toBe(true);
      expect(r.destination.split("?")[0]).not.toBe(r.source);
    }
  });
});

describe("sitemap", () => {
  it("lists only pages that exist", async () => {
    const urls = (await sitemap()).map((e) => new URL(e.url).pathname);
    for (const gone of ["/shop", "/cars", "/how-it-works", "/about", "/returns", "/cart"]) expect(urls).not.toContain(gone);
    expect(urls.some((u) => u.startsWith("/products/"))).toBe(false);
    expect(urls).toEqual(expect.arrayContaining(["/", "/create", "/shipping", "/credits", "/cars/bmw-m3-g80"]));
  });
});

describe("one call to action per page", () => {
  it("the header offers Create only where a page has no start button of its own", () => {
    for (const own of ["/", "/create", "/checkout", "/cars/bmw-m3-g80", "/order/success/SC-123456"]) expect(hasOwnCreateCta(own), own).toBe(true);
    for (const bare of ["/track", "/shipping", "/privacy", "/terms", "/legal", "/credits"]) expect(hasOwnCreateCta(bare), bare).toBe(false);
  });

  it("navigation config has no duplicates and no dead links", () => {
    const all = [trackLink, ...footerLinks].map((l) => l.href);
    expect(new Set(all).size).toBe(all.length);
    for (const gone of ["/shop", "/cars", "/how-it-works", "/about", "/returns", "/cart"]) expect(all).not.toContain(gone);
  });
});
