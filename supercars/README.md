# SuperCars storefront (prototype)

A production-shaped storefront prototype for **SuperCars** — personalized automotive artwork: *pick your car → choose a style → personalize → preview → pay → we create and ship it.*

Everything external is **mocked** (payments, AI design, fulfilment, support, email, analytics). No real money moves, no card data is collected, and no secrets are needed to run or deploy it. See [ARCHITECTURE.md](./ARCHITECTURE.md) for how the mocks are swapped for real services and [INTEGRATIONS.md](./INTEGRATIONS.md) for exactly where each integration plugs in.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript (strict) · Tailwind CSS v4 · zod · OpenNext for Cloudflare Workers.

## Run it

```bash
cd supercars
npm ci
npm run dev            # http://localhost:3000
```

| Command | What it does |
| --- | --- |
| `npm run verify` | lint + typecheck + unit tests + secret scan + code audit + production build + client-bundle scan |
| `npm test` | unit tests (Vitest) |
| `npm run test:e2e` | browser tests (Playwright) against `E2E_BASE_URL` (default `http://localhost:3111`) |
| `npm run cf:build` | build for Cloudflare Workers (`.open-next/`) |
| `npm run cf:preview` | build and run locally in `workerd`, Cloudflare's real runtime |
| `npm run cf:dryrun` | package the Worker without deploying and report its size |
| `npm run headers:write` | regenerate `public/_headers` from `src/config/security-headers.ts` |
| `npm run og` | regenerate Open Graph / template images (needs the dev server on :3111) |
| `npm run photos:fetch` | download the original car photos listed in `photos/manifest.json` into `assets-src/` (git-ignored) |
| `npm run photos:cutout` | remove the background from every `"mode": "cutout"` photo (Python + rembg; see "Car images") |
| `npm run photos:process` | trim, cover plates/faces, encode AVIF + WebP (with transparency for cutouts) into `public/cars/` and regenerate `src/data/car-photos.ts` |

### End-to-end tests

```bash
npm run build && PORT=3111 npm start &     # or: npm run dev -- -p 3111
CHROMIUM_PATH=/path/to/chrome npm run test:e2e
```
`CHROMIUM_PATH` defaults to the Chromium preinstalled in the Claude Code cloud environment. To test the Cloudflare runtime instead: `npm run cf:preview` and `E2E_BASE_URL=http://localhost:8787 npm run test:e2e`.

## Deploy to Cloudflare (Git-connected Workers Builds)

This folder is a self-contained Worker project. It does **not** touch any other Worker or file in the repository.

1. Cloudflare dashboard → **Workers & Pages** → **Create** → **Import a repository** → select this GitHub repository.
2. **Project name / Worker name:** `supercars` (must match `name` in `wrangler.jsonc`, or the build fails).
3. **Root directory:** `supercars`
4. **Build command:** `npm ci && npm run cf:build`
5. **Deploy command:** `npx wrangler deploy`
6. **Build variables** (Settings → Builds → Variables and secrets; these are public, build-time values):
   - `NEXT_PUBLIC_SITE_URL` = your final public URL (e.g. `https://supercars.<account>.workers.dev`)
   - `NEXT_PUBLIC_APP_ENV` = `production`
   - `NEXT_PUBLIC_ALLOW_INDEXING` = `false` (keep search engines out until launch)
7. Optional runtime secret (recommended on any public deployment): `CHECKOUT_SIGNING_SECRET` — 32+ random characters, so demo checkout sessions cannot be forged. Set it under the Worker's **Settings → Variables and secrets** (or `npx wrangler secret put CHECKOUT_SIGNING_SECRET`). The prototype works without it.
8. Every push to the production branch builds and deploys. Pushes to other branches produce **preview URLs**.

Nothing else is required: no database, KV, R2 or API keys. `NEXT_PUBLIC_SITE_URL` also sets the allowed same-origin for API calls if the site is reached on a hostname other than the one Cloudflare reports.

### Troubleshooting a failed Cloudflare build

