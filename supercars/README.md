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

The build settings are stored in the Cloudflare dashboard, **not** in this repository, so changing them requires editing them there.

### Environments

| | Development | Preview | Production |
| --- | --- | --- | --- |
| `APP_ENV` | `development` (`.dev.vars` / `.env.local`) | `preview` (non-production branch builds) | `production` (`wrangler.jsonc` `vars`) |
| Secrets | `.dev.vars` (git-ignored) | Worker secrets (preview) | Worker secrets |
| Providers | all `mock` | all `mock` | all `mock` until real ones exist |

## Pages (order-first)

The store exists to take an order, so it has as few pages as possible and one way to do each thing.

| Page | Job |
| --- | --- |
| `/` | One screen: what we sell + the 12 car tiles. A tile starts a poster for that car. |
| `/create` | The designer: **car → design (style, finish, size) → personalize → review and add to cart**. |
| `/cars/<slug>` | One-screen landing page per car (for ads and links): the car, three facts, price, one button. |
| `/checkout`, `/order/success/<id>`, `/track` | Pay (demo), confirmation, order tracking. |
| `/shipping`, `/privacy`, `/terms`, `/legal`, `/credits` | Required information, linked from a one-line footer. |

Old URLs still work: `/shop`, `/cars` and `/products/*` go to `/create`; `/how-it-works` and `/about` go to `/`; `/returns` goes to `/shipping`; `/cart` goes to `/checkout` (the cart is the drawer opened from the header). The redirects are in `next.config.ts`.

Rules that `tests/e2e/funnel.spec.ts` enforces: the home page, car pages, `/track` and the checkout entry fit one screen without scrolling (390×844, 768×1024, 1440×900); a page never shows two "create your poster" controls; the header is only logo, Track order and cart (a Create button appears only on pages that have no start button of their own); there is no bottom tab bar and no floating chat button (the chat link is in the footer).

## Car images

Every car image is described in `photos/manifest.json` and turned into web files by two commands. To add or replace a car's image (your own studio shot, or an AI-generated one):

1. Put the original at `assets-src/cars/<slug>/main.png` (or `.jpg` / `.webp`). `assets-src/` is git-ignored: originals stay out of the repository.
2. Add or edit its entry in `photos/manifest.json`: `mode` `"cutout"` (the car on a transparent background; the site draws the showroom) or `"backdrop"` (the picture is shown as is, best for dark low-key studio shots); `alt`; `credit` — for your own or AI images use `{"kind":"own","title":"…","author":"SuperCars","licenseName":"SuperCars","note":"AI-generated image."}`. If the file already has a transparent background, add `"alreadyTransparent": true`. Optional: `crop`, `redact` (boxes to cover plates or faces), `focal`.
3. `npm run photos:cutout` (only for cutouts that still have a background; one-time setup: `python3 -m venv .venv && .venv/bin/pip install "rembg[cpu]" pillow numpy scipy`, then run `.venv/bin/python scripts/cutout-photos.py`), then `npm run photos:process`. Commit `public/cars/**`, `src/data/car-photos.ts` and the manifest.

Cars without an entry show their drawn silhouette. Side or three-quarter views work best; a top-down view is rejected by the pipeline.

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
