# Architecture

This document is the reference for extending the SuperCars storefront. It describes how the prototype is put together, what is real versus mocked, the security model, and **where each future integration plugs in**. For per-vendor steps see [INTEGRATIONS.md](./INTEGRATIONS.md).

## 1. The core idea

```
VEHICLE ASSET  +  DESIGN TEMPLATE  +  CUSTOMIZATION DATA   =   FINAL PRODUCT PREVIEW
(what the car       (layout, type,        (name, text,             (SVG today; print files
 looks like)         decoration: data)     year, location)          tomorrow)
```

Business flow this is built for:

```
Customer → Website → Order → AI Design Engine → Print / Fulfilment → Customer
```

Today the middle stages are simulated behind interfaces so the customer experience is complete and the real services can be dropped in without rebuilding it.

## 2. Layers and dependency rules

```
 src/app, src/components      UI. Server Components by default; "use client" only where interaction needs it.
        │  reads data via ↓ (server) or via API routes (client)
 src/server/repositories      Data access interfaces + local demo implementations.
 src/server/services          Provider contracts (payment, AI, fulfilment, support) + mocks + factory.
 src/server/checkout          Authoritative pricing, checkout orchestration.
 src/server/security          withApi wrapper, rate limiting, origin check, HMAC, redacting logger.
        │
 src/domain                   Pure types. No behaviour, no data, no imports from other layers.
 src/data                     Demo data. Imported ONLY by src/server/repositories/local.
 src/lib, src/config          Shared pure helpers and configuration.
```

Rules enforced by tooling, not convention:

- **ESLint** forbids `src/app` and `src/components` from importing `@/data/*`, and forbids client code (`components`, `lib`) from importing `@/server/services` or `@/config/env`.
- **`npm run audit:code`** fails on `innerHTML`, `eval`, `document.write`, `javascript:` URLs, `window.open`, location assignment, unexpected `process.env` reads, client components importing server modules, and `target="_blank"` without `rel="noopener"`. `dangerouslySetInnerHTML` is allowed in exactly one file (a constant theme bootstrap string).
- **Unit tests** keep `public/_headers` in sync with the security-header source of truth.

## 3. Data architecture

Domain types are split so concerns never merge into one giant object:

| File | Contents |
| --- | --- |
| `domain/catalog.ts` | `Brand`, `Car`, `CarGeneration`, `VehicleAsset`, `DesignTemplate`, `Product`, `ProductVariant` |
| `domain/customer.ts` | `Customer`, `Address` (personal data — never logged) |
| `domain/cart.ts` | `Customization`, `CartItem`, `Cart`, `CartQuote` (references only, never prices) |
| `domain/order.ts` | `Order`, `OrderItem`, `Payment`, `PublicOrderView`, timeline (server-authored) |
| `domain/fulfillment.ts` | `Shipment`, fulfilment order inputs |
| `domain/design.ts` | Design jobs, `PrintSpec`, `DesignAsset` kinds |
| `domain/money.ts` | `Money` — integer minor units (cents) only |

**Repositories** (`server/repositories/types.ts`): `CarRepository`, `ProductRepository`, `TemplateRepository`, `OrderRepository`, `CustomerRepository`, `ContentRepository`. `local/` implements them over `src/data/*`. To move to PostgreSQL / Supabase / D1, implement the same interfaces and return them from `getRepositories()` — no page or component changes.

**Prototype persistence.** Workers isolates do not share memory, so order/customer writes to the local repository live per isolate only. To keep the demo flow reliable the confirmation page also reads the order the server just created from the browser's `localStorage` (schema re-validated on every read). `/track` asks the server first, then falls back to that local copy. This is display-only and is **the** thing to replace with real persistence: implement `OrderRepository` against a database and delete `lib/order-store.ts`.

## 4. The design engine

`components/poster/*` renders a poster as an SVG **purely from data**:

