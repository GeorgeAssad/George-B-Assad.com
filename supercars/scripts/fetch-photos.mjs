#!/usr/bin/env node
/**
 * Downloads the original photographs listed in photos/manifest.json from Wikimedia Commons
 * into assets-src/ (git-ignored). The processed web files are committed, so this is only
 * needed to re-run `npm run photos:process` (new crop, new widths, new formats).
 *
 * Wikimedia asks automated clients to send a descriptive User-Agent and to slow down when
 * answered with 429 — this script does both. Run with NODE_USE_ENV_PROXY=1 behind an HTTPS proxy.
 */
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "photos", "manifest.json"), "utf8"));
const UA = "SuperCarsPrototype/0.1 (https://github.com/GeorgeAssad/George-B-Assad.com; photo-fetch) node";
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;

async function download(url, maxAttempts = 8) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    const gap = Math.max(0, last + 1500 - Date.now());
    if (gap) await sleep(gap);
    last = Date.now();
    const res = await fetch(url, { headers: { "User-Agent": UA } });
    if (res.status === 429 || res.status === 503) {
      const wait = Math.min(90, (Number(res.headers.get("retry-after")) || 10) * attempt);
      console.warn(`  ${res.status}, waiting ${wait}s`);
      await sleep(wait * 1000);
      continue;
    }
    if (!res.ok) throw new Error(`${res.status} ${url}`);
    return Buffer.from(await res.arrayBuffer());
  }
  throw new Error(`gave up on ${url}`);
}

// --rendered: skip the original and ask the commons host for a 3840px-wide copy (smaller, and not rate-limited as hard).
const rendered = process.argv.includes("--rendered");
let failed = 0;
for (const p of manifest.photos) {
  const file = join(root, "assets-src", "cars", p.slug, `${p.id}.jpg`);
  if (existsSync(file)) {
    console.log(`have  ${p.slug}/${p.id}`);
    continue;
  }
  try {
    let buf;
    try {
      if (rendered) throw new Error("rendered copy requested");
      buf = await download(p.source.url, 3);
    } catch {
      // upload.wikimedia.org can rate-limit shared IPs; the file-page renderer on the commons host is a fallback.
      const name = p.source.file.replace(/^File:/, "");
      const w = Math.min(p.source.width, 3840);
      if (!rendered) console.warn(`  original unavailable, using rendered copy at ${w}px`);
      buf = await download(`https://commons.wikimedia.org/w/thumb.php?f=${encodeURIComponent(name)}&w=${w}`);
    }
    const sha = createHash("sha256").update(buf).digest("hex");
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, buf);
    console.log(`saved ${p.slug}/${p.id}  ${(buf.length / 1e6).toFixed(1)} MB  sha256:${sha}`);
  } catch (e) {
    failed++;
    console.error(`FAIL  ${p.slug}/${p.id}: ${e.message}`);
  }
}
process.exit(failed ? 1 : 0);
