// Renders Open Graph images (public/og) and template previews (public/templates) from the DEV server.
//   1) npm run dev -- -p 3111   2) npm run og
// Output is committed, so the deployed Worker ships static images and no image-generation runtime (e.g. next/og wasm).
import { mkdirSync } from "node:fs";
import { chromium } from "playwright-core";

const BASE = process.env.OG_BASE ?? "http://localhost:3111";
const CHROMIUM = process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium-1194/chrome-linux/chrome";

const cars = await (await fetch(`${BASE}/sitemap.xml`)).text().then((x) => [...x.matchAll(/\/cars\/([a-z0-9-]+)</g)].map((m) => m[1]));
const jobs = [
  ...["home", "create", "shop"].map((k) => ({ path: `/og-preview/${k}`, out: `public/og/${k}.jpg`, w: 1200, h: 630 })),
  ...cars.map((slug) => ({ path: `/og-preview/car/${slug}`, out: `public/og/cars/${slug}.jpg`, w: 1200, h: 630 })),
  // Pass --no-templates to leave public/templates untouched (they do not depend on car photographs).
  ...(process.argv.includes("--no-templates") ? [] : ["minimal", "blueprint", "racing", "heritage", "luxury"]).map((id) => ({ path: `/og-preview/template/${id}`, out: `public/templates/${id}.jpg`, w: 600, h: 840 })),
];

mkdirSync("public/og/cars", { recursive: true });
mkdirSync("public/templates", { recursive: true });

const browser = await chromium.launch({ executablePath: CHROMIUM, args: ["--no-sandbox"] });
const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
for (const job of jobs) {
  const res = await page.goto(BASE + job.path, { waitUntil: "networkidle" });
  if (!res?.ok()) throw new Error(`${job.path} -> ${res?.status()}`);
  await page.locator("#og").screenshot({ path: job.out, type: "jpeg", quality: 86 });
  console.log("wrote", job.out);
}
await browser.close();
