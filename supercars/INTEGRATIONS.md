# Integration map

Nothing here is connected. Every external service is a mock behind an interface (`src/server/services/contracts/`). This file says **where each real integration connects** and what it must do. Rule for all of them: **secrets are read only on the server**, from Cloudflare Worker secrets (`wrangler secret put NAME`) and `.dev.vars` locally — never in a component, a `NEXT_PUBLIC_*` variable, or committed JSON.

General recipe for any provider:

1. Implement the contract in `src/server/services/<vendor>/…`.
2. Add a `case` for it in `src/server/services/index.ts` (`createServices`) and its value to the enum in `src/config/env.ts`.
3. Read its secret with the env schema (fail closed if missing in production).
4. Add unit tests with the vendor's HTTP mocked; run `npm run verify`.
5. Set `<KIND>_PROVIDER=<vendor>` for the environment. UI code does not change.

---

## Payments — Stripe (or similar)

| | |
| --- | --- |
| Contract | `PaymentProvider` — `createCheckoutSession`, `verifyPayment`, `getPaymentStatus` |
| Add | `src/server/services/stripe/payment.ts` |
| Env | `PAYMENT_PROVIDER=stripe`, `PAYMENT_SECRET_KEY`, `PAYMENT_WEBHOOK_SECRET` (server only) |
| Flow | `POST /api/checkout/session` (unchanged) → provider returns a hosted checkout URL → client redirects → **signed webhook** creates the order |
| New route | `src/app/api/webhooks/payment/route.ts`: verify the signature over the *raw* body, be idempotent on the event/order id, then call the same order-creation code as `confirmCheckout` (`checkout-service.ts`) |
| Changes | `CheckoutSession.checkoutUrl` is already in the contract; `CheckoutForm` redirects to it instead of calling `demo-confirm` (which already answers 404 for non-mock providers). Delete the "DEMO PAYMENT" copy. |
| Must keep | Server-side pricing (`server/checkout/pricing.ts`) as the only source of the amount; cart-hash binding; never store or log card data; send only session id / status / URL to the client |

## AI design engine — OpenAI / image generation / upscaling

| | |
| --- | --- |
| Contract | `AiDesignProvider` — `generateVehicleAsset`, `generatePoster`, `upscaleArtwork`, `validateArtwork`, `renderPrintAssets` |
| Add | `src/server/services/openai/design.ts` (and a separate upscaler if needed) |
| Env | `AI_PROVIDER=openai`, `OPENAI_API_KEY` / `AI_API_KEY` (server only) |
| Endpoints | `/api/design/{generate,upscale,validate,render}` already exist and call the provider |
| Result shape | `generateVehicleAsset` returns `{ kind: "image-url", url, width, height }` — `VehicleArt` and every template already render it, so the UI needs no change |
| Before enabling | **Authentication** and **per-account quotas** in `withApi` for these routes (they currently rely on per-IP limits only); a job queue for long generations (Cloudflare Queues) with the job id polled by the client; prompt/input length caps (already enforced by `customizationSchema`); abuse monitoring; a cost ceiling |
| Print pipeline | Generate at working size → upscale → render the template at **exact print dimensions** (`lib/print-spec.ts`: physical size × DPI + bleed) → validate (`effectiveDpi`) → store the five assets. Do not treat resolution names ("8K") as print-readiness |

## Fulfilment — Prodigi / Gelato / other

| | |
| --- | --- |
| Contract | `FulfillmentProvider` — `createOrder`, `getOrderStatus`, `getShipment`, `cancelOrder` |
| Add | `src/server/services/prodigi/fulfillment.ts` |
| Env | `FULFILLMENT_PROVIDER=prodigi`, `FULFILLMENT_API_KEY` (server only) |
| Flow | payment confirmed → design generated → print file validated → `createOrder` (idempotent on our order id) → status webhook / polling updates `OrderRepository` → tracking number → customer notified |
| Map | The vendor's status vocabulary → our `OrderStage` (`confirmed · design · print · shipped · delivered`) and `Shipment` |
| Reads | `/api/orders/lookup`, the success page and `/track` already render `PublicOrderView` / `timeline`; they only need real data behind `OrderRepository` |

## Database — PostgreSQL / Supabase / Cloudflare D1

| | |
| --- | --- |
| Contracts | `CarRepository`, `ProductRepository`, `TemplateRepository`, `OrderRepository`, `CustomerRepository`, `ContentRepository` |
| Add | `src/server/repositories/<db>/…` returning a `Repositories`; switch in `getRepositories()` |
| Env | `DATABASE_URL` (or a D1/Hyperdrive binding in `wrangler.jsonc`) — server only |
| First | `OrderRepository` + `CustomerRepository` (durability), then catalog/prices/templates so an admin can edit them |
| Cleanup | Delete `src/lib/order-store.ts` and the localStorage fallback in `OrderSuccess` / `TrackLookup` once orders are durable |
| Security | Row-level access by order id + email for lookups; never expose internal ids |

