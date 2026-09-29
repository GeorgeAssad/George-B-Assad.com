import { expect, type Page } from "@playwright/test";
import { test } from "./helpers";

/* The store is built to take an order, not to be browsed. These tests keep it that way:
 * one screen where it can be one screen, one button per job, no duplicate navigation. */

const SCREENS = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1440, height: 900 },
] as const;

async function settle(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1400); // entrance animations
}

const overflowY = (page: Page) => page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);

test.describe("no scrolling on the pages a customer lands on", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "mobile", "sets its own viewports");
  });
  for (const screen of SCREENS) {
    test(`${screen.name} ${screen.width}×${screen.height}`, async ({ page }) => {
      await page.setViewportSize({ width: screen.width, height: screen.height });
      const scrolling: string[] = [];
      for (const path of ["/", "/cars/porsche-911-gt3-rs-992", "/cars/toyota-gr-supra-a90", "/track"]) {
        await settle(page, path);
        const extra = await overflowY(page);
        if (extra > 1) scrolling.push(`${path}: +${extra}px`);
      }
      expect(scrolling, scrolling.join("\n")).toEqual([]);
    });
  }
});

test.describe("one button per job", () => {
  const PAGES = ["/", "/cars/bmw-m3-g80", "/cars/toyota-gr-supra-a90", "/create", "/create?car=bmw-m3-g80", "/track", "/shipping", "/privacy", "/terms", "/legal", "/credits", "/checkout"];

  test("at most one visible generic 'create your poster' control per page", async ({ page }) => {
    const offenders: string[] = [];
    for (const path of PAGES) {
      await settle(page, path);
      // Every visible link into the designer, except the 12 car tiles on the home page (12 different cars, one job).
      const generic = await page.locator("a[href^='/create']").evaluateAll((els) =>
        els
          .filter((el) => !el.closest("section[aria-labelledby='hero-title'] ul"))
          .filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; })
          .map((el) => el.textContent?.trim() ?? ""),
      );
      if (generic.length > 1) offenders.push(`${path}: ${generic.join(" | ")}`);
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  test("header is only: logo, Track order, cart (+ one Create button where a page has none)", async ({ page }, info) => {
    await settle(page, "/");
    const header = page.getByRole("banner");
    await expect(header.getByRole("link")).toHaveCount(2); // logo + track
    await expect(header.getByRole("button", { name: /Open cart/ })).toBeVisible();
    await expect(header.getByRole("link", { name: /Create/ })).toHaveCount(0); // the tiles are the way in
    await settle(page, "/legal");
    await expect(page.getByRole("banner").getByRole("link", { name: /Create/ })).toHaveCount(1);
    // No mobile tab bar and no floating chat button; the one chat link lives in the footer.
    await expect(page.getByRole("navigation", { name: "Quick navigation" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open support chat" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("button", { name: "Chat with us" })).toBeVisible();
    void info;
  });
});

test("removed pages redirect to where the job now happens", async ({ page }) => {
  const expected: [string, RegExp][] = [
    ["/shop", /\/create$/],
    ["/cars", /\/create$/],
    ["/products/framed-car-poster", /\/create\?product=framed-car-poster$/],
    ["/products/framed-car-poster/customize", /\/create\?product=framed-car-poster$/],
    ["/how-it-works", /\/$/],
    ["/about", /\/$/],
    ["/returns", /\/shipping$/],
    ["/cart", /\/checkout$/],
  ];
  for (const [from, to] of expected) {
    await page.goto(from);
    await expect(page, from).toHaveURL(to);
  }
  await page.goto("/create?product=framed-car-poster");
  await expect(page.getByRole("heading", { name: "Choose your car." })).toBeVisible();
});

test("an order takes a handful of taps from the home page", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("link", { name: /BMW M3 G80/ }).click(); // 1 — the car tile
  await expect(page.getByRole("heading", { name: "Design your poster." })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click(); // 2 — defaults are pre-selected
  await page.getByLabel(/^Name/).fill("GEORGE");
  await page.getByRole("button", { name: "Continue" }).click(); // 3 — name
  await expect(page.getByText("Preview ready")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Add to cart" }).click(); // 4 — the preview builds itself
  await page.getByRole("dialog").getByRole("link", { name: "Checkout" }).click(); // 5
  await expect(page).toHaveURL(/\/checkout$/);
});
