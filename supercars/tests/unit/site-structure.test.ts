import { describe, expect, it } from "vitest";
import nextConfig from "../../next.config";
import sitemap from "@/app/sitemap";
import { hasStickyBar, showsHeaderCreate } from "@/lib/layout-rules";
import { footerLinks, primaryNav } from "@/config/nav";

/* The store keeps every page but says everything once: navigation only in the header,
 * one generic "Create" button per page. These tests pin that structure. */

describe("redirects for old links", async () => {
  const rules = (await nextConfig.redirects?.()) ?? [];
  const to = (source: string) => rules.find((r) => r.source === source)?.destination;

  it("keeps real pages real (no redirect away from them)", () => {
    for (const page of ["/shop", "/cars", "/how-it-works", "/about"]) expect(to(page), page).toBeUndefined();
  });

  it("sends retired URLs somewhere useful", () => {
    expect(to("/products/:slug")).toBe("/shop");
    expect(to("/products/:slug/customize")).toBe("/create?product=:slug");
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
  it("lists every public page and no redirect", async () => {
    const urls = (await sitemap()).map((e) => new URL(e.url).pathname);
    expect(urls).toEqual(expect.arrayContaining(["/", "/cars", "/shop", "/how-it-works", "/about", "/create", "/shipping", "/credits", "/cars/bmw-m3-g80"]));
    for (const gone of ["/returns", "/cart"]) expect(urls).not.toContain(gone);
    expect(urls.some((u) => u.startsWith("/products/"))).toBe(false);
  });
});

describe("one place for navigation, one Create button", () => {
  it("the header offers Create everywhere except the designer, checkout and order confirmation", () => {
    for (const page of ["/", "/cars", "/cars/bmw-m3-g80", "/shop", "/how-it-works", "/about", "/track", "/shipping", "/privacy", "/credits"]) expect(showsHeaderCreate(page), page).toBe(true);
    for (const page of ["/create", "/checkout", "/order/success/SC-123456"]) expect(showsHeaderCreate(page), page).toBe(false);
  });

  it("only the designer and checkout render their own sticky bar", () => {
    expect(hasStickyBar("/create")).toBe(true);
    expect(hasStickyBar("/checkout")).toBe(true);
    expect(hasStickyBar("/")).toBe(false);
  });

  it("the header navigation and the footer never list the same page", () => {
    const nav = primaryNav.map((l) => l.href);
    const foot = footerLinks.map((l) => l.href);
    expect(new Set(nav).size).toBe(nav.length);
    expect(new Set(foot).size).toBe(foot.length);
    for (const href of foot) expect(nav).not.toContain(href);
    expect(nav).toEqual(["/cars", "/shop", "/how-it-works", "/about", "/track"]);
  });
});
