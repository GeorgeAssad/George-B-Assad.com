import { expect } from "@playwright/test";
import { expectFixedBarsInViewport, expectNoHorizontalScroll, shot, test } from "./helpers";

test("configurator: car → design → personalize → review → add to cart", async ({ page }, info) => {
  const p = info.project.name;
  await page.goto("/create");

  // Step 1 — car
  await expect(page.getByRole("heading", { name: "Choose your car." })).toBeVisible();
  await page.getByLabel("Search cars").fill("BMW M3");
  await expect(page.getByRole("radio", { name: /M3 G80/ })).toBeVisible();
  await expect(page.getByRole("radio", { name: /M4/ })).toHaveCount(0);
  await shot(page, "cfg-1-car", p);
  await page.getByRole("radio", { name: /M3 G80/ }).check({ force: true });
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 2 — design: style, finish and size on ONE screen
  await expect(page.getByRole("heading", { name: "Design your poster." })).toBeVisible();
  await page.getByRole("radio", { name: /Racing/ }).check({ force: true });
  await page.getByRole("radio", { name: /Print only/ }).check({ force: true });
  await page.getByRole("radio", { name: /50/ }).check({ force: true });
  await shot(page, "cfg-2-design", p);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 3 — personalize (validation first)
  await expect(page.getByRole("heading", { name: "Make it yours." })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await expect(page.getByRole("alert").filter({ hasText: /name/i })).toBeVisible();
  await page.getByLabel(/^Name/).fill("GEORGE");
  await page.getByLabel(/^Year/).fill("2024");
  await page.getByLabel(/^Location/).fill("Nürburgring");
  await shot(page, "cfg-3-personalize", p);
  await expectNoHorizontalScroll(page);
  await expectFixedBarsInViewport(page);
  await page.getByRole("button", { name: "Continue" }).click();

  // Step 4 — review: the preview builds by itself, the summary sits under it, one button adds to the cart
  await expect(page.getByRole("heading", { name: "Ready to add." })).toBeVisible();
  await expect(page.getByText("Preview ready")).toBeVisible({ timeout: 15_000 });
  const summary = page.locator("dl");
  await expect(summary.getByText(/GEORGE/)).toBeVisible();
  await expect(summary.getByText("€79.00")).toBeVisible();
  await shot(page, "cfg-4-review", p);
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("dialog", { name: "Shopping cart" })).toBeVisible();
  await expect(page.getByRole("dialog").getByText("BMW M3 G80").first()).toBeVisible();
  await shot(page, "cfg-5-cart-drawer", p);
});

test("configurator: a car link opens the design step, a full link opens personalize", async ({ page }) => {
  await page.goto("/create?car=porsche-911-992&style=heritage");
  await expect(page.getByRole("heading", { name: "Design your poster." })).toBeVisible();
  await page.goto("/create?car=porsche-911-992&style=heritage&size=40x60");
  await expect(page.getByRole("heading", { name: "Make it yours." })).toBeVisible();
  await page.goto("/create?car=nope&style=%3Cscript%3E");
  await expect(page.getByRole("heading", { name: "Choose your car." })).toBeVisible();
});

test("configurator: no results state offers a way forward", async ({ page }) => {
  await page.goto("/create");
  await page.getByLabel("Search cars").fill("zzzzz");
  await expect(page.getByText("No machine matched your search.")).toBeVisible();
  await page.getByRole("button", { name: "Clear search" }).first().click();
  await expect(page.getByRole("radio").first()).toBeVisible();
});
