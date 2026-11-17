import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

/* Every page here is built ahead of time (no timed revalidation, no middleware). The
 * static-assets cache serves those built pages from the Worker's own files, and cache
 * interception answers them without starting the Next.js renderer. Without this the Worker
 * re-rendered every page on every visit, which went over Cloudflare's per-request CPU limit
 * (error 1102). `npm run cf:build` copies the built pages into .open-next/assets/cdn-cgi/
 * (populateCache local), which Cloudflare keeps private to the Worker. */
export default defineCloudflareConfig({
  incrementalCache: staticAssetsIncrementalCache,
  enableCacheInterception: true,
});
