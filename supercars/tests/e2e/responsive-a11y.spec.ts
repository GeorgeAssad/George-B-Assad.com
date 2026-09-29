import AxeBuilder from "@axe-core/playwright";
import { expect } from "@playwright/test";
import { test } from "./helpers";

const PAGES = ["/", "/cars", "/cars/bmw-m3-g80", "/cars/porsche-911-gt3-rs-992", "/cars/mercedes-amg-e63-w213", "/credits", "/shop", "/products/custom-car-poster", "/create", "/cart", "/checkout", "/track", "/how-it-works", "/about", "/privacy", "/shipping"];
const WIDTHS = [320, 375, 390, 430, 768, 1024, 1280, 1920];

test.describe("responsive layout (no horizontal scrolling at any width)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "mobile", "the matrix sets its own viewports");
  });

  for (const width of WIDTHS) {
    test(`${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: width < 700 ? 800 : 900 });
      const offenders: string[] = [];
      for (const path of PAGES) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          const wide = [...document.querySelectorAll<HTMLElement>("body *")]
            .filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== "fixed")
            .filter((el) => !el.closest("[class*='overflow-x-auto'], [class*='overflow-hidden'], svg, dialog"))
            .slice(0, 3)
            .map((el) => `${el.tagName.toLowerCase()}.${String(el.className).slice(0, 50)}`);
          return { extra: doc.scrollWidth - window.innerWidth, wide };
        });
        if (overflow.extra > 0) offenders.push(`${path}: +${overflow.extra}px (${overflow.wide.join(" | ")})`);
      }
      expect(offenders, offenders.join("\n")).toEqual([]);
    });
  }
});

test.describe("accessibility (axe: WCAG 2.1 A/AA)", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "mobile", "scanned once at desktop width");
  });
  const A11Y_PAGES = ["/", "/cars", "/cars/bmw-m3-g80", "/cars/nissan-gt-r-r35", "/cars/mercedes-amg-e63-w213", "/credits", "/create", "/shop", "/products/framed-car-poster", "/cart", "/checkout", "/track", "/how-it-works", "/about", "/legal"];

  for (const theme of ["dark", "light"] as const) {
    test(`no serious or critical violations — ${theme} theme`, async ({ page }) => {
      await page.addInitScript((t) => window.localStorage.setItem("sc-theme", t), theme);
      const failures: string[] = [];
      for (const path of A11Y_PAGES) {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        // Reveal everything so off-screen content is evaluated too.
        await page.evaluate(() => document.querySelectorAll(".reveal").forEach((el) => el.setAttribute("data-inview", "")));
        await page.waitForTimeout(900);
        const results = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
        for (const v of results.violations.filter((x) => x.impact === "serious" || x.impact === "critical")) {
          failures.push(`${path} [${v.impact}] ${v.id}: ${v.help} — ${v.nodes.length} node(s), e.g. ${v.nodes[0]?.html.slice(0, 110)}`);
        }
      }
      expect(failures, failures.join("\n")).toEqual([]);
    });
  }
});

test.describe("keyboard, focus and motion", () => {
  test("skip link is first, reveals on focus, and moves focus to main", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skip = page.getByRole("link", { name: "Skip to content" });
    await expect(skip).toBeFocused();
    await expect(skip).toBeInViewport();
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/#main$/);
  });

  test("interactive elements show a visible focus ring", async ({ page }) => {
    await page.goto("/cars");
    await page.getByRole("link", { name: "Shop", exact: true }).first().focus();
    await page.keyboard.press("Tab");
    const outline = await page.evaluate(() => {
      const el = document.activeElement as HTMLElement;
      const cs = getComputedStyle(el);
      return { style: cs.outlineStyle, width: parseFloat(cs.outlineWidth) };
    });
    expect(outline.style).not.toBe("none");
    expect(outline.width).toBeGreaterThanOrEqual(2);
  });

  test("dialogs trap focus, close on Escape and restore focus", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle"); // wait for hydration before using the keyboard
    const cart = page.getByRole("button", { name: "Open cart" }).first();
    await cart.focus();
    await page.keyboard.press("Enter");
    const dialog = page.getByRole("dialog", { name: "Shopping cart" });
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 6; i++) await page.keyboard.press("Tab");
    expect(await page.evaluate(() => !!document.activeElement?.closest("dialog"))).toBe(true);
    await page.keyboard.press("Escape");
    await expect(dialog).toBeHidden();
    await expect(cart).toBeFocused();
  });

  test("reduced motion: content is visible immediately and nothing animates", async ({ browser }, info) => {
    const ctx = await browser.newContext({ reducedMotion: "reduce", viewport: { width: 1280, height: 900 } });
    const page = await ctx.newPage();
    await page.goto(new URL("/", info.project.use.baseURL ?? "http://localhost:3111").toString());
    await page.waitForLoadState("networkidle");
    const state = await page.evaluate(() => {
      const hidden = [...document.querySelectorAll<HTMLElement>(".reveal:not([data-inview])")].filter((el) => getComputedStyle(el).opacity !== "1").length;
      const h1 = getComputedStyle(document.querySelector("h1")!);
      return { hidden, dur: parseFloat(h1.animationDuration) };
    });
    expect(state.hidden).toBe(0);
    expect(state.dur).toBeLessThan(0.01);
    await ctx.close();
  });
});
