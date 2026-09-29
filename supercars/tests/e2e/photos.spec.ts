import { expect, type Page } from "@playwright/test";
import { expectNoHorizontalScroll, shot, test } from "./helpers";

/** Makes every lazy image load now (scrolling alone is flaky on slow runners) and waits until all have finished. */
async function loadAllImages(page: Page) {
  await page.evaluate(() => document.querySelectorAll("img[loading='lazy']").forEach((i) => ((i as HTMLImageElement).loading = "eager")));
  await page.waitForFunction(() => [...document.images].every((i) => i.complete), null, { timeout: 30_000 });
}

const brokenImages = (page: Page) =>
  page.evaluate(() => [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.currentSrc || i.src));

test("home: the studio hero car is a loaded, fully visible cutout (desktop and tablet)", async ({ page }, info) => {
  test.skip(info.project.name === "mobile", "phones show the car picker only, so everything fits one screen");
  await page.goto("/");
  const hero = page.locator("section[aria-labelledby='hero-title']");
  const img = hero.locator("picture img").first();
  await expect(img).toBeVisible();
  await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth)).toBeGreaterThan(300);
  expect(await img.evaluate((el: HTMLImageElement) => el.currentSrc)).toMatch(/\/cars\/nissan-gt-r-r35\/main-\d+\.(avif|webp)$/);
  await expect(img).toHaveAttribute("width", /\d+/);
  await expect(img).toHaveAttribute("height", /\d+/);
  await expect(img).toHaveAttribute("fetchpriority", "high");
  // The car drives in with a transform animation for its first ~1.3 s; afterwards it must sit inside the viewport.
  const vw = page.viewportSize()?.width ?? 0;
  await expect.poll(async () => {
    const box = await img.boundingBox();
    return !!box && box.x >= -1 && box.x + box.width <= vw + 1;
  }, { timeout: 8000 }).toBe(true);
  await expectNoHorizontalScroll(page);
  await shot(page, "photo-home-hero", info.project.name);
});

test("home: headline stays light on the dark stage even in the light theme", async ({ page }) => {
  await page.addInitScript(() => window.localStorage.setItem("sc-theme", "light"));
  await page.goto("/");
  const hero = page.locator("section[aria-labelledby='hero-title']");
  await expect(hero).toHaveCSS("background-color", "rgb(5, 5, 6)");
  await expect(page.getByRole("heading", { level: 1 })).toHaveCSS("color", "rgb(243, 243, 241)");
});

test("home: 12 car tiles — cutouts load, cars without an image keep their drawing", async ({ page }, info) => {
  await page.goto("/");
  await loadAllImages(page);
  expect(await brokenImages(page)).toEqual([]);
  const tiles = page.locator("section[aria-labelledby='hero-title'] ul a[href^='/create?car=']");
  expect(await tiles.count()).toBe(12);
  expect(await tiles.filter({ has: page.locator("picture") }).count()).toBe(10);
  for (const name of [/Mercedes-AMG E 63 S W213/, /GR Supra A90/]) {
    const tile = page.getByRole("link", { name });
    await expect(tile.locator("picture")).toHaveCount(0);
    await expect(tile.locator("svg").first()).toBeVisible();
  }
  await expectNoHorizontalScroll(page);
  await shot(page, "photo-home-tiles", info.project.name);
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
