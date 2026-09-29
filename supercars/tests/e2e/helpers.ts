import type { Page } from "@playwright/test";

const SHOTS = process.env.E2E_SHOTS;

/** Saves a screenshot when E2E_SHOTS=<dir> is set (visual review during development). */
export async function shot(page: Page, name: string, project: string) {
  if (!SHOTS) return;
  await page.waitForTimeout(1200); // let entrance animations and smooth scrolling settle
  await page.screenshot({ path: `${SHOTS}/${project}-${name}.png`, fullPage: false });
}

/** Fails the test if the page scrolls horizontally. */
export async function expectNoHorizontalScroll(page: Page) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  if (overflow > 0) throw new Error(`Horizontal overflow of ${overflow}px on ${page.url()}`);
}

/** Regression guard: fixed bars must sit inside the viewport (a transform on an ancestor once pushed them off-screen). */
export async function expectFixedBarsInViewport(page: Page) {
  const bad = await page.evaluate(() =>
    [...document.querySelectorAll<HTMLElement>("div.fixed")]
      .filter((el) => getComputedStyle(el).position === "fixed" && el.offsetParent !== undefined && el.getBoundingClientRect().height > 0)
      .map((el) => ({ cls: el.className.slice(0, 40), top: el.getBoundingClientRect().top, bottom: el.getBoundingClientRect().bottom, h: window.innerHeight }))
      .filter((r) => r.top >= r.h || r.bottom > r.h + 1),
  );
  if (bad.length) throw new Error(`Fixed element(s) outside the viewport: ${JSON.stringify(bad)}`);
}