- `VehicleAsset` is a union: `svg-archetype` (local generic silhouettes, 9 shapes) or `image-url` (what an AI provider will return). `VehicleArt` renders either.
- `DesignTemplate.layout` (in `src/data/templates.ts`) describes background, art frame and treatment, title / personalization / technical / branding zones, typography, and a list of `DecorationId`s. `decorations.tsx` is a registry that draws each id. Add a template = add data (plus a decoration only if it needs a new shape).
- Customer text is rendered as React text nodes inside SVG `<text>` (auto-escaped), length-capped by validation, and shrunk to fit.

Vehicle artwork is original and generic — no manufacturer photos or logos. Vehicle names identify the subject only; the footer and `/legal` say so.

### Print files are not previews

`lib/print-spec.ts` treats five deliverables as separate assets — **web preview, social image, print image, print PDF, master source** — each with its own pixel size. Print dimensions come from physical size + DPI + bleed, e.g. 50×70 cm @ 300 DPI with 3 mm bleed = **5976 × 8339 px**. "8K" does not imply print-ready (7680 px across 700 mm is ~279 DPI); `effectiveDpi()` and `validateArtwork` make that check explicit.

### Pipeline endpoints (all demo results today)

```
POST /api/design/generate   → job + pipeline stages + planned assets
POST /api/design/upscale    → asset scaled to exact print dimensions
POST /api/design/validate   → resolution / aspect-ratio issues
POST /api/design/render     → all five deliverables
```
Pipeline: `car → vehicle asset → AI generation/editing → upscale → template render → high-res print file → quality validation`. The configurator's Preview step calls `generate` and animates the returned stages.

## 5. Service boundaries

`server/services/contracts/*` define what the app needs; `mock/*` are the only implementations; `services/index.ts` is the single place a provider is chosen (from `*_PROVIDER` env vars).

| Contract | Methods | Mock |
| --- | --- | --- |
| `PaymentProvider` | `createCheckoutSession`, `verifyPayment`, `getPaymentStatus` | HMAC-signed stateless sessions |
| `AiDesignProvider` | `generateVehicleAsset`, `generatePoster`, `upscaleArtwork`, `validateArtwork`, `renderPrintAssets` | local silhouettes + planned assets |
| `FulfillmentProvider` | `createOrder`, `getOrderStatus`, `getShipment`, `cancelOrder` | demo orders enter "design" |
| `SupportProvider` | `answerCustomer`, `getOrderStatus`, `getProductInfo`, `getTracking`, `createSupportTicket`, `escalateToHuman` | rule-based over demo data |
| `AnalyticsProvider` (client) | `track(event, props)` | dev-console only |

**Fail closed:** selecting a provider that has no implementation (`PAYMENT_PROVIDER=stripe` today) throws at first use rather than half-working. A future integration can therefore never execute by accident.

## 6. Checkout and the price-trust boundary

```
Browser                              Server
  cart = references only  ───────►   POST /api/cart/quote      → priced from catalog
  (product, size, car, template,
   personalization, quantity)
  form (customer + address) ─────►   POST /api/checkout/session
                                       validate (strict) → price → PaymentProvider.createCheckoutSession
                            ◄─────    { sessionId, orderId, totals }   (no secrets, no card data)
  "DEMO PAYMENT" ───────────────►    POST /api/checkout/demo-confirm
                                       verifyPayment(session) → re-price → cart-hash match → create order
                            ◄─────    { order }
```

Guarantees, each covered by a unit test and/or a live probe:

- **No client price exists.** Every request schema is `.strict()`: a `price`, `total`, `paymentStatus`, `userId`, … field is rejected with 422, not ignored. Prices come from `data/products.ts` (later: the database) via `server/checkout/pricing.ts`.
- **A session is bound to the exact cart.** The signed session embeds a hash of the priced cart + destination country; confirming a different cart returns 409 `cart_changed`.
- **Sessions cannot be forged or replayed after expiry** (HMAC-SHA-256, 30 min TTL). The fallback signing key is a clearly labelled *public demo constant*: forging a demo session can only create a demo order. Set `CHECKOUT_SIGNING_SECRET` to remove even that.
- **Order owner, payment status, fulfilment status, shipping amount** are all set on the server. `mode` is `"demo"` whenever the mock payment provider is active.
- **Shipping destinations** are enforced on the server; the country `<select>` is only a convenience.
- **No card data anywhere.** There are no card inputs; an e2e test asserts none exist on `/checkout`.

