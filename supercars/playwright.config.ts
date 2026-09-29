import { defineConfig } from "@playwright/test";

/* E2E runs against a running server (dev, `next start`, or `wrangler dev`).
 *   E2E_BASE_URL   defaults to http://localhost:3111
 *   CHROMIUM_PATH  defaults to the pre-installed Chromium in this environment */
const baseURL = process.env.E2E_BASE_URL ?? "http://localhost:3111";
const executablePath = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

export default defineConfig({
  testDir: "tests/e2e",
  timeout: 90_000,
  expect: { timeout: 10_000 },
  workers: 1,
  reporter: [["list"]],
  outputDir: process.env.E2E_OUT ?? "test-results",
  use: { baseURL, launchOptions: { executablePath, args: ["--no-sandbox"] }, screenshot: "off", trace: "off" },
  projects: [
    { name: "desktop", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
  ],
});
