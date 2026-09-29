#!/usr/bin/env node
/**
 * Turns the originals in assets-src/ into the web files under public/cars/ and writes
 * src/data/car-photos.ts. Everything the site knows about a photo comes from photos/manifest.json.
 *
 *   mode    "backdrop" (default) keeps the whole frame; "cutout" expects a transparent PNG made by
 *           `npm run photos:cutout` (or supplied already transparent) and trims it to the car
 *   crop    fractions of the original that make the final frame (removes clutter, sets the aspect)
 *   redact  fractions of the original to blur before anything else (licence plates, faces)
 *   focal   percent point inside the final frame that must stay visible when the box is cropped
 *
 * Flags:  --framed   only write assets-src/framed/<slug>/<id>.png (redacted + cropped) for the cutout tool, then exit
 * Output per photo: <id>-<width>.avif and <id>-<width>.webp for each width that does not upscale.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const manifest = JSON.parse(readFileSync(join(root, "photos", "manifest.json"), "utf8"));
const framedOnly = process.argv.includes("--framed");
const WIDTHS = [320, 640, 1280, 1920];
// Encoders step quality down until a file fits the budget, so busy scenes (grass, crowds) cannot bloat the site.
const MAX_FILE_BYTES = 300 * 1024;
const AVIF_QUALITIES = [58, 50, 42, 34, 28];
const WEBP_QUALITIES = [80, 72, 64, 54, 46];
const EFFORT = 4;
const ALPHA_THRESHOLD = 12; // alpha at or below this counts as empty when trimming
const TRIM_PADDING = 0.015; // breathing room around the trimmed car, as a fraction of its size

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

/** First existing original for a photo: assets-src/cars/<slug>/<id>.(jpg|jpeg|png|webp). */
function findOriginal(p) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    const f = join(root, "assets-src", "cars", p.slug, `${p.id}.${ext}`);
    if (existsSync(f)) return f;
  }
  throw new Error(`Missing original for ${p.slug}/${p.id} in assets-src/cars/${p.slug}/ — run: npm run photos:fetch (or add your own file)`);
}

/** Original → orientation fixed → (plates/faces blurred) → cropped. Cutouts are redacted later, after matting. */
async function frame(p, { redact = true } = {}) {
  const rotated = await sharp(findOriginal(p)).rotate().toBuffer();
  const meta = await sharp(rotated).metadata();
  const safe = redact ? await redacted(rotated, meta, p.redact) : rotated;
  const c = p.crop ?? { left: 0, top: 0, width: 1, height: 1 };
  const region = {
    left: Math.round(c.left * meta.width),
    top: Math.round(c.top * meta.height),
    width: Math.round(c.width * meta.width),
    height: Math.round(c.height * meta.height),
  };
  return { buffer: await sharp(safe).extract(region).toBuffer(), region };
}

const modeOf = (p) => p.mode ?? "backdrop";

/**
 * Cutouts: cover plates/faces with the car's own colour instead of a blur smudge.
 * Boxes are fractions of the ORIGINAL; `crop` maps them into the framed/cutout image.
 * Only pixels that are part of the car (alpha > 0) are touched, with a soft edge.
 */
async function fillRedactions(rgba, p) {
  if (!p.redact?.length) return rgba;
  const { data, info } = await sharp(rgba).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const c = p.crop ?? { left: 0, top: 0, width: 1, height: 1 };
  const px = (x, y) => (y * W + x) * 4;
  for (const b of p.redact) {
    const x0 = Math.round(((b.left - c.left) / c.width) * W);
    const y0 = Math.round(((b.top - c.top) / c.height) * H);
    const x1 = Math.round(((b.left + b.width - c.left) / c.width) * W);
    const y1 = Math.round(((b.top + b.height - c.top) / c.height) * H);
    if (x1 <= 0 || y1 <= 0 || x0 >= W || y0 >= H) continue;
    const ring = 14;
    const samples = [[], [], []];
    for (let y = Math.max(0, y0 - ring); y < Math.min(H, y1 + ring); y++) {
      for (let x = Math.max(0, x0 - ring); x < Math.min(W, x1 + ring); x++) {
        const inside = x >= x0 && x < x1 && y >= y0 && y < y1;
        if (inside) continue;
        const i = px(x, y);
        if (data[i + 3] < 230) continue;
        for (let k = 0; k < 3; k++) samples[k].push(data[i + k]);
      }
    }
    if (!samples[0].length) continue;
    const median = (a) => a.sort((m, n) => m - n)[a.length >> 1];
    const fill = samples.map(median);
    const feather = 5;
    for (let y = Math.max(0, y0 - feather); y < Math.min(H, y1 + feather); y++) {
      for (let x = Math.max(0, x0 - feather); x < Math.min(W, x1 + feather); x++) {
        const i = px(x, y);
        if (data[i + 3] === 0) continue;
        const d = Math.min(x - x0, x1 - 1 - x, y - y0, y1 - 1 - y); // >= 0 inside the box
        const w = d >= 0 ? 1 : Math.max(0, 1 + d / feather);
        for (let k = 0; k < 3; k++) data[i + k] = Math.round(data[i + k] * (1 - w) + fill[k] * w);
      }
    }
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

/** Bounding box of the pixels that are not (almost) transparent. */
async function alphaBox(rgba) {
  const { data, info } = await sharp(rgba).ensureAlpha().extractChannel(3).raw().toBuffer({ resolveWithObject: true });
  let minX = info.width, minY = info.height, maxX = -1, maxY = -1;
  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      if (data[y * info.width + x] > ALPHA_THRESHOLD) {
        if (x < minX) minX = x;
        if (x > maxX) maxX = x;
        if (y < minY) minY = y;
        if (y > maxY) maxY = y;
      }
    }
  }
  if (maxX < 0) throw new Error("cutout is fully transparent");
  return { left: minX, top: minY, width: maxX - minX + 1, height: maxY - minY + 1, sourceWidth: info.width, sourceHeight: info.height };
}