Future real payment flow: `createCheckoutSession` returns a hosted-checkout URL; the provider's **signed webhook** (a new `POST /api/webhooks/payment` route that verifies the signature) creates the order. `demo-confirm` answers 404 when the active provider is not `mock`.

## 7. Security model

**Secrets.** None are needed to run. Real ones will live in Cloudflare Worker secrets (and `.dev.vars` locally, git-ignored), be read only in `config/env.ts` / a provider implementation, and never reach the client. `.env.example` lists placeholders with empty values. `npm run check:secrets` scans tracked files; `npm run check:bundle` scans everything a browser can download (`.next/static`, `.open-next/assets`) for key patterns, server-secret variable names, and server-only strings. Only `NEXT_PUBLIC_SITE_URL`, `NEXT_PUBLIC_APP_ENV`, `NEXT_PUBLIC_ALLOW_INDEXING` are public.

**API wrapper (`withApi`).** Every route: method check → same-origin check (Origin, falling back to `Sec-Fetch-Site`; non-browser clients without either are rejected on POST) → per-client rate limit → `application/json` required → streamed body-size cap → strict zod validation → handler → sanitized error envelope with a request id. Stack traces and messages from unexpected errors never reach the client; logs go through a redacting logger (keys like email, name, address, token, card are replaced; strings truncated).

**Rate limiting.** `RateLimiter` interface + in-memory sliding windows keyed by `CF-Connecting-IP`. Policies in `rate-limit.ts` (checkout, lookup, support, quote, design). The AI-generation policy is the tightest and multi-window (per minute / hour / day) because it is the expensive endpoint. The in-memory limiter is **per isolate and therefore best-effort**; production should bind Cloudflare's Rate Limiting API or a Durable Object behind the same interface. Future AI endpoints must also add authentication and per-account quotas before calling a paid model.

**XSS / injection.** No HTML injection: the audit forbids the dangerous APIs. Customer text is validated (allow-listed characters, length caps, control/bidi characters stripped) and only ever rendered as escaped text. Query params and URL fragments that select catalog entries are checked against the catalog. localStorage (cart, orders) is treated as untrusted and re-validated with zod.