## Email (order confirmation, shipping updates)

| | |
| --- | --- |
| Add | A new `NotificationProvider` contract (`sendOrderConfirmation`, `sendShippingUpdate`) + `mock`, wired in `createServices` |
| Env | `EMAIL_API_KEY` (server only) |
| Triggers | After order creation (webhook) and on fulfilment status changes; run through a queue with retries |
| Note | The success page currently says a confirmation "would be sent" — update that copy when this is real. Do not put customer email in URLs or logs. |

## Customer support — AI agent

| | |
| --- | --- |
| Contract | `SupportProvider` — `answerCustomer`, `getOrderStatus`, `getProductInfo`, `getTracking`, `createSupportTicket`, `escalateToHuman` |
| Add | `src/server/services/ai-agent/support.ts` |
| Env | `SUPPORT_PROVIDER=ai-agent` + the model key |
| Endpoint | `POST /api/support/message` already exists (500-char cap, rate limited); the chat drawer calls only this |
| Guardrails | The agent's tools may only call the *public* projections (`PublicOrderView`), never raw customer data; treat all message content as untrusted (prompt injection); never let it change orders or refunds without a human; keep the "AI assistant" disclosure; store transcripts only with a retention policy |

## Analytics — Google Analytics / Meta Pixel / TikTok Pixel / server-side events

| | |
| --- | --- |
| Contract | `AnalyticsProvider.track(event, props)` (client); server-side events would be a sibling contract called from the webhook |
| Add | `src/lib/analytics/ga.ts`, `meta.ts`, `tiktok.ts`; register them in `providers` in `src/lib/analytics/index.ts` **after consent** |
| Events (typed) | `page_view · car_search · car_selected · style_selected · size_selected · preview_generated · add_to_cart · checkout_started · demo_purchase_completed` (`domain/analytics.ts`) |
| Must change | The CSP is currently `'self'`-only. Adding any vendor script requires extending `src/config/security-headers.ts` (script/connect/img) deliberately, adding a consent banner, and re-evaluating the `'unsafe-inline'` trade-off (see ARCHITECTURE §7). |
| Privacy | Props are sanitized to primitives and must never contain names, emails, addresses or free text. `demo_purchase_completed` becomes `purchase_completed` with value/currency from the *server's* order. |

## Storage / CDN — R2 or similar object storage

| | |
| --- | --- |
| Use for | The five design assets per order (`web_preview`, `social_image`, `print_image`, `print_pdf`, `master_source`), and marketing clips for the "Seen on the feed" section |
| Add | An R2 bucket binding in `wrangler.jsonc`; a `StorageProvider` used by the AI/fulfilment providers |
| Wire | `DesignAsset.url` (already optional) and `MediaItem.videoUrl / posterUrl` (already in `domain/content.ts`) — components already accept them |
| Security | Private buckets with short-lived signed URLs for print files; public bucket only for marketing media; never accept client-supplied object keys |

## Car photography — your own photos, or a licensed library

Today: 11 free-licensed Wikimedia Commons photos (credits on `/credits`). To use your own photography:

1. Put the JPEG masters in `assets-src/cars/<slug>/main.jpg` (or point a manifest entry at a URL you own).
2. Edit `photos/manifest.json`: `credit` (author = you, licence = `Copyright SuperCars` — and relax the allow-list in `tests/unit/car-photos.test.ts` deliberately), `crop`, `redact` (plates, faces), `focal`, `alt`.
3. `npm run photos:process`, commit `public/cars/**` and `src/data/car-photos.ts`.

With object storage (R2) the same files move to a bucket and `photoPath()` in `src/lib/car-photo.ts` returns the CDN URL; the components do not change.

## Marketing content / CMS

`src/data/media.ts` and `reviews.ts` are shaped for a CMS. Replace their repository (`ContentRepository`) with a CMS fetch; the components need no change. Real reviews must replace the demo ones, and the "Demo content" labels are removed at the same time.

## Rate limiting (production)

Replace `InMemoryRateLimiter` (per isolate) with Cloudflare's Rate Limiting binding or a Durable Object implementing `RateLimiter`. Keep `rateLimitPolicies`. Also add a Cloudflare WAF rate-limit rule on `/api/*` and Turnstile on checkout / support if abuse appears.

## Admin (not built)

Build separately (own route group or app, own authentication, role checks on every server function). It manages cars, assets, templates, products, prices, orders, customers, fulfilment, AI jobs, support and analytics through the same repositories and services. Public code must not import admin modules, and admin routes must not be reachable without authentication.