if (framedOnly) {
  let n = 0;
  for (const p of manifest.photos.filter((x) => modeOf(x) === "cutout" && !x.alreadyTransparent)) {
    const { buffer } = await frame(p, { redact: false });
    const dir = join(root, "assets-src", "framed", p.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, `${p.id}.png`), await sharp(buffer).png().toBuffer());
    n++;
    console.log(`framed ${p.slug}/${p.id}`);
  }
  console.log(`${n} framed image(s) ready for: npm run photos:cutout`);
  process.exit(0);
}

const out = {};
const outDirs = new Set();
let totalBytes = 0;

for (const p of manifest.photos) {
  const mode = modeOf(p);
  let source; // sharp input for encoding
  let aspect;
  let color;

  if (mode === "backdrop") {
    const { buffer, region } = await frame(p);
    aspect = region.width / region.height;
    if (aspect < 1.3 || aspect > 2.4) throw new Error(`${p.slug}/${p.id}: crop aspect ${aspect.toFixed(2)} outside 1.3–2.4`);
    source = { buffer, width: region.width };
    const px = await sharp(buffer).resize(1, 1, { fit: "cover" }).removeAlpha().raw().toBuffer();
    color = "#" + [...px].slice(0, 3).map((v) => Math.round(v * 0.55).toString(16).padStart(2, "0")).join("");
  } else {
    // Transparent car: from the cutout tool, or supplied already transparent.
    let rgbaFile = join(root, "assets-src", "cutouts", p.slug, `${p.id}.png`);
    if (p.alreadyTransparent) rgbaFile = findOriginal(p);
    if (!existsSync(rgbaFile)) throw new Error(`Missing cutout ${rgbaFile} — run: npm run photos:cutout`);
    const rgba = await fillRedactions(await sharp(rgbaFile).ensureAlpha().toBuffer(), p);
    const box = await alphaBox(rgba);
    const padX = Math.round(box.width * TRIM_PADDING);
    const padY = Math.round(box.height * TRIM_PADDING);
    const left = Math.max(0, box.left - padX);
    const top = Math.max(0, box.top - padY);
    const width = Math.min(box.sourceWidth - left, box.width + padX * 2);
    const height = Math.min(box.sourceHeight - top, box.height + padY * 2);
    const buffer = await sharp(rgba).extract({ left, top, width, height }).png().toBuffer();
    aspect = width / height;
    if (aspect < 1.2 || aspect > 3.2) throw new Error(`${p.slug}/${p.id}: trimmed aspect ${aspect.toFixed(2)} outside 1.2–3.2 (is it a side or three-quarter view?)`);
    source = { buffer, width };
    color = "transparent";
  }

  const dir = join(root, "public", "cars", p.slug);
  mkdirSync(dir, { recursive: true });
  outDirs.add(dir);
  const widths = WIDTHS.filter((w) => w <= source.width);
  if (!widths.length) throw new Error(`${p.slug}/${p.id}: original is too small (${source.width}px)`);

  let largest = { w: 0, h: 0 };
  let bytes = 0;
  for (const w of widths) {
    const h = Math.round(w / aspect);
    const pipeline = sharp(source.buffer).resize(w, h, { fit: mode === "backdrop" ? "cover" : "fill" });
    const avif = await encode(pipeline, "avif");
    const webp = await encode(pipeline, "webp");
    writeFileSync(join(dir, `${p.id}-${w}.avif`), avif);
    writeFileSync(join(dir, `${p.id}-${w}.webp`), webp);
    bytes += avif.length + webp.length;
    largest = { w, h };
  }
  totalBytes += bytes;

  (out[p.slug] ??= []).push({
    id: p.id,
    mode,
    alt: p.alt,
    width: largest.w,
    height: largest.h,
    widths,
    focal: p.focal,
    color,
    credit: p.credit,
  });
  console.log(`${p.slug}/${p.id} [${mode}]: ${widths.join("/")}  ${(bytes / 1024).toFixed(0)} KB  ${color}`);
}

// Remove files that no manifest entry produces any more.
const wanted = new Set(manifest.photos.flatMap((p) => WIDTHS.flatMap((w) => ["avif", "webp"].map((e) => join(root, "public", "cars", p.slug, `${p.id}-${w}.${e}`)))));
const carsDir = join(root, "public", "cars");
if (existsSync(carsDir)) {
  for (const slug of readdirSync(carsDir)) {
    const d = join(carsDir, slug);
    if (!statSync(d).isDirectory()) continue;
    for (const f of readdirSync(d)) if (!wanted.has(join(d, f))) rmSync(join(d, f));
    if (!readdirSync(d).length) rmSync(d, { recursive: true });
  }
}

const body = JSON.stringify(out, null, 2).replace(/"([a-zA-Z_]\w*)":/g, "$1:");
const ts = `import type { CarPhoto } from "@/domain/catalog";

/* GENERATED by \`npm run photos:process\` from photos/manifest.json — do not edit by hand.
 * Credits are required by each photo's licence; they are shown on car pages and on /credits. */

export const carPhotos: Readonly<Record<string, readonly CarPhoto[]>> = ${body};
`;
writeFileSync(join(root, "src", "data", "car-photos.ts"), ts);
console.log(`\n${manifest.photos.length} photos, ${(totalBytes / 1e6).toFixed(2)} MB total in ${outDirs.size} folders`);