| Symptom in the build log | Cause | Fix |
| --- | --- | --- |
| `Could not detect a directory containing static files` at the deploy step | Root directory is `/` and/or Build command is empty, so `wrangler` ran in the repo root (no `wrangler.jsonc` there) | **Settings → Build**: Root directory `supercars`, Build command `npm ci && npm run cf:build`, then **Retry build** |
| The build log shows no `npm ci` / `next build` at all | Build command is `None` | Same as above |
| `ENOENT … package.json` or `Cannot find … supercars` | The branch being built does not contain `supercars/` (e.g. the PR isn't merged) | Merge to the production branch, or change **Git branch** in Build settings |
| `Worker name mismatch` / build refuses to deploy | Dashboard Worker name differs from `name` in `wrangler.jsonc` | Keep the Worker named `supercars` |
| The live site randomly answers `error code: 1102` or `Internal Server Error`, and pages lack the `x-opennext-cache: HIT` header | The built pages were not copied into the Worker's files, so every visit re-renders the page and goes over the per-request CPU limit | Build command must run `npm run cf:build` (it ends with `opennextjs-cloudflare populateCache local`); keep the cache settings in `open-next.config.ts` |

The build settings are stored in the Cloudflare dashboard, **not** in this repository, so changing them requires editing them there.

### Environments

| | Development | Preview | Production |
| --- | --- | --- | --- |
| `APP_ENV` | `development` (`.dev.vars` / `.env.local`) | `preview` (non-production branch builds) | `production` (`wrangler.jsonc` `vars`) |
| Secrets | `.dev.vars` (git-ignored) | Worker secrets (preview) | Worker secrets |
| Providers | all `mock` | all `mock` | all `mock` until real ones exist |

## Pages

Every page exists and has one job. Nothing is said twice: navigation lives only in the header, and a page never carries a second generic "Create your poster" button.

| Page | Job |
| --- | --- |
| `/` | Sells in order: a hero that fits the first screen (headline, the one **Create your poster** button, the product stage with a five-style picker), four benefits, the car picker (+ "Can't find your car? Ask us"), the five styles on a wall (two marked "Our pick"), a gift section, the four steps, **example reviews** (labelled) and questions. |
| `/cars` | Search and brand filters (state in the URL) over car tiles; a tile opens the car's page; "Can't find your car? Ask us" at the end. |
| `/cars/<slug>` | The product page: breadcrumb, facts, price ("from", with the running offer), **Create this car**, a delivery estimate from today's date, trust points; then the five styles, a sizes-and-prices table (print and framed), example reviews, questions and "More cars like this". On phones the Create button follows you once it scrolls away. |
| `/shop` | Print and framed poster as two pricing cards (with offer prices), trust points, a size guide drawn to scale above a sofa, example reviews and questions. |
| `/how-it-works`, `/about` | The four steps with delivery facts and FAQ; the studio in three principles. |
| `/create` | The designer: **car → design (style, finish, size) → personalize → review and add to cart**. |
| `/checkout`, `/order/success/<id>`, `/track` | Pay (demo), confirmation, order tracking. |
| `/shipping`, `/privacy`, `/terms`, `/legal`, `/credits` | Required information, linked from a one-line footer. |

Old URLs still work: `/products/*` goes to `/shop` (`/products/<slug>/customize` to `/create?product=<slug>`); `/returns` goes to `/shipping`; `/cart` goes to `/checkout` (the cart is the drawer opened from the header). The redirects are in `next.config.ts`.

Rules that `tests/e2e/funnel.spec.ts` and `tests/unit/site-structure.test.ts` enforce:

- **Navigation only in the header** — Cars, Shop, How it works, About, Track order, the light/dark switch and the cart; on phones the same five links sit in one menu. The footer is legal links and chat. No bottom tab bar, no floating chat button.
- **One visible generic Create button**: on Home it is the hero's, and the header's appears only after the hero's has scrolled away; everywhere else it is in the header (none on `/create`, the checkout and order confirmation). Contextual starts that name their job are fine: a car tile, "Create this car", a style, "Design a framed gift". A breadcrumb trail is the one place a header page is linked again.
- **Page lengths are budgeted** per page at 390×844, 768×1024 and 1440×900 in `tests/e2e/funnel.spec.ts`. Home, car pages and the Shop are deliberately longer selling pages (the owner's choice); the others stay short and `/track` is one screen. Home's headline, Create button and product stage always fit the first screen; so does a car page's Create button.

## Offers (discounts and free shipping)

Offers are switched on by **adding one line to `src/config/promotions.ts`**, with a start and an end time. They turn themselves on and off at those times; only adding, changing or removing a line needs a deploy (merge to `main`). While no offer runs there is no banner, no countdown and no crossed-out price, and **shipping is the flat €7.90**.

```ts
// 15% off every poster for three hours, with a countdown banner:
{ id: "flash-15", kind: "percent-off", percent: 15, startsAt: "2026-11-28T18:00:00+01:00", endsAt: "2026-11-28T21:00:00+01:00", label: "Flash sale" },
// Free shipping on orders of €80 or more for a weekend (minSubtotal in whole euros; 0 = every order):
{ id: "free-ship-80", kind: "free-shipping", minSubtotal: 80, startsAt: "2026-11-29T00:00:00+01:00", endsAt: "2026-12-01T00:00:00+01:00" },
```

- Times need a UTC offset (`+01:00`, `+02:00`, `Z`). A broken line fails the build with a message naming it, so the live site keeps running the last good version.
- If two discounts overlap the bigger one applies; the lower free-shipping amount applies. Free shipping is measured on the goods total after the discount.
- **The server applies every offer** (`src/server/checkout/pricing.ts`); the pages only display it. A customer who started checkout during an offer keeps that price for the 30-minute checkout session, even if the offer ends meanwhile.
- What customers see: a red announcement bar with a live countdown, offer prices with the old price crossed out (car pages, Shop, designer), a discount line and a free-shipping progress bar in the cart and at checkout.
- Testing: `NEXT_PUBLIC_PROMOTIONS` (a JSON array of the same shape) adds offers at build time for preview builds and `tests/e2e/offers.spec.ts` (run with `E2E_OFFERS=1` against such a build).

## Gifts, upgrades and example reviews

- **Gift orders:** at checkout, "This order is a gift" adds an optional note (200 characters, same safe-text rules as the poster) and marks the packing slip "no prices". The confirmation page shows the note; public tracking only says "Gift order".
- **Upgrade to framed:** every print in the cart, and the designer's review step, offers the framed poster of the same size; the price difference comes from the server's quote.
- **Example reviews** (`src/content/example-reviews.ts`) are placeholder text, always under the heading "Example reviews" with a note saying so; no average rating, no counts and no review markup. Replace them with real, verified reviews before launch. Shared FAQ answers live in `src/content/faq.ts`.

## Design

The site uses the Liquid Glass design kit (`src/styles/liquid-glass.css`, kept verbatim) with SuperCars' own values on top (`src/app/globals.css`):

- **Light by default; dark follows the device**, or the visitor's choice from the switch in the footer (stored as `sc-theme`).
- **One accent colour**, SuperCars red, used for the things you can act on. Prices and body text stay neutral.
- **Glass only on floating chrome**: the header, the designer's action bar on a phone, toasts, drawers and the control card over the hero stage. Content sits on solid white (or dark) cards.
- **One deliberately dark area per page at most**: the product stage (`.stage`), so the car and poster stand out on a light page.
- Type is the system display face (San Francisco on Apple devices, the bundled Inter elsewhere). Barlow Condensed is only used inside the poster artwork.

## Car images

Every car image is described in `photos/manifest.json` and turned into web files by two commands. To add or replace a car's image (your own studio shot, or an AI-generated one):

1. Put the original at `assets-src/cars/<slug>/main.png` (or `.jpg` / `.webp`). `assets-src/` is git-ignored: originals stay out of the repository.
2. Add or edit its entry in `photos/manifest.json`: `mode` `"cutout"` (the car on a transparent background; the site draws the backdrop) or `"backdrop"` (the picture is shown as is, best for dark low-key studio shots); `alt`; `credit` — for your own or AI images use `{"kind":"own","title":"…","author":"SuperCars","licenseName":"SuperCars","note":"AI-generated image."}`. If the file already has a transparent background, add `"alreadyTransparent": true`. Optional: `crop`, `redact` (boxes to cover plates or faces), `focal`.
3. `npm run photos:cutout` (only for cutouts that still have a background; one-time setup: `python3 -m venv .venv && .venv/bin/pip install "rembg[cpu]" pillow numpy scipy`, then run `.venv/bin/python scripts/cutout-photos.py`), then `npm run photos:process`. Commit `public/cars/**`, `src/data/car-photos.ts` and the manifest.

Cars without an entry show a light-line silhouette ("photo soon") instead of a photo. Side or three-quarter views work best; a top-down view is rejected by the pipeline.

What `npm run photos:process` does to every cut-out, so a set of photos taken in different light still reads as one shoot:

- **Plates, faces and stickers** listed under `redact` in the manifest are hidden by continuing the car's own surroundings into the box (a smooth diffusion of the pixels around it plus film grain), not by a flat block. Add `"sample": "dark"` to a box that sits on a grille or window so the fill stays dark. Use `--only <slug>` to re-encode one car while tuning it.
- **Grade:** each car's median brightness is nudged toward one target (only within a small range, so white stays white and black stays black), colour gets a touch more saturation and the alpha edge is smoothed.

Your own studio or AI images should come with their own lighting; set `"grade": false` in the manifest entry to skip the automatic grade for them (see `scripts/process-photos.mjs`).

## Project map

```
src/app/            routes, API routes (all via withApi), error/loading states, sitemap/robots/manifest
src/components/     ui · layout · home · cars · configurator · poster · cart · checkout · orders · support
src/domain/         pure types, split by concern (catalog · customer · cart · order · fulfillment · design · support)
photos/             manifest of the car photographs (source, crop, credit) — the source of truth for `public/cars`
src/data/           demo data only — read via repositories, never imported by UI (enforced by ESLint); `car-photos.ts` is generated
src/server/         repositories · services (contracts + mocks + factory) · checkout · security
src/lib/            validation (zod), print-spec, timeline, cart store, analytics
src/config/         env (server-only), site, nav, security headers
scripts/            secret + bundle scanners, code audit, OG image generator
tests/              unit (Vitest) and e2e (Playwright)
```
