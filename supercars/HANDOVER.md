# SuperCars — handover for a new AI agent

Written 2026-10-08 at the end of a long working session. Read this first, then `README.md`, `ARCHITECTURE.md` and `INTEGRATIONS.md` in this folder. Everything here was true when it was written; verify anything that can change (PR state, live site) before relying on it.

**Starter prompt to paste into the new chat:** *"Read `supercars/HANDOVER.md` in the repo `GeorgeAssad/George-B-Assad.com` and continue from section 8 (open items). Do not merge anything without my explicit OK."*

---

## 1. What this is

A production-shaped **prototype storefront for personalized car posters** ("SuperCars"): pick a car → choose a style → personalize (name, text, year, place) → live preview → demo checkout → order tracking. **Everything external is mocked** (payments, AI design, fulfilment, email, analytics, support chat); no real money, database or API keys.

- Stack: Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind v4 · zod 4 · OpenNext → **Cloudflare Workers**. Node >= 22.
- Live site: **https://supercars.georgenba963.workers.dev** (Cloudflare Workers Builds, Git-connected, builds from `main`; every push to `main` redeploys in ~2 minutes).
- GitHub: `GeorgeAssad/George-B-Assad.com`. The app lives only in `supercars/`. The repo root also holds the user's older personal portfolio (`Porfolio.html`, `style.css`, `home-bg.png`, `cigar2022.png`).

## 2. Hard rules from the user (do not break)

1. **Everything goes in `supercars/`. Do not touch anything else in the git repo or in Cloudflare** (the root portfolio files, other Workers, DNS, dashboard settings). Cloudflare build settings live in the dashboard, not in the repo; only the user can change them.
2. **Never merge a PR, or anything else that redeploys the live site, without the user's explicit OK in a real message.** (They said "merge it now" for PR #3 and "publish now" for PR #4; those approvals do not carry over to later PRs.) Automated notifications and scheduled check-ins are not approval.
3. **Be honest about checks.** Say what was run and what failed. Do not claim something was verified if it was not.
4. Keep everything mocked until the user decides on real services (database, payments, AI generation are explicitly "later").
5. Never put a model name/identifier into commits, PR text, code comments or repo files. Follow whatever commit/PR attribution lines the new session's system prompt asks for.

## 3. How to work with this user

- Writes short, direct messages in non-native English and is quick to say when something looks bad. Reads results as **images**: after any visual change, send screenshots (phone 390 px and desktop 1440 px) with `SendUserFile`, ideally one side-by-side sheet per page.
- Always confirm **which version they are looking at**. Their "very bad design" message (sent three times) most likely referred to the live site, which still ran the old version because the rebuild was waiting for their approval; when asked, they chose "publish the rebuilt version now". After every publish, take screenshots **from the live URL** and send them.
- Wants fewer pages/buttons/scrolling "because customers only come to order", but **does not want pages deleted**. Wants it to look beautiful and premium. See the decision log in section 7.
- They will supply **AI-generated, high-detail car images later**; the pipeline is built for that drop-in (section 6).

## 4. Where things stand (2026-10-08)