**Headers** (`src/config/security-headers.ts` → `next.config.ts` for pages/API, `public/_headers` for static assets): CSP, `X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, `Permissions-Policy`, HSTS, COOP/CORP, plus immutable caching for fingerprinted assets.

> **Known, deliberate CSP trade-off:** `script-src 'unsafe-inline'` (and `style-src 'unsafe-inline'`). Next.js emits inline hydration scripts on statically cached pages, where per-request nonces are impossible. Mitigations: no third-party scripts at all, no HTML injection (audited), `connect-src`/`form-action`/`base-uri` locked to `'self'`, `object-src 'none'`, `frame-ancestors 'none'`. Upgrade path: nonce-based CSP once pages are rendered dynamically, or Next.js SRI. Track this before adding *any* third-party script.

**Privacy.** Public order lookup returns a reduced view (no name, email, phone or street address). Unknown orders return one generic 404. Production should additionally require the order email to look up an order (order numbers are guessable in the prototype's seeded set).

**Indexing.** `robots.txt` disallows everything and pages send `noindex` unless `NEXT_PUBLIC_ALLOW_INDEXING=true`.

## 8. Frontend

- **Structure:** every page exists, each with one job (see README, "Pages"). Navigation is in the header only (`config/nav.ts` `primaryNav` feeds both the desktop bar and the phone menu); the footer is legal links; one generic Create button per page, in the header (`lib/layout-rules.ts` decides where it hides). The page shell is a flex column (`body` → `main` → `template` → page) so the first scene of a page can fill exactly one screen.
- **Showroom kit** (`components/showroom`): `ShowroomStage` (near-black stage with a cone of light, glossy floor, red glow, film grain and an optional outlined word), `PageHero` (the shared opening of Cars, Shop, How it works and About), `HeroCar` (cut-out car with floor reflection and drive-in), `WallPoster`/`ProductScene` (posters framed on a gallery wall with a picture light). The stage is dark in both themes; the rest of the page follows the theme.
- Server Components by default; client components only for the configurator, cart, search/filter, checkout, tracking, chat, dialogs.
- **State:** cart is an external store (`useSyncExternalStore`) with zod-validated localStorage; dialogs use native `<dialog>` (focus trap, Esc, inert background); the car filters use the URL query string as the single source of truth.
- **Configurator** (`components/configurator`): pure reducer + URL parsing in `config-state.ts` (unit-tested), four steps with a stepper — Your car → Design (style, finish and size on one screen) → Personalize → Review (the mock design job runs by itself, the summary and one "Add to cart" button sit under it) — live preview, server-quoted price, `?edit=<lineId>` to edit a cart line (the component re-initialises when that param changes, e.g. from the cart drawer), deep links `?car=&style=&size=&product=`.
- **Accessibility:** semantic landmarks, skip link, visible focus ring, real radio inputs for selectable cards, labelled inputs with `aria-invalid`/`aria-describedby`, error summaries with focus management, `prefers-reduced-motion` honoured, axe (WCAG 2.1 A/AA) clean in dark and light themes.
- **Performance:** pre-rendered pages, code-split dialogs, self-hosted variable fonts, SVG poster artwork, pre-generated AVIF/WebP car photos with explicit dimensions (only the hero photo is eager), lazy pre-rendered style tiles, `content-visibility` on below-the-fold sections, immutable caching for fingerprinted assets.
- **Admin:** no admin UI is included. Future admin should be a separate route group/app with its own auth; it must not import from `components/*` and public components must never import admin code.

### Car images (outside the posters)

Studio-style car images are used on the site itself (home hero and car tiles, car pages, configurator thumbnails, share images). **Posters keep their drawn vehicle art** until the AI design pipeline exists.

- **Source of truth:** `photos/manifest.json` — per image: source file, `mode`, crop, cover boxes (plates, faces), focal point, alt text and the credit. A credit is either `third-party` (author, licence, link to the original) or `own` (commissioned, licensed to us or AI-generated: a plain label such as "AI-generated image").
- **Two modes.** `cutout`: the car on a transparent background. The site supplies the showroom (spotlight, floor, reflection, outlined model name, rim light) with CSS, so every car looks like part of one set. `backdrop`: the picture is shown as is (fits dark low-key studio shots).
- **Pipeline:** `npm run photos:cutout` writes the framed originals (`process-photos.mjs --framed`) and removes backgrounds with `rembg` (BiRefNet model; Python, developer tool only; keeps the largest shape, fills holes, feathers and defringes the edge). `npm run photos:process` (`sharp`) trims to the car, covers plates/faces with the car's own colour, and writes AVIF + WebP with transparency at 320/640/1280/1920 px, each file capped at ~300 KB, to `public/cars/<slug>/` plus the generated `src/data/car-photos.ts`. Processed files are committed; builds need neither the network nor Python nor sharp.
- **Runtime:** the repository merges `carPhotos` into `CarGeneration.photos`; UI reads only that. `CarPhotoImage` renders `<picture>` (AVIF → WebP) with fixed `width/height`; `CutoutFit` places a cutout, scaled to fit any box, on the stage (home hero, car tiles, car page, thumbnails, credits). No runtime image service (Workers has none).
- **Fallback:** a car with no image (`photos: []`) keeps its drawn silhouette everywhere (currently the Mercedes-AMG E 63 S and the Toyota GR Supra).
- **Licence rule:** third-party images only under CC0, public domain or CC BY (no NC, ND, SA). Unit tests enforce this, require a credit for every image (and "background removed" for cut-out CC BY images), check that every generated file exists, is under budget and really has (or lacks) transparency, and that `car-photos.ts` matches the manifest. Credits show next to the image and on `/credits`.
- **Image sections are always dark** (`.on-dark`) in both themes.

## 9. Environment variables

| Variable | Scope | Purpose |
| --- | --- | --- |
| `APP_ENV` | server | `development` / `preview` / `production` |
| `NEXT_PUBLIC_SITE_URL` | public, build | canonical origin, metadata, sitemap, extra allowed origin |
| `NEXT_PUBLIC_APP_ENV` | public, build | environment label |
| `NEXT_PUBLIC_ALLOW_INDEXING` | public, build | `true` only for the real launch |
| `PAYMENT_PROVIDER` / `AI_PROVIDER` / `FULFILLMENT_PROVIDER` / `SUPPORT_PROVIDER` | server | provider selection (only `mock` implemented) |
| `CHECKOUT_SIGNING_SECRET` | server secret | signs demo sessions (optional, ≥ 32 chars) |
| `DATABASE_URL`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET`, `AI_API_KEY`, `OPENAI_API_KEY`, `FULFILLMENT_API_KEY`, `EMAIL_API_KEY` | server secrets | **placeholders — not read by any code yet** |

## 10. Cloudflare

- `wrangler.jsonc`: Worker `supercars`, `main: .open-next/worker.js`, static assets binding, `nodejs_compat`, observability on, no routes/domains configured.
- Build: `opennextjs-cloudflare build` (adapts `next build` output). Verified locally by running the built Worker in `workerd` via `wrangler dev` and running the full e2e suite against it.
- Static assets (`.open-next/assets`) are served by Workers Assets and never invoke the Worker; that is why security headers are duplicated into `public/_headers`.
- Size: the Worker script is ~7.9 MiB raw / **~1.5 MiB gzipped**, under the 3 MiB compressed limit of the Workers Free plan (`npm run cf:dryrun` reports it). Static assets (72 files, 3.2 MB) are uploaded separately and do not count toward that limit.
- Alternatives considered: Cloudflare's own `vinext` (Vite reimplementation of Next) is newer and less proven for a store with server routes; if OpenNext ever blocks an upgrade it is the fallback path.
- Bindings for later (KV / D1 / R2 / Rate Limiting / Queues) are added to `wrangler.jsonc` and read in the repository / provider implementations only.

## 11. Where each future integration goes

See [INTEGRATIONS.md](./INTEGRATIONS.md). In one line each: **payments** → `services/stripe/…` + webhook route; **AI / upscaling** → `services/openai/…` behind `AiDesignProvider`; **fulfilment** → `services/prodigi/…`; **email** → new `NotificationProvider`; **support agent** → `SupportProvider`; **storage/CDN** → `DesignAsset.url` + R2; **analytics** → `AnalyticsProvider` registered in `lib/analytics/index.ts`; **database** → `Repositories` returned from `getRepositories()`.

## 12. Intentionally prototype-only

- Payment is a simulation; no provider, no webhook, no card handling.
- Orders are not durable (per-isolate memory + browser localStorage).
- In-memory rate limiting (per isolate).
- Public order lookup takes an order number only.
- Poster vehicle art is generic silhouettes; catalog specs are illustrative.
- The current car images are cut-outs of free-licensed Wikimedia Commons snapshots (event and showroom photos), not studio photography; replace them with owned, licensed or generated studio images before launch (see README, "Car images").
- Prices, shipping rates, delivery estimates and legal text are placeholders.
- `script-src 'unsafe-inline'` (see §7).
- Reviews and social clips are labelled demo content.
