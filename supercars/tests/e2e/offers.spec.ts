import { expect } from "@playwright/test";
import { test } from "./helpers";

/* Offers, end to end. Runs only against a build made with a running test offer:
 *   NEXT_PUBLIC_PROMOTIONS='[{"id":"flash-15","kind":"percent-off","percent":15,"startsAt":"<1h ago>","endsAt":"<3h ahead>","label":"Flash sale"},
 *                            {"id":"free-ship-80","kind":"free-shipping","minSubtotal":80,"startsAt":"<1h ago>","endsAt":"<3 days ahead>"}]'
 *   npm run build && npm start, then E2E_OFFERS=1 npx playwright test tests/e2e/offers.spec.ts
 * Without offers the store shows no banner and normal prices, which the other specs cover. */

test.beforeEach(() => {
  test.skip(!process.env.E2E_OFFERS, "needs a build with a running test offer (E2E_OFFERS=1)");
});

test("the banner announces the offer with a live countdown, and catalog prices show it", async ({ page }) => {
  await page.goto("/shop");
  const bar = page.getByRole("region", { name: "Current offer" });
  await expect(bar).toContainText("Flash sale: 15% off every poster");
  await expect(bar).toContainText(/Ends in \d+:\d{2}:\d{2}/);
  await expect(bar).toContainText("Free shipping on orders over €80");
  const first = await bar.textContent();
  await page.waitForTimeout(1500);
  expect(await bar.textContent()).not.toBe(first); // the countdown ticks
  // €39 print → €33.15, the old price crossed out (and announced as "was").
  await expect(page.getByText("Was €39, now").first()).toBeAttached();
  await expect(page.getByText("€33.15").first()).toBeVisible();
});

test("the server applies the offer: discount, free-shipping progress, and the order total", async ({ page }) => {
  await page.goto("/create?car=bmw-m3-g80&style=racing&size=30x40");
  await page.getByLabel(/^Name/).fill("GEORGE");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Preview ready")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Add to cart" }).click();
  const cart = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(cart.getByText("Flash sale · 15% off")).toBeVisible();
  await expect(cart.getByText("−€5.85")).toBeVisible(); // 15% of €39
  await expect(cart.getByText(/Add €46\.85 more for free shipping/)).toBeVisible();

  // Upgrading to framed (€79 → €67.15 after the discount) gets closer; a second poster unlocks free shipping.
  await cart.getByRole("button", { name: /framed for €40 more/ }).click();
  await expect(cart.getByText(/Add €12\.85 more for free shipping/)).toBeVisible();
  await cart.getByRole("button", { name: /Increase quantity/ }).click();
  await expect(cart.getByText("Free shipping unlocked.")).toBeVisible();

  await cart.getByRole("link", { name: "Checkout" }).click();
  await page.getByLabel(/^Full name/).fill("George Assad");
  await page.getByLabel(/^Email/).fill("george@example.com");
  await page.getByLabel(/^Address/).fill("1 Demo Street");
  await page.getByLabel(/^City/).fill("Berlin");
  await page.getByLabel(/^Postal code/).fill("10115");
  await page.getByLabel(/^Country/).selectOption("DE");
  // 2 × €79 = €158, −15% = €134.30, free shipping.
  await expect(page.getByRole("button", { name: "Demo payment · €134.30" })).toBeVisible();
  await page.getByRole("button", { name: /Demo payment/ }).click();
  await expect(page.getByRole("heading", { name: "Order confirmed." })).toBeVisible({ timeout: 20_000 });
  await expect(page.getByText("Flash sale · 15% off")).toBeVisible();
  await expect(page.getByText(/Demo payment · €134\.30/)).toBeVisible();
});
