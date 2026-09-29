#!/usr/bin/env node
/**
 * Turns the originals in assets-src/ into the web files under public/cars/ and writes
 * src/data/car-photos.ts. Everything the site knows about a photo comes from photos/manifest.json.
 *
 *   crop    fractions of the original that make the final frame (removes clutter, sets the aspect)
 *   redact  fractions of the original to blur before anything else (licence plates, faces)
 *   focal   percent point inside the final frame that must stay visible when the box is cropped
 *
 * Output per photo: <id>-<width>.avif and <id>-<width>.webp for each width that does not upscale.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "photos", "manifest.json"), "utf8"));
const WIDTHS = [320, 640, 1280, 1920];
// Encoders step quality down until a file fits the budget, so busy scenes (grass, crowds) cannot bloat the site.
const MAX_FILE_BYTES = 300 * 1024;
const AVIF_QUALITIES = [48, 42, 36, 30];
const WEBP_QUALITIES = [70, 62, 54, 46];
const EFFORT = 4;

async function encode(pipeline, format) {
  const qualities = format === "avif" ? AVIF_QUALITIES : WEBP_QUALITIES;
  let out;
  for (const quality of qualities) {
    out = await pipeline.clone()[format]({ quality, effort: EFFORT }).toBuffer();
    if (out.length <= MAX_FILE_BYTES) break;
  }
  return out;
}
const clamp01 = (n) => Math.min(1, Math.max(0, n));

async function redacted(input, meta, boxes) {
  if (!boxes?.length) return input;
  const overlays = [];
  for (const b of boxes) {
    const left = Math.round(clamp01(b.left) * meta.width);
    const top = Math.round(clamp01(b.top) * meta.height);
    const width = Math.max(1, Math.min(meta.width - left, Math.round(b.width * meta.width)));
    const height = Math.max(1, Math.min(meta.height - top, Math.round(b.height * meta.height)));
    const patch = await sharp(input).extract({ left, top, width, height }).blur(Math.max(12, Math.round(width / 6))).toBuffer();
    overlays.push({ input: patch, left, top });
  }
  return sharp(input).composite(overlays).toBuffer();
}

const out = {};
const outDirs = new Set();
let totalBytes = 0;

for (const p of manifest.photos) {
  const srcFile = join(root, "assets-src", "cars", p.slug, `${p.id}.jpg`);
  if (!existsSync(srcFile)) throw new Error(`Missing original ${srcFile} — run: npm run photos:fetch`);

  const rotated = await sharp(srcFile).rotate().toBuffer();
  const meta = await sharp(rotated).metadata();
  const safe = await redacted(rotated, meta, p.redact);

  const c = p.crop ?? { left: 0, top: 0, width: 1, height: 1 };
  const region = {
    left: Math.round(c.left * meta.width),
    top: Math.round(c.top * meta.height),
    width: Math.round(c.width * meta.width),
    height: Math.round(c.height * meta.height),
  };
  const aspect = region.width / region.height;
  if (aspect < 1.3 || aspect > 2.4) throw new Error(`${p.slug}/${p.id}: crop aspect ${aspect.toFixed(2)} outside 1.3–2.4`);
  const framed = await sharp(safe).extract(region).toBuffer();

  const dir = join(root, "public", "cars", p.slug);
  mkdirSync(dir, { recursive: true });
  outDirs.add(dir);
  const widths = WIDTHS.filter((w) => w <= region.width);
  if (!widths.length) throw new Error(`${p.slug}/${p.id}: original is too small (${region.width}px)`);

  let largest = { w: 0, h: 0 };
  let bytes = 0;
  for (const w of widths) {
    const h = Math.round(w / aspect);
    const pipeline = sharp(framed).resize(w, h, { fit: "cover" });
    const avif = await encode(pipeline, "avif");
    const webp = await encode(pipeline, "webp");
    writeFileSync(join(dir, `${p.id}-${w}.avif`), avif);
    writeFileSync(join(dir, `${p.id}-${w}.webp`), webp);
    bytes += avif.length + webp.length;
    largest = { w, h };
  }
  totalBytes += bytes;

  const px = await sharp(framed).resize(1, 1, { fit: "cover" }).removeAlpha().raw().toBuffer();
  const color = "#" + [...px].slice(0, 3).map((v) => Math.round(v * 0.55).toString(16).padStart(2, "0")).join("");

  (out[p.slug] ??= []).push({
    id: p.id,
    alt: p.alt,
    width: largest.w,
    height: largest.h,
    widths,
    focal: p.focal,
    color,
    credit: p.credit,
  });
  console.log(`${p.slug}/${p.id}: ${widths.join("/")}  ${(bytes / 1024).toFixed(0)} KB  ${color}`);
}

// Remove files that no manifest entry produces any more.
const wanted = new Set(manifest.photos.flatMap((p) => WIDTHS.flatMap((w) => ["avif", "webp"].map((e) => join(root, "public", "cars", p.slug, `${p.id}-${w}.${e}`)))));
const carsDir = join(root, "public", "cars");
if (existsSync(carsDir)) {
  for (const slug of readdirSync(carsDir)) {
    const d = join(carsDir, slug);
    if (!statSync(d).isDirectory()) continue;
    for (const f of readdirSync(d)) if (!wanted.has(join(d, f))) rmSync(join(d, f));
  }
}

const body = JSON.stringify(out, null, 2).replace(/"([a-zA-Z_]\w*)":/g, "$1:");
const ts = `import type { CarPhoto } from "@/domain/catalog";

/* GENERATED by \`npm run photos:process\` from photos/manifest.json — do not edit by hand.
 * Credits are required by each photo's licence; they are shown on car pages and on /credits. */

export const carPhotos: Readonly<Record<string, readonly CarPhoto[]>> = ${body.replace(/^/gm, "").replace(/\n/g, "\n")};
`;
writeFileSync(join(root, "src", "data", "car-photos.ts"), ts);
console.log(`\n${manifest.photos.length} photos, ${(totalBytes / 1e6).toFixed(2)} MB total in ${outDirs.size} folders`);
