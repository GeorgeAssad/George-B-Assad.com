import { expect, test } from "@playwright/test";

/* The light/dark switch lives in the top bar (once; not in the footer). */
test("the top bar's light/dark switch changes the theme and remembers it", async ({ page }) => {
  // Start from light once; later reloads keep whatever the switch saved.
  await page.addInitScript(() => {
    if (!window.sessionStorage.getItem("theme-seeded")) {
      window.localStorage.setItem("sc-theme", "light");
      window.sessionStorage.setItem("theme-seeded", "1");
    }
  });
  await page.goto("/cars");
  const html = page.locator("html");
  const header = page.locator("header");

  await header.getByRole("button", { name: "Switch to dark theme" }).click();
  await expect(html).toHaveAttribute("data-theme", "dark");

  await page.reload();
  await expect(html).toHaveAttribute("data-theme", "dark");

  await header.getByRole("button", { name: "Switch to light theme" }).click();
  await expect(html).toHaveAttribute("data-theme", "light");

  await expect(page.locator("footer").getByRole("button", { name: /Switch to (dark|light) theme/ })).toHaveCount(0);
});
