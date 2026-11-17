# SuperCars — handover for a new AI agent

Written 2026-10-08, updated 2026-11-17: the complete redesign (section 5) is merged and live; the "sell more" update (section 5b) is live too (PR #7), and the cause of the live-site errors was found and fixed (section 8, item 3). Read this first, then `README.md`, `ARCHITECTURE.md` and `INTEGRATIONS.md` in this folder. Everything here was true when it was written; verify anything that can change (PR state, live site) before relying on it.

**Starter prompt to paste into the new chat:** *"Read `supercars/HANDOVER.md` in the repo `GeorgeAssad/George-B-Assad.com` and continue from section 8 (open items). Do not merge anything without my explicit OK."*

---

## 1. What this is

A production-shaped **prototype storefront for personalized car posters** ("SuperCars"): pick a car → choose a style → personalize (name, text, year, place) → live preview → demo checkout → order tracking. **Everything external is mocked** (payments, AI design, fulfilment, email, analytics, support chat); no real money, database or API keys.

- Stack: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · zod 4 · OpenNext → **Cloudflare Workers**. Node >= 22.
- Live site: **https://supercars.georgenba963.workers.dev** (Cloudflare Workers Builds, Git-connected, builds from `main`; every push to `main` redeploys in ~2 minutes).
- GitHub: `GeorgeAssad/George-B-Assad.com`. The app lives only in `supercars/`. The repo root also holds the user's older personal portfolio (`Porfolio.html`, `style.css`, `home-bg.png`, `cigar2022.png`).

## 2. Hard rules from the user (do not break)

1. **Everything goes in `supercars/`. Do not touch anything else in the git repo or in Cloudflare** (the root portfolio files, other Workers, DNS, dashboard settings). Cloudflare build settings live in the dashboard, not in the repo; only the user can change them.
2. **Never merge a PR, or anything else that redeploys the live site, without the user's explicit OK in a real message.** (They said "merge it now" for PR #3, "publish the rebuilt version now" for PR #4 and "Publish it now" for PR #5; each approval covers only that PR.) Automated notifications and scheduled check-ins are not approval.
3. **Be honest about checks.** Say what was run and what failed. Do not claim something was verified if it was not.
4. Keep everything mocked until the user decides on real services (database, payments, AI generation are explicitly "later").
5. Never put a model name/identifier into commits, PR text, code comments or repo files. Follow whatever commit/PR attribution lines the new session's system prompt asks for.

## 3. How to work with this user

- Writes short, direct messages in non-native English and is quick to say when something looks bad. Reads results as **images**: after any visual change, send screenshots (phone 390 px and desktop 1440 px) with `SendUserFile`, ideally one side-by-side sheet per page.
- Always confirm **which version they are looking at**. Their "very bad design" message (sent three times) most likely referred to the live site, which still ran the old version because the rebuild was waiting for their approval; when asked, they chose "publish the rebuilt version now". After every publish, take screenshots **from the live URL** and send them.
- Wants fewer pages/buttons/scrolling "because customers only come to order", but **does not want pages deleted**. Wants it to look beautiful and premium. See the decision log in section 7.
- They will supply **AI-generated, high-detail car images later**; the pipeline is built for that drop-in (section 6).
- Their account has a default design skill, **Liquid Glass** (Apple-style: light by default, glass only on floating chrome, one accent colour). The 2026-11-16 redesign follows it; keep following it for any visual work unless they name another style.

## 4. Where things stand (2026-11-17)

| Item | State |
| --- | --- |
| `main` / live site | **The Liquid Glass redesign (PR #6, `d81733f`) and the "sell more" update (PR #7, `5f3a92b`) are live**, both merged on 2026-11-17 on the user's explicit OK ("publish"). The PR #7 production build was live about 5 minutes after the merge; screenshots from the live URL were sent to the user. |
| Live site reliability | After PR #7 about 1 in 4 requests failed (1102 and plain 500). Root cause found: the Worker re-rendered every page on every visit (no cache). Fixed by the page-cache change (section 8, item 3), published on the user's approval of that plan. |
| Local working tree | clean; everything is pushed |

Branch workflow: develop on `claude/adoring-euler-hy534z`. If its PR is merged, restart the branch from the latest `origin/main` (same name, `git checkout -B claude/adoring-euler-hy534z origin/main`, force-with-lease push) and open a **new draft PR**. After pushing, always open a draft PR if none exists for the branch. Merging uses a merge commit (like #3 and #4).

**Cloudflare "Workers Builds: supercars" check is red on every non-production branch/PR — cause known (2026-11-17).** The user pasted the preview build log: the non-production deploy command is `npx wrangler preview`, which failed with "Your Wrangler configuration is missing a `previews` block", and no install/build step ran before it (no `npm ci`, no `cf:build`). The dashboard's **Builds → Previews Base** tab explains why: Build command `None`, Preview command `npx wrangler preview`, Root directory `/` (not `supercars`); the Production tab is correct (Build `npm ci && npm run cf:build`, Deploy `npx wrangler deploy`, Root `supercars`, build variables set). It never affected the live site: production builds of `main` run the full build and succeed. The user chose to **turn off preview builds** in the dashboard (Workers → `supercars` → Settings → Builds → **Previews Base** tab → switch "Builds for Preview branches" off; never the "Disable builds" on the Production tab, which stops live deploys); after that the check should no longer appear. If they ever want preview links instead: add `"previews": {}` to `wrangler.jsonc` and have them set, on the Previews Base tab, Root directory `supercars` and Build command `npm ci && npm run cf:build`.

## 5. The redesign (PR #6, merged and live) in short

On 2026-11-16 the user asked: *"completely re-design this site, I need it the most beautiful site ever."* The whole look was rebuilt on the Liquid Glass kit; pages, routes, the 4-step designer flow and all mocked back-end code are unchanged.

- **Design system:** `src/styles/liquid-glass.css` is the kit, verbatim. `src/app/globals.css` puts the brand on top (SuperCars red as the one accent, San Francisco/Inter type) and defines the site's few classes. Light by default, dark follows the device or the light/dark switch in the top bar. Glass only on floating chrome (header, phone action bar, toasts, drawers, the control card over the hero stage). One dark area per page at most: the product stage (`.stage.scope-dark`).
- **Home:** a hero that fits the first screen (headline, the one Create button, a stage with the car, its framed poster and a five-style picker that works without JavaScript), a row of facts, the car picker and the four steps.
- **Other pages:** Cars (search + filters + tiles), car page (facts + stage + five styles), Shop (two pricing cards), How it works, About, legal pages; the designer, cart, checkout, confirmation, tracking and chat were restyled without changing behaviour.
- **Copy changes worth knowing:** the designer's empty search now says "No car matched your search."; the checkout payment card is headed "Payment" (the label "Secure checkout" was dropped, since it is a demo); prices are neutral text, red is kept for actions.
- **Verification on the pushed head:** `npm run verify` (lint, typecheck, 109 unit tests, secret scan, code audit, build, bundle scan) passed; full Playwright run against `next start` passed (76 passed, 0 failed, 16 skipped by design, desktop + phone, including axe WCAG 2.1 AA in light and dark and the no-horizontal-scroll matrix at 8 widths); `cf:build` and `cf:dryrun` passed (Worker 7886 KiB, 1581 KiB gzip). The Liquid Glass kit's audit (its `qa.py` audit function driven by Node Playwright) leaves only false contrast alarms for text drawn inside the poster SVGs and warnings for 36 px pills whose tap area is extended to 44 px. Not run: `wrangler dev` (workerd) specs and a fresh-clone build. Comparison screenshots of every page (phone + desktop, dark mode for the main ones) were sent to the user.

## 5b. "Sell more" update (PR #7, merged and live)

Asked 2026-11-17: *"re-design the sections and parts of the site, the pages … to sell more, and to make the best user experience."* The user chose: longer selling pages are fine; labelled example reviews; offers they switch on only when they want (a timed discount with a countdown, free shipping above an amount); upgrade to framed; gift options; **the 4-step designer stays the only way to order** (no ordering straight from a car page).

- **Offers:** `src/config/promotions.ts` (owner's schedule, empty by default) + `src/lib/promotions.ts` (validation, which offer is on) + server pricing; banner with countdown, offer prices, cart free-shipping progress. **Free shipping over €100 is no longer permanent**: it is an offer now, as the user asked. How to add an offer: README "Offers". When the user says "15% for 3 hours from now", add one line with their times (ask their time zone if unknown), open a PR, and merge only on their OK.
- **Gift** option at checkout, **upgrade to framed** in the cart and the review step, **example reviews** (`src/content/example-reviews.ts`, always labelled), shared **FAQ** (`src/content/faq.ts`).
- **Pages:** Home (benefits, styles wall, gift, steps, reviews, questions), car page as a product page (breadcrumb, delivery estimate, sizes table, similar cars, follow bar on phones), Shop (size guide to scale, reviews, questions), Cars ("Can't find your car? Ask us"). On Home the header's Create button appears once the hero's has scrolled away.
- Not done on purpose: no damage/reprint promise (returns policy not final; ask the user), no star ratings or review counts.

## 6. Codebase map and rules

```
src/app/          routes (/, /cars, /cars/[slug], /shop, /how-it-works, /about, /create, /checkout,
                  /order/success/[id], /track, /shipping, /privacy, /terms, /legal, /credits), API routes, sitemap
src/components/   showroom (PageHero, PlanCard, WallPoster) · home (HomeHero, HeroStudio, HomeSections) · cars (CarStage,
                  CarTile, CarExplorer, StyleStrip) · configurator · poster · layout (Header with the only navigation)
                  · cart · checkout · orders · support · ui
src/styles/liquid-glass.css   the design kit, verbatim (tokens + .lg-* components); brand values live in src/app/globals.css
src/config/nav.ts primaryNav (header + phone menu) and footerLinks (legal only)
src/lib/layout-rules.ts   decides where the header's Create button hides
src/data/         demo data; car-photos.ts is GENERATED by scripts/process-photos.mjs
photos/manifest.json      source of truth for car images (crop, redact boxes, credits, mode cutout|backdrop)
tests/unit (Vitest, 109 tests) and tests/e2e (Playwright, desktop + mobile projects)
```

**Design rules, each enforced by tests (`tests/e2e/funnel.spec.ts`, `tests/unit/site-structure.test.ts`):**
- Navigation only in the header (Cars, Shop, How it works, About, Track order, cart); on phones the same links are in one menu. Footer = legal links, chat, theme. No bottom tab bar, no floating chat button.
- **One generic "Create your poster" button per page**: in the hero on Home, in the header elsewhere (none on `/create`; checkout's empty cart offers its own). Contextual starts that name their job are fine (a car tile, "Create this car", a style's "Design this poster", "Design a framed poster").
- Length budgets (page height ÷ viewport at 390×844, 768×1024, 1440×900) are per page and per screen in `tests/e2e/funnel.spec.ts`: Home under 3 screens, other pages under 2 on laptop/tablet and under 2.75 on a phone, `/track` one screen. Home's headline, Create button and product stage fit the first screen; so does a car page's Create button.
- Light is the default theme; the product stage (`.stage.scope-dark`) is dark in both themes and is the only dark area on a light page. Axe WCAG 2.1 AA must stay clean in both themes; no horizontal scroll at 8 widths.
- Liquid Glass rules: one accent (red) for things you can act on; glass only on floating chrome; content on solid cards; no bottom tab bar; small labels are sentence case (no uppercase tracked micro-text).
- The designer (`/create`) has 4 steps (Car → Design → Personalize → Review). The user accepted it; **do not change its flow**, only visuals.
- `src/data/*` is never imported by UI (ESLint-enforced); read through repositories.
- Known weak spot: the posters themselves use generic drawn vehicle silhouettes (`VehicleArt`), not the real car. The planned fix is real AI generation (`INTEGRATIONS.md`).

**Commands** (run in `supercars/`): `npm ci`, `npm run dev`, `npm run verify` (lint, typecheck, unit tests, secret scan, code audit, build, bundle scan), `npm run cf:build`, `npm run cf:dryrun`, `npm run cf:preview` (workerd), `npm run test:e2e` (needs a server on `E2E_BASE_URL`, default `http://localhost:3111`; Chromium at `/opt/pw-browsers/chromium` by default, see `playwright.config.ts`). To test on the real Workers runtime: `npx wrangler dev --port 8799` after `cf:build`, then `E2E_BASE_URL=http://localhost:8799 npx playwright test ...`.

**Car image pipeline.** `assets-src/` is git-ignored, so a fresh clone has no originals or cut-outs. To re-tune images: `npm run photos:fetch` (downloads the Wikimedia originals) → `npm run photos:cutout` (needs a Python venv with `rembg[cpu] pillow numpy scipy`; BiRefNet model; slow) → `npm run photos:process` (~3 min for all cars; `--only <slug>` for one). Processed files in `public/cars/` and `src/data/car-photos.ts` are committed, so builds never need Python. Each file is capped at 300 KB (unit-tested). **Drop-in for AI images:** put the original at `assets-src/cars/<slug>/main.png`, edit that car's entry in `photos/manifest.json` (`credit.kind: "own"`, `"grade": false` if it already has studio lighting, `alreadyTransparent: true` if it has no background), run `photos:process`, commit `public/cars/**`, `src/data/car-photos.ts` and the manifest. Details in README "Car images". Third-party photos are CC0/CC BY only and credited on car pages and `/credits`; keep that.

## 7. Decision log (what the user liked and rejected)

1. Started from drawn silhouettes; user wanted **real car photos** → added Wikimedia CC0/CC BY photos (PR #2).
2. User disliked event/street photos with crowds; asked for **studio shots with the background removed**; then said they will supply AI images later → built the cut-out pipeline and a studio/showroom look (PR #3).
3. User asked to cut sections, pages and repeated buttons ("customers only come to order") → I over-corrected and **deleted Cars, Shop, How it works and About**. User: *"very bad design … optimize it smartly, not delete all pages, re-make it as a beautiful website."* Answers they gave: bring those four pages back; look = **cinematic dark showroom, richer**; keep live until approved.
4. Showroom v2 (PR #4) built that and was published on their OK. They then said the **car images look poor** → PR #5.
5. Configurator: merge tiny steps into bigger useful ones only (done: 6 → 4 steps). Nothing else there.
6. 2026-11-16: user asked for a **complete redesign, "the most beautiful site ever"** → rebuilt in the Liquid Glass style (their default design skill): light, calm, one red accent, glass chrome, the product on a dark stage (PR #6, section 5). They saw full comparison sheets of every page and said "publish" on 2026-11-17; it is live. Their reaction to the live site is not known yet.

## 8. Open items, in order

1. **Watch live-site reliability after the page-cache fix** (item 3). If 1102/500 errors remain, the next step is the user's choice of the Workers Paid plan; ask before any other change.
2. **Feedback on the live redesign.** If the user wants changes, make them on `claude/adoring-euler-hy534z` (restarted from `main` after each merge), send screenshots, and merge only on their explicit OK.
3. **Live-site reliability (Cloudflare error 1102) — root cause found and fixed on 2026-11-17.** Every live page answered `x-nextjs-prerender: 1` with `x-nextjs-cache: MISS`: `open-next.config.ts` had no incremental cache, so the Worker **re-rendered every page on every request**, which goes over the Free plan's per-request CPU limit (after PR #7's longer pages: 7/30, 6/60 and 19/40 requests failed, as `error code: 1102` or a plain `Internal Server Error`). Fix: `open-next.config.ts` uses the read-only **static-assets incremental cache** with `enableCacheInterception: true`, and `npm run cf:build` runs `opennextjs-cloudflare populateCache local`, which copies the built pages into `.open-next/assets/cdn-cgi/_next_cache` (private to the Worker). Cloudflare's build and deploy commands are unchanged (`npx wrangler deploy` would not populate the cache by itself). Pages are then served with `x-opennext-cache: HIT` without starting the renderer. Constraint: this cache is read-only, so it suits only pages built ahead of time; if a page ever needs timed revalidation (`revalidate`), switch to a KV/R2 cache (which needs Cloudflare resources the user must approve). History of the problem: **found right after PR #5 went live.** Measured on 2026-10-08 against `https://supercars.georgenba963.workers.dev` with sequential `curl` from the session sandbox: 84 page requests over ~10 minutes, **37 failed** (503 with the body `error code: 1102`, plus ~20 s hangs); separate runs of 25 requests each failed 6 times for `/api/health`, 4 for `/robots.txt` and 6 for `/about`, so **even trivial Worker routes fail**, while static files served directly from assets (car images, `/_next/static`) always returned 200. 1102 means "Worker exceeded resource limits" (CPU time or memory per request). Earlier the same day, right after PR #4, a 42-request check (14 routes × 3) and two browser runs were clean, and before PR #4 about 5–10 % of requests failed, so the problem pre-dates PR #5 and varies a lot over time; PR #5 (images are assets, plus small UI changes, Worker size 7874 → 7875 KiB) is unlikely to be the cause but that is not proven. Working hypothesis (unverified): on Cloudflare's **Free plan (10 ms CPU per request)** the ~7.9 MiB OpenNext Worker uses too much CPU per request or on cold start. How to confirm: the user opens Cloudflare → Workers → `supercars` → Metrics (errors, CPU time p50/p99) and confirms the plan. Options for the user: (a) Workers Paid plan (about 5 USD/month; much higher CPU limit), which most likely removes the errors and needs no code change; (b) code-side work to cut per-request CPU or Worker size, which cannot be proven locally (local `workerd` does not enforce the Free-plan limit) and would need trial deploys to production, so ask before doing it; (c) the redesign turns off Next's link prefetching on navigation links and tiles (`prefetch={false}`), which cuts the number of Worker requests per page view but does not remove the limit; (d) do **not** set `limits.cpu_ms` in `wrangler.jsonc` on a Free plan: it can make the deploy fail. Do not change anything in the Cloudflare dashboard yourself.
4. **Get the AI images** from the user (which cars, format, with or without background) and run the drop-in workflow above. This is the real answer to "images look poor".
5. **User-side Cloudflare items:** the build variables `NEXT_PUBLIC_SITE_URL` (the live URL), `NEXT_PUBLIC_APP_ENV=production` and `NEXT_PUBLIC_ALLOW_INDEXING=false` **are set** (seen in the dashboard on 2026-11-17). Still open: optionally set the runtime secret `CHECKOUT_SIGNING_SECRET` (32+ random characters; never put it in the repo). The site works without it.
6. Later, when the user decides: real database, payments, AI design generation, fulfilment, email (all behind the repository/service interfaces; see `INTEGRATIONS.md`). Using real manufacturers' cars on merchandise may raise trademark/design-right questions; the user should have a lawyer review before a real launch.
7. If the user still dislikes the look after the redesign, **ask for concrete references** (screenshots or links of sites they like, or what exactly feels bad) instead of redesigning blind. When asked what felt bad they picked only "the car images look poor" (not "too dark", "plain/cluttered" or "too many buttons/scrolling").

## 9. Practical gotchas

- **Stop any `next start` server before `npm run verify` or `npm run cf:build`**; they rebuild `.next` and break a running server. Stale `.next` types cause bogus `tsc` errors after deleting pages: `rm -rf .next`.
- Do not run `pkill -f "<pattern>"` where the pattern also appears in your own command line; it kills your own shell (exit 144). Kill by PID.
- The shell safety classifier sometimes errors transiently; retrying once usually works, and file edits via the editor tool still work meanwhile.
- Outbound HTTPS goes through the agent proxy (`/root/.ccr/README.md`). Node `fetch` needs `NODE_USE_ENV_PROXY=1`. Browser checks against the live URL need Chromium started with `--ignore-certificate-errors-spki-list=<SPKI hash of the proxy CA>` (never disable TLS verification in general). Wikimedia needs polite, serial requests; use `commons.wikimedia.org/w/thumb.php` for thumbnails.
- Entrance animations (`.drive-in`, `.stagger`) take ~1.3 s; wait before screenshots or use `reducedMotion: "reduce"`. Full-page screenshots show fixed bars mid-page; that is an artifact.
- Tailwind v4: a class defined in `@layer components` has no responsive variants (`sm:container-x` does nothing), and unlayered CSS beats utilities. Custom properties resolve where they are declared, so the site's alias tokens are declared on both `:root` and `.scope-dark`.
- Selectable cards (`RadioCard`, the hero swatches) use a real radio input stretched invisibly over the whole card; keep it that way (clicks, screen readers and the tests rely on it).
- The Liquid Glass kit ships a QA script (`scripts/qa.py` in the skill folder) that needs Python Playwright and local HTML files; this session ran its audit function through Node Playwright against the running site instead.
- Playwright tests run one worker and take about 7–8 minutes for the full suite (desktop + mobile).

## 10. Where to find more

- This session: https://claude.ai/code/session_01Y5xeqZSzBeaEcyTfuFvrQh (full history). The local transcript, if still on disk, is `/root/.claude/projects/-home-user-George-B-Assad-com/c1e3fd3e-d14f-57ab-b18a-e7957f5fa397.jsonl`.
- PRs: #1 initial prototype, #2 photos, #3 order-first, #4 Showroom v2, #5 image polish, #6 the Liquid Glass redesign (all merged) at https://github.com/GeorgeAssad/George-B-Assad.com/pulls?q=is%3Apr
- Docs in this folder: `README.md` (run, deploy, pages, car images), `ARCHITECTURE.md` (frontend, security, mocks to real services), `INTEGRATIONS.md` (where each real integration plugs in).
