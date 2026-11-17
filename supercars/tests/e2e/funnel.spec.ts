import { expect, type Page } from "@playwright/test";
import { test } from "./helpers";

/* Every page exists, but the store says everything once: navigation only in the header, one generic
 * "Create your poster" button per page (in the hero on Home, in the header elsewhere), short pages.
 * These tests keep it that way. */

const SCREENS = [
  { name: "phone", width: 390, height: 844 },
  { name: "tablet", width: 768, height: 1024 },
  { name: "laptop", width: 1440, height: 900 },
] as const;

const NAV_HREFS = ["/cars", "/shop", "/how-it-works", "/about", "/track"] as const;

const PAGES = [
  "/", "/cars", "/cars/bmw-m3-g80", "/cars/toyota-gr-supra-a90", "/shop", "/how-it-works", "/about", "/track",
  "/shipping", "/privacy", "/terms", "/legal", "/credits", "/create", "/create?car=bmw-m3-g80", "/checkout",
];

async function settle(page: Page, path: string) {
  await page.goto(path);
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(1400); // entrance animations
}

const visible = (page: Page, selector: string) =>
  page.locator(selector).evaluateAll((els) =>
    els.filter((el) => { const r = el.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(el).visibility !== "hidden"; }).length,
  );

/* Screens of content (page height ÷ viewport height), measured on the current design plus a small margin.
 * The owner chose longer selling pages for Home, car pages and the Shop (benefits, styles, gift, sizes, example
 * reviews, questions); every section leads to an order. The rest stay short. A budget catches a page that grows
 * by accident. */
const LENGTH_BUDGETS: Record<(typeof SCREENS)[number]["name"], [string, number][]> = {
  phone: [["/", 6.6], ["/cars", 2.9], ["/cars/porsche-911-gt3-rs-992", 4.4], ["/shop", 4.6], ["/how-it-works", 2.6], ["/about", 1.6], ["/track", 1.01]],
  tablet: [["/", 5.6], ["/cars", 2.0], ["/cars/porsche-911-gt3-rs-992", 3.5], ["/shop", 3.2], ["/how-it-works", 2.0], ["/about", 1.1], ["/track", 1.01]],
  laptop: [["/", 5.0], ["/cars", 2.1], ["/cars/porsche-911-gt3-rs-992", 3.7], ["/shop", 3.6], ["/how-it-works", 2.0], ["/about", 1.15], ["/track", 1.01]],
};

test.describe("every page is short, and the way into an order is on the first screen", () => {
  test.beforeEach(({}, info) => {
    test.skip(info.project.name === "mobile", "sets its own viewports");
  });

  for (const screen of SCREENS) {
    test(`length budget, ${screen.name} ${screen.width}×${screen.height}`, async ({ page }) => {
      await page.setViewportSize({ width: screen.width, height: screen.height });
      const over: string[] = [];
      for (const [path, max] of LENGTH_BUDGETS[screen.name]) {
        await settle(page, path);
        const screens = await page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
        if (screens > max) over.push(`${path}: ${screens.toFixed(2)} screens (max ${max})`);
      }
      expect(over, over.join("\n")).toEqual([]);
    });

    test(`the first screen holds the way in, ${screen.name}`, async ({ page }) => {
      await page.setViewportSize({ width: screen.width, height: screen.height });
      // Home: the headline, the one Create button and the product stage (car + framed poster) all fit the first screen.
      await settle(page, "/");
      const hero = page.locator("section[aria-labelledby='hero-title']");
      const create = hero.getByRole("link", { name: "Create your poster" });
      await expect(create).toHaveCount(1);
      const createBottom = await create.evaluate((el) => el.getBoundingClientRect().bottom);
      expect(createBottom, "Create your poster bottom edge").toBeLessThanOrEqual(screen.height);
      const stage = await hero.locator(".stage").evaluate((el) => { const r = el.getBoundingClientRect(); return { top: r.top, bottom: r.bottom }; });
      expect(stage.top, "product stage top edge").toBeGreaterThanOrEqual(0);
      expect(stage.bottom, "product stage bottom edge").toBeLessThanOrEqual(screen.height);
      // Every car is one tap away in the picker right below it.
      await expect(page.locator("section[aria-labelledby='cars-title'] ul a[href^='/create?car=']")).toHaveCount(12);
      // A car page: the button that starts the order is on the first screen.
      for (const slug of ["porsche-911-gt3-rs-992", "toyota-gr-supra-a90"]) {
        await settle(page, `/cars/${slug}`);
        const box = await page.getByRole("link", { name: /Create this car/ }).boundingBox();
        expect(box?.y ?? Infinity, `${slug}: Create this car`).toBeLessThan(screen.height - (box?.height ?? 0) + 1);
      }
    });
  }
});

