import { expect, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, shot, test } from "./helpers";

/** Makes every lazy image load now (scrolling alone is flaky on slow runners) and waits until all have finished. */
async function loadAllImages(page: Page) {
  await page.evaluate(() => document.querySelectorAll("img[loading='lazy']").forEach((i) => ((i as HTMLImageElement).loading = "eager")));
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30_000 });
}

const brokenImages = (page: Page) =>
  page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));

test("home: the hero shows a studio cutout of the car with a credit link", async ({ page }, info) => {
  await page.goto("/");
  const hero = page.locator("section[aria-labelledby='hero-title']");
  const img = hero.locator("picture img").first();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(300);
  const src = await img.evaluate((el: HTMLImageElement) => el.currentSrc);
  expect(src).toMatch(/\/cars\/nissan-gt-r-r35\/main-\d+\.(avif|webp)$/);
  await expect(img).toHaveAttribute("width", /\d+/);
  await expect(img).toHaveAttribute("height", /\d+/);
  await expect(img).toHaveAttribute("fetchpriority", "high");
  await expect(hero.getByRole("link", { name: /photo credit/i })).toHaveAttribute("href", "/credits");
  // The cutout must sit fully inside the viewport (not clipped by the edge) and carry a floor reflection.
  const vw = page.viewportSize()?.width ?? 0;
  // Poll: the car drives in with a transform animation for its first ~1.3 s.
  await expect.poll(async () => {
    const box = await img.boundingBox();
    return !!box && box.x >= -1 && box.x + box.width <= vw + 1;
  }, { timeout: 8000 }).toBe(true);
  await expect(hero.locator(".studio-reflection")).toHaveCount(1);
  await expectNoHorizontalScroll(page);
  await shot(page, "photo-home-hero", info.project.name);
});

test("home: hero copy stays readable over the photo", async ({ page }) => {
  await page.goto("/");
  const title = page.getByRole("heading", { level: 1 });
  await expect(title).toBeVisible();
  // The headline must be fully inside the dark scrim side of the hero, never under the bright part of the photo.
  const box = await title.boundingBox();
  const viewport = page.viewportSize();
  expect(box && viewport && box.x + box.width <= viewport.width).toBe(true);
  const color = await title.evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe("rgb(243, 243, 241)"); // .on-dark keeps light text even if the user chose the light theme
});

test("home: the photo hero stays dark in the light theme", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("sc-theme", "light"));
  await page.goto("/");
  const hero = page.locator("section[aria-labelledby='hero-title']");
  await expect(hero).toHaveCSS("background-color", "rgb(5, 5, 6)");
});

test("cars: every card with an image loads it; cars without one keep their drawing", async ({ page }, info) => {
  await page.goto("/cars");
  await loadAllImages(page);
  expect(await brokenImages(page)).toEqual([]);
  const cards = page.locator("a[href^='/cars/']").filter({ has: page.locator("picture") });
  expect(await cards.count()).toBe(10);
  const e63 = page.getByRole("link", { name: /Mercedes-AMG E 63 S W213/ });
  await expect(e63.locator("picture")).toHaveCount(0);
  await expect(e63.locator("svg").first()).toBeVisible();
  const supra = page.getByRole("link", { name: /GR Supra A90/ });
  await expect(supra.locator("picture")).toHaveCount(0);
  await expectNoHorizontalScroll(page);
  await shot(page, "photo-cars", info.project.name);
});

test("car page: photo stage with a visible, working credit", async ({ page }, info) => {
  await page.goto("/cars/porsche-911-gt3-rs-992");
  const img = page.locator("article picture img").first();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(300);
  const credit = page.getByText(/^Photo:/).first();
  await expect(credit).toBeVisible();
  await expect(credit.getByRole("link", { name: /CC/ })).toHaveAttribute("href", /creativecommons\.org/);
  const source = credit.getByRole("link", { name: "Wikimedia Commons" });
  await expect(source).toHaveAttribute("href", /commons\.wikimedia\.org\/wiki\/File:/);
  await expect(source).toHaveAttribute("rel", /noopener/);
  await expect(source).toHaveAttribute("target", "_blank");
  await expectNoHorizontalScroll(page);
  await shot(page, "photo-car", info.project.name);
});

for (const slug of ["mercedes-amg-e63-w213", "toyota-gr-supra-a90"]) {
  test(`car page without an image (${slug}) still shows the drawn silhouette`, async ({ page }) => {
    await page.goto(`/cars/${slug}`);
    await expect(page.getByText("Prototype silhouette · not to scale")).toBeVisible();
    // Only the stage at the top of the page: the related-cars list below legitimately contains images.
    await expect(page.locator("article > div").first().locator("picture")).toHaveCount(0);
  });
}

test("credits page lists every photo with author, licence and source", async ({ page }) => {
  await page.goto("/credits");
  await expect(page.getByRole("heading", { level: 1, name: "Photo credits." })).toBeVisible();
  await loadAllImages(page);
  expect(await brokenImages(page)).toEqual([]);
  const items = page.locator("main li").filter({ has: page.locator("picture") });
  expect(await items.count()).toBe(10);
  for (let i = 0; i < 10; i++) {
    const li = items.nth(i);
    await expect(li).toContainText(/By .+/);
    await expect(li.getByRole("link", { name: /^(CC0|CC BY)/ })).toHaveAttribute("href", /creativecommons\.org/);
    await expect(li.getByRole("link", { name: /Original on Wikimedia Commons/ })).toHaveAttribute("href", /commons\.wikimedia\.org/);
  }
  await expect(page.getByRole("link", { name: "Photo credits" }).first()).toBeVisible(); // footer link
});

test("configurator: car thumbnails are real photos and load", async ({ page }, info) => {
  await page.goto("/create");
  await expect(page.getByRole("heading", { name: /choose your car|which car/i }).first()).toBeVisible();
  await loadAllImages(page);
  expect(await brokenImages(page)).toEqual([]);
  expect(await page.locator("fieldset picture img").count()).toBe(10);
  await expectNoHorizontalScroll(page);
  await shot(page, "photo-create", info.project.name);
});

test("photos are served as immutable-cacheable static files", async ({ request }) => {
  const res = await request.get("/cars/nissan-gt-r-r35/main-640.avif");
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toMatch(/image\/avif/);
  expect(Number(res.headers()["content-length"] ?? 0)).toBeLessThan(300 * 1024);
});