| Item | State |
| --- | --- |
| `main` | `64012ba` — PR #3 (order-first, studio cut-outs) and PR #4 (Showroom v2: all pages back) merged and **live** |
| PR #5 | **Open draft**, branch `claude/adoring-euler-hy534z` (image commit `4c7f8f8`, plus this file as `30db424`). "Car images polish" (section 5). **Waiting for the user's decision to publish.** Merging it also adds this file to `main`. |
| Live site | 200 on `/`, `/shop`, car pages; shows Showroom v2 (with the pre-PR-#5 images) |
| Local working tree | clean; everything is pushed |

Branch workflow: develop on `claude/adoring-euler-hy534z`. If its PR is merged, restart the branch from the latest `origin/main` (same name, `git checkout -B claude/adoring-euler-hy534z origin/main`, force-with-lease push) and open a **new draft PR**. After pushing, always open a draft PR if none exists for the branch. Merging uses a merge commit (like #3 and #4).

**Cloudflare "Workers Builds: supercars" check is always red on non-production branches/PRs.** It starts and completes in the same second, so no build runs. Cause not diagnosed (dashboard build logs are only visible to the user). It has been red on every feature PR; production builds of merged code succeed. Do not chase it in code. Pointing the user at Cloudflare → Workers → `supercars` → Settings → Builds → non-production branch builds is a reasonable suggestion, not a verified fix.

## 5. PR #5 in one paragraph

The user's last design complaint was "the car images look poor". PR #5 changes only images and their presentation: plate/face/sticker redactions are filled by smooth diffusion of the car's own surroundings instead of flat grey blocks (`sample: "dark"` in the manifest for boxes on a grille/window); every cut-out gets one studio grade (median brightness nudged toward a target, slightly richer colour, smoothed alpha edge; `"grade": false` skips it); soft contact shadow under each car (`.studio-contact` in `globals.css`, rendered by `CutoutFit`); the two cars without a photo (GR Supra, E 63 S) show a light-line silhouette with "Photo soon". Verified on the exact head: `npm run verify`, 74 Playwright tests passed (16 skipped by design), `cf:build` + `cf:dryrun`, 28 specs under `wrangler dev` (workerd), fresh-clone `npm ci && npm run cf:build`. Before/after images were sent to the user. It is **not** a substitute for the AI images.

## 6. Codebase map and rules

```
src/app/          routes (/, /cars, /cars/[slug], /shop, /how-it-works, /about, /create, /checkout,
                  /order/success/[id], /track, /shipping, /privacy, /terms, /legal, /credits), API routes, sitemap
src/components/   showroom (ShowroomStage, PageHero, HeroCar, WallPoster, ProductScene) · home · cars · configurator
                  · poster · layout (Header with the only navigation) · cart · checkout · orders · ui
src/config/nav.ts primaryNav (header + phone menu) and footerLinks (legal only)
src/lib/layout-rules.ts   decides where the header's Create button hides
src/data/         demo data; car-photos.ts is GENERATED by scripts/process-photos.mjs
photos/manifest.json      source of truth for car images (crop, redact boxes, credits, mode cutout|backdrop)
tests/unit (Vitest, 109 tests) and tests/e2e (Playwright, desktop + mobile projects)
```

**Design rules, each enforced by tests (`tests/e2e/funnel.spec.ts`, `tests/unit/site-structure.test.ts`):**
- Navigation only in the header (Cars, Shop, How it works, About, Track order, cart); on phones the same links are in one menu. Footer = legal links, chat, theme. No bottom tab bar, no floating chat button.
- **One generic "Create your poster" button per page, in the header** (none on `/create`; checkout's empty cart offers its own). Contextual starts that name their job are fine (a car tile, "Create this car", a style on a car page, "Design a framed poster").
- Length budgets (page height ÷ viewport at 390×844, 768×1024, 1440×900): Home <= 2 screens, other pages <= 1.75, `/track` one screen; all 12 home tiles and the car page's Create button are on the first screen.
- Light theme keeps showroom stages dark (`.on-dark`); the rest follows the theme. Axe WCAG 2.1 AA must stay clean in both themes; no horizontal scroll at 8 widths.
- The designer (`/create`) has 4 steps (Car → Design → Personalize → Review). The user accepted it; **do not change its flow**, only visuals.
- `src/data/*` is never imported by UI (ESLint-enforced); read through repositories.
- Known weak spot: the posters themselves use generic drawn vehicle silhouettes (`VehicleArt`), not the real car. The planned fix is real AI generation (`INTEGRATIONS.md`).

**Commands** (run in `supercars/`): `npm ci`, `npm run dev`, `npm run verify` (lint, typecheck, unit tests, secret scan, code audit, build, bundle scan), `npm run cf:build`, `npm run cf:dryrun`, `npm run cf:preview` (workerd), `npm run test:e2e` (needs a server on `E2E_BASE_URL`, default `http://localhost:3111`; Chromium at `/opt/pw-browsers/chromium-1194/chrome-linux/chrome` by default, see `playwright.config.ts`). To test on the real Workers runtime: `npx wrangler dev --port 8799` after `cf:build`, then `E2E_BASE_URL=http://localhost:8799 npx playwright test ...`.

**Car image pipeline.** `assets-src/` is git-ignored, so a fresh clone has no originals or cut-outs. To re-tune images: `npm run photos:fetch` (downloads the Wikimedia originals) → `npm run photos:cutout` (needs a Python venv with `rembg[cpu] pillow numpy scipy`; BiRefNet model; slow) → `npm run photos:process` (~3 min for all cars; `--only <slug>` for one). Processed files in `public/cars/` and `src/data/car-photos.ts` are committed, so builds never need Python. Each file is capped at 300 KB (unit-tested). **Drop-in for AI images:** put the original at `assets-src/cars/<slug>/main.png`, edit that car's entry in `photos/manifest.json` (`credit.kind: "own"`, `"grade": false` if it already has studio lighting, `alreadyTransparent: true` if it has no background), run `photos:process`, commit `public/cars/**`, `src/data/car-photos.ts` and the manifest. Details in README "Car images". Third-party photos are CC0/CC BY only and credited on car pages and `/credits`; keep that.

## 7. Decision log (what the user liked and rejected)

1. Started from drawn silhouettes; user wanted **real car photos** → added Wikimedia CC0/CC BY photos (PR #2).
2. User disliked event/street photos with crowds; asked for **studio shots with the background removed**; then said they will supply AI images later → built the cut-out pipeline and a studio/showroom look (PR #3).
3. User asked to cut sections, pages and repeated buttons ("customers only come to order") → I over-corrected and **deleted Cars, Shop, How it works and About**. User: *"very bad design … optimize it smartly, not delete all pages, re-make it as a beautiful website."* Answers they gave: bring those four pages back; look = **cinematic dark showroom, richer**; keep live until approved.
4. Showroom v2 (PR #4) built that and was published on their OK. They then said the **car images look poor** → PR #5.
5. Configurator: merge tiny steps into bigger useful ones only (done: 6 → 4 steps). Nothing else there.

## 8. Open items, in order

1. **Ask the user whether to publish PR #5.** If yes: mark ready for review, merge with a merge commit, wait ~2 minutes for the Workers Build, then verify the live URL (all routes 200, car images load, screenshots from the live URL sent to the user). If they want changes, iterate on the branch first.
2. **Get the AI images** from the user (which cars, format, with or without background) and run the drop-in workflow above. This is the real answer to "images look poor".
3. **User-side Cloudflare items:** set build variables `NEXT_PUBLIC_SITE_URL` (the live URL), `NEXT_PUBLIC_APP_ENV=production`, `NEXT_PUBLIC_ALLOW_INDEXING=false` and retry the build; optionally set the runtime secret `CHECKOUT_SIGNING_SECRET` (32+ random characters; never put it in the repo). Without these the site still works.
4. **Intermittent failures:** earlier (before PR #4) about 1 in 10 requests to the live site briefly returned 503 or hung, across all routes; cause unknown (my sandbox proxy, or the Cloudflare Free-plan CPU limit on a ~7.9 MiB Worker). After PR #4, all 42 requests in a 14-route check (3 each) returned the expected status (200, or 308 for the two old redirected URLs). If it returns, Cloudflare → Workers → `supercars` → Metrics/Logs is the place to look (only the user can see it).
5. Later, when the user decides: real database, payments, AI design generation, fulfilment, email (all behind the repository/service interfaces; see `INTEGRATIONS.md`). Using real manufacturers' cars on merchandise may raise trademark/design-right questions; the user should have a lawyer review before a real launch.
6. If the user still dislikes the look after PR #5, **ask for concrete references** (screenshots or links of sites they like, or what exactly feels bad) instead of redesigning blind. When asked what felt bad they picked only "the car images look poor" (not "too dark", "plain/cluttered" or "too many buttons/scrolling").

## 9. Practical gotchas

- **Stop any `next start` server before `npm run verify` or `npm run cf:build`**; they rebuild `.next` and break a running server. Stale `.next` types cause bogus `tsc` errors after deleting pages: `rm -rf .next`.
- Do not run `pkill -f "<pattern>"` where the pattern also appears in your own command line; it kills your own shell (exit 144). Kill by PID.
- The shell safety classifier sometimes errors transiently; retrying once usually works, and file edits via the editor tool still work meanwhile.
- Outbound HTTPS goes through the agent proxy (`/root/.ccr/README.md`). Node `fetch` needs `NODE_USE_ENV_PROXY=1`. Browser checks against the live URL need Chromium started with `--ignore-certificate-errors-spki-list=<SPKI hash of the proxy CA>` (never disable TLS verification in general). Wikimedia needs polite, serial requests; use `commons.wikimedia.org/w/thumb.php` for thumbnails.
- Entrance animations (`.drive-in`, `.stagger`) take ~1.3 s; wait before screenshots or use `reducedMotion: "reduce"`. Full-page screenshots show fixed bars mid-page; that is an artifact.
- `template.tsx` and `layout.tsx` form a flex column so the first scene of a page can fill exactly one screen (`min-h-[calc(100svh-4rem)]`; 4.5rem on large screens). Keep that when adding pages.
- Playwright tests run one worker and take about 7–8 minutes for the full suite (desktop + mobile).

## 10. Where to find more

- This session: https://claude.ai/code/session_01Y5xeqZSzBeaEcyTfuFvrQh (full history). The local transcript, if still on disk, is `/root/.claude/projects/-home-user-George-B-Assad-com/c1e3fd3e-d14f-57ab-b18a-e7957f5fa397.jsonl`.
- PRs: #1 initial prototype, #2 photos, #3 order-first, #4 Showroom v2 (all merged), #5 image polish (open) at https://github.com/GeorgeAssad/George-B-Assad.com/pulls?q=is%3Apr
- Docs in this folder: `README.md` (run, deploy, pages, car images), `ARCHITECTURE.md` (frontend, security, mocks to real services), `INTEGRATIONS.md` (where each real integration plugs in).