test.describe("one place for navigation, one Create button", () => {
  test("no page repeats the header's links or carries a second generic Create button", async ({ page }) => {
    const offenders: string[] = [];
    for (const path of PAGES) {
      await settle(page, path);
      // Generic Create = the bare /create link. Exactly one per page (none in the designer, which is the start itself).
      // Home shows it in the hero, so its header has none; every other page has it in the header.
      // Checkout has no header button, so an empty cart offers its one there.
      const inHeader = await visible(page, "header a[href='/create']");
      const inBody = await visible(page, "main a[href='/create'], footer a[href='/create']");
      const want = path.startsWith("/create") ? 0 : 1;
      if (inHeader + inBody !== want) offenders.push(`${path}: ${inHeader} in the header + ${inBody} in the page, expected ${want} in total`);
      const bodyAllowed = path === "/" || path.startsWith("/checkout");
      if (inBody && !bodyAllowed) offenders.push(`${path}: ${inBody} bare /create link(s) outside the header`);
      if (path === "/" && inHeader) offenders.push(`/: the header repeats the hero's Create button`);
      // Contextual starts must say what they start (car, style or product in the URL).
      const vague = await page.locator("main a[href^='/create?']").evaluateAll((els) => els.filter((el) => !/[?&](car|product|style)=/.test(el.getAttribute("href") ?? "")).map((el) => el.getAttribute("href")));
      if (vague.length) offenders.push(`${path}: contextual links without car/product/style: ${vague.join(", ")}`);
      // The header's own pages are never linked again in the page body or footer (a breadcrumb trail is the one exception).
      for (const href of NAV_HREFS) {
        const repeated = await page.locator(`main a[href='${href}']:not(nav[aria-label='Breadcrumb'] a), footer a[href='${href}']`).count();
        if (repeated) offenders.push(`${path}: ${repeated} repeat(s) of ${href} outside the header`);
      }
    }
    expect(offenders, offenders.join("\n")).toEqual([]);
  });

  test("the header carries the five pages, on a laptop as links and on a phone in one menu", async ({ page }, info) => {
    await settle(page, "/shop");
    const header = page.getByRole("banner");
    if (info.project.name === "mobile") {
      await expect(header.getByRole("navigation", { name: "Primary" })).toBeHidden();
      await header.getByRole("button", { name: "Open menu" }).click();
      const menu = page.getByRole("dialog", { name: "Menu" });
      for (const name of ["Cars", "Shop", "How it works", "About", "Track order"]) await expect(menu.getByRole("link", { name })).toBeVisible();
      await expect(menu.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
      await menu.getByRole("link", { name: "About" }).click();
      await expect(page).toHaveURL(/\/about$/);
      await expect(page.getByRole("dialog", { name: "Menu" })).toHaveCount(0); // navigating closes it
    } else {
      const nav = header.getByRole("navigation", { name: "Primary" });
      for (const name of ["Cars", "Shop", "How it works", "About", "Track order"]) await expect(nav.getByRole("link", { name })).toBeVisible();
      await expect(nav.getByRole("link", { name: "Shop" })).toHaveAttribute("aria-current", "page");
    }
    await expect(header.getByRole("button", { name: /Open cart/ })).toBeVisible();
    // No mobile tab bar and no floating chat button; the one chat link lives in the footer.
    await expect(page.getByRole("navigation", { name: "Quick navigation" })).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Open support chat" })).toHaveCount(0);
    await expect(page.getByRole("contentinfo").getByRole("button", { name: "Chat with us" })).toBeVisible();
  });

  test("the footer is legal text only", async ({ page }) => {
    await settle(page, "/");
    const hrefs = await page.getByRole("contentinfo").getByRole("link").evaluateAll((els) => els.map((el) => el.getAttribute("href") ?? "").filter((h) => h.startsWith("/")));
    expect(hrefs.sort()).toEqual(["/credits", "/legal", "/privacy", "/shipping", "/terms"]);
  });
});

test("every page answers, and old links land somewhere useful", async ({ page }) => {
  for (const path of ["/", "/cars", "/shop", "/how-it-works", "/about", "/track", "/shipping", "/credits"]) {
    const res = await page.goto(path);
    expect(res?.status(), path).toBe(200);
    await expect(page.getByRole("heading", { level: 1 }), path).toBeVisible();
  }
  const expected: [string, RegExp][] = [
    ["/products/framed-car-poster", /\/shop$/],
    ["/products/framed-car-poster/customize", /\/create\?product=framed-car-poster$/],
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

test("the Shop starts the right product", async ({ page }) => {
  await page.goto("/shop");
  await page.getByRole("link", { name: /Design a framed poster/ }).click();
  await expect(page).toHaveURL(/\/create\?product=framed-car-poster/);
  await expect(page.getByRole("heading", { name: "Choose your car." })).toBeVisible();
});

test("a style on a car page opens the designer with car and style chosen", async ({ page }) => {
  await page.goto("/cars/bmw-m3-g80");
  await page.getByRole("link", { name: "Blueprint style. Design this poster" }).click();
  await expect(page).toHaveURL(/\/create\?car=bmw-m3-g80&style=blueprint&size=40x60/);
  await expect(page.getByRole("heading", { name: "Make it yours." })).toBeVisible();
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

test("on Home the header's Create button appears only once the hero's has scrolled away", async ({ page }) => {
  await settle(page, "/");
  const header = page.getByRole("banner");
  const hero = page.locator("section[aria-labelledby='hero-title']").getByRole("link", { name: "Create your poster" });
  await expect(header.getByRole("link", { name: "Create your poster" })).toHaveCount(0);
  await expect(hero).toBeInViewport();
  await page.locator("#cars-title").scrollIntoViewIfNeeded();
  await page.mouse.wheel(0, 600);
  await expect(header.getByRole("link", { name: "Create your poster" })).toBeVisible();
  await expect(hero).not.toBeInViewport();
});

test("a car page sells: breadcrumb, price, delivery estimate, sizes, examples, questions, similar cars", async ({ page }, info) => {
  await settle(page, "/cars/bmw-m3-g80");
  await expect(page.getByRole("navigation", { name: "Breadcrumb" }).getByRole("link", { name: "BMW" })).toHaveAttribute("href", "/cars?brand=bmw");
  await expect(page.getByText(/^Order today, arrives around /)).toBeVisible();
  await expect(page.getByRole("table", { name: "Sizes and prices" })).toContainText("€139");
  await expect(page.getByText("Example reviews")).toBeVisible();
  await expect(page.getByRole("heading", { name: "More cars like this." })).toBeVisible();
  // On a phone the start button follows you once the page's own has scrolled away (never two on screen).
  if (info.project.name === "mobile") {
    const create = page.getByRole("link", { name: /^Create this car/ });
    await expect(create).toHaveCount(1);
    await page.getByRole("heading", { name: "Sizes and prices." }).scrollIntoViewIfNeeded();
    await expect(create).toHaveCount(2);
    await expect(create.nth(0)).not.toBeInViewport();
    await expect(create.nth(1)).toBeInViewport();
  }
});
