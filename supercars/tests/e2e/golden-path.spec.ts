import { expect, type Page } from "@playwright/test";
import { expectFixedBarsInViewport, expectNoHorizontalScroll, shot, test } from "./helpers";

async function addPosterToCart(page: Page, name = "GEORGE") {
  await page.goto("/create?car=bmw-m3-g80&style=racing&size=50x70");
  await expect(page.getByRole("heading", { name: "Make it yours." })).toBeVisible();
  await page.getByLabel(/^Name/).fill(name);
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Preview ready")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).toBeVisible();
}

test("golden path: cart → checkout → demo payment → confirmation → tracking", async ({ page }, info) => {
  const p = info.project.name;
  await addPosterToCart(page);

  // Cart drawer → checkout
  await page.getByRole("dialog").getByRole("link", { name: "Checkout" }).click();
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("heading", { name: "Checkout." })).toBeVisible();
  await expect(page.getByText("Secure checkout")).toBeVisible();
  await expect(page.getByText(/No card details are collected/)).toBeVisible();
  // There must be no card fields anywhere.
  await expect(page.locator('input[autocomplete^="cc-"], input[name*="card" i], input[name*="cvc" i]')).toHaveCount(0);
  await expectNoHorizontalScroll(page);
  await shot(page, "co-1-form", p);

  // Invalid submit shows an accessible error summary
  await page.getByRole("button", { name: /Demo payment/ }).click();
  const summary = page.getByRole("alert").filter({ hasText: /Please fix/ });
  await expect(summary).toBeVisible();
  await expect(summary).toBeFocused();
  await page.getByLabel(/^Email/).fill("not-an-email");
  await page.getByRole("button", { name: /Demo payment/ }).click();
  await expect(page.locator("#co-email-err")).toHaveText(/valid email/i);
  await expect(page.getByLabel(/^Email/)).toHaveAttribute("aria-invalid", "true");
  await shot(page, "co-2-errors", p);

  // Valid
  await page.getByLabel(/^Full name/).fill("George Assad");
  await page.getByLabel(/^Email/).fill("george@example.com");
  await page.getByLabel(/^Address/).fill("1 Demo Street");
  await page.getByLabel(/^City/).fill("Berlin");
  await page.getByLabel(/^Postal code/).fill("10115");
  await page.getByLabel(/^Country/).selectOption("DE");
  await expectFixedBarsInViewport(page);
  await page.getByRole("button", { name: /Demo payment/ }).click();

  // Confirmation
  await expect(page.getByRole("heading", { name: "Order confirmed." })).toBeVisible({ timeout: 20_000 });
  await expect(page).toHaveURL(/\/order\/success\/SC-[A-Z0-9]{6}$/);
  const orderId = page.url().split("/").pop()!;
  await expect(page.getByText(/no payment taken/i)).toBeVisible();
  await expect(page.getByRole("heading", { name: "Order progress" })).toBeVisible();
  await expect(page.getByText("1 Demo Street")).toBeVisible();
  await expect(page.getByText(/Demo payment · €86\.90/)).toBeVisible();
  await expect(page.getByRole("list", { name: "Order progress" })).toContainText("Design");
  await shot(page, "co-3-success", p);
  await expectNoHorizontalScroll(page);

  // Client-side navigation to tracking (Link, not a full load) must carry the order param.
  await page.getByRole("main").getByRole("link", { name: /Track order/ }).click();
  await expect(page).toHaveURL(new RegExp(`/track\\?order=${orderId}`));
  await expect(page.getByRole("article", { name: `Order ${orderId}` })).toBeVisible();

  // The cart was emptied
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Nothing to check out." })).toBeVisible();

  // Tracking by number (no account)
  await page.goto("/track");
  await page.getByLabel("Order number").fill(orderId.toLowerCase());
  await page.getByRole("button", { name: "Track order" }).click();
  await expect(page.getByRole("article", { name: `Order ${orderId}` })).toBeVisible();
  await expect(page.getByText("Berlin, DE")).toBeVisible();
  await expect(page.getByText("george@example.com")).toHaveCount(0); // privacy: no contact details on public lookup
  await shot(page, "co-4-track", p);
});

test("track: seeded demo orders, unknown orders and invalid input", async ({ page }, info) => {
  const p = info.project.name;
  await page.goto("/track");
  await page.getByRole("button", { name: "SC-100234" }).click();
  const article = page.getByRole("article", { name: "Order SC-100234" });
  await expect(article).toBeVisible();
  await expect(article).toContainText("DEMO-TRK-100234");
  await shot(page, "track-shipped", p);

  await page.getByLabel("Order number").fill("SC-999999");
  await page.getByRole("button", { name: "Track order" }).click();
  await expect(page.getByText("No order found.")).toBeVisible();

  await page.getByLabel("Order number").fill("DROP TABLE orders");
  await page.getByRole("button", { name: "Track order" }).click();
  await expect(page.locator("#track-err")).toBeVisible();

  await page.goto("/track?order=SC-100236");
  await expect(page.getByRole("article", { name: "Order SC-100236" })).toContainText("Delivered");
});

test("cart: quantity, edit customization, remove, empty state", async ({ page }) => {
  await addPosterToCart(page, "ALEX");
  const cart = page.getByRole("dialog", { name: "Shopping cart" });
  await expect(cart.getByText("€79.00").first()).toBeVisible();

  await cart.getByRole("button", { name: /Increase quantity/ }).click();
  await expect(cart.getByText("€158.00").first()).toBeVisible();

  await cart.getByRole("link", { name: /Edit customization/ }).click();
  await expect(page.getByRole("heading", { name: "Make it yours." })).toBeVisible();
  await expect(page.getByLabel(/^Name/)).toHaveValue("ALEX");
  await page.getByLabel(/^Name/).fill("ALEXANDER");
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByText("Preview ready")).toBeVisible({ timeout: 15_000 });
  await page.getByRole("button", { name: "Update cart" }).click();
  await expect(cart).toBeVisible();
  await expect(cart.getByText(/ALEXANDER/).first()).toBeVisible();

  await cart.getByRole("button", { name: /Remove .* from cart/ }).click();
  await expect(cart.getByText("Nothing here yet")).toBeVisible();
});

test("checkout with an empty cart shows a way forward", async ({ page }) => {
  await page.goto("/checkout");
  await expect(page.getByRole("heading", { name: "Nothing to check out." })).toBeVisible();
});

test("unknown car and unknown order pages fail gracefully", async ({ page }) => {
  const res = await page.goto("/cars/does-not-exist");
  expect(res?.status()).toBe(404);
  await expect(page.getByText("That car isn't in the catalog yet.")).toBeVisible();
  await page.goto("/order/success/NOT-AN-ORDER");
  await expect(page.getByText("Unknown order.")).toBeVisible();
});
