#!/usr/bin/env node
/**
 * Turns the originals in assets-src/ into the web files under public/cars/ and writes
 * src/data/car-photos.ts. Everything the site knows about a photo comes from photos/manifest.json.
 *
 *   mode    "backdrop" (default) keeps the whole frame; "cutout" expects a transparent PNG made by
 *           `npm run photos:cutout` (or supplied already transparent) and trims it to the car
 *   crop    fractions of the original that make the final frame (removes clutter, sets the aspect)
 *   redact  fractions of the original to hide before anything else (licence plates, faces); add
 *           "sample": "dark" to a box that sits on a grille or glass so the fill stays dark
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
// --only <slug>: re-encode a single car while tuning it (skips the cleanup and does not rewrite src/data/car-photos.ts).
const onlyIndex = process.argv.indexOf("--only");
const only = onlyIndex >= 0 ? process.argv[onlyIndex + 1] : null;
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

/** Separable gaussian blur of one Float32 plane (edges clamp, which cancels out when numerator and denominator are blurred alike). */
function gaussianBlur(plane, w, h, sigma) {
  const r = Math.max(1, Math.ceil(sigma * 2.5));
  const k = new Float32Array(2 * r + 1);
  let sum = 0;
  for (let i = -r; i <= r; i++) sum += (k[i + r] = Math.exp(-(i * i) / (2 * sigma * sigma)));
  for (let i = 0; i < k.length; i++) k[i] /= sum;
  const tmp = new Float32Array(plane.length);
  const out = new Float32Array(plane.length);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += plane[y * w + Math.min(w - 1, Math.max(0, x + i))] * k[i + r];
      tmp[y * w + x] = acc;
    }
  }
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let acc = 0;
      for (let i = -r; i <= r; i++) acc += tmp[Math.min(h - 1, Math.max(0, y + i)) * w + x] * k[i + r];
      out[y * w + x] = acc;
    }
  }
  return out;
}

/** Small deterministic noise so filled areas keep the photo's grain instead of looking like plastic. */
function noise(seed) {
  let s = seed >>> 0 || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return (s / 0xffffffff - 0.5) * 2;
  };
}

/**
 * Cutouts: hide plates and faces by continuing the car's own surroundings into the box (a smooth diffusion of the
 * pixels around it, plus film grain), not with one flat colour. Glass stays dark, paint keeps its gradient.
 * Boxes are fractions of the ORIGINAL; `crop` maps them into the framed/cutout image.
 * Only pixels that are part of the car (alpha > 0) are touched, with a soft edge.
 */
async function fillRedactions(rgba, p) {
  if (!p.redact?.length) return rgba;
  const { data, info } = await sharp(rgba).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const c = p.crop ?? { left: 0, top: 0, width: 1, height: 1 };
  const rand = noise([...p.slug].reduce((n, ch) => n * 31 + ch.charCodeAt(0), 7));
  for (const b of p.redact) {
    const x0 = Math.round(((b.left - c.left) / c.width) * W);
    const y0 = Math.round(((b.top - c.top) / c.height) * H);
    const x1 = Math.round(((b.left + b.width - c.left) / c.width) * W);
    const y1 = Math.round(((b.top + b.height - c.top) / c.height) * H);
    if (x1 <= 0 || y1 <= 0 || x0 >= W || y0 >= H) continue;
    // The fill is a smooth field, so it is computed on a coarse grid (cells of f×f pixels) and sampled bilinearly.
    // (Originals are ~3500 px wide, so a box can be 500 px: a fixed small sigma would never reach its middle.)
    const sigma = Math.max(8, Math.max(x1 - x0, y1 - y0) * 0.3);
    const margin = Math.ceil(sigma * 2.5);
    const wx0 = Math.max(0, x0 - margin), wy0 = Math.max(0, y0 - margin);
    const wx1 = Math.min(W, x1 + margin), wy1 = Math.min(H, y1 + margin);
    const w = wx1 - wx0, h = wy1 - wy0;
    const f = Math.max(1, Math.round(sigma / 6));
    const cw = Math.ceil(w / f), ch = Math.ceil(h / f);
    const cnum = [new Float32Array(cw * ch), new Float32Array(cw * ch), new Float32Array(cw * ch)];
    const cden = new Float32Array(cw * ch);
    // Known pixels = opaque car pixels just outside the box (the box itself is what we replace).
    const gap = 3;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        const gx = wx0 + x, gy = wy0 + y;
        if (gx >= x0 - gap && gx < x1 + gap && gy >= y0 - gap && gy < y1 + gap) continue;
        const i = (gy * W + gx) * 4;
        if (data[i + 3] < 230) continue;
        // `"sample": "dark"` in the manifest: the box sits on a dark part (grille, glass), so only dark pixels around it count.
        if (b.sample === "dark" && 0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2] > 70) continue;
        const cell = Math.floor(y / f) * cw + Math.floor(x / f);
        cden[cell] += 1;
        for (let k = 0; k < 3; k++) cnum[k][cell] += data[i + k];
      }
    }
    const dBlur = gaussianBlur(cden, cw, ch, sigma / f);
    const nBlur = cnum.map((pl) => gaussianBlur(pl, cw, ch, sigma / f));
    const at = (plane, fx, fy) => {
      const x = Math.min(cw - 1, Math.max(0, fx)), y = Math.min(ch - 1, Math.max(0, fy));
      const ix = Math.min(Math.max(0, cw - 2), Math.floor(x)), iy = Math.min(Math.max(0, ch - 2), Math.floor(y));
      const tx = x - ix, ty = y - iy;
      const ix1 = Math.min(cw - 1, ix + 1), iy1 = Math.min(ch - 1, iy + 1);
      return (plane[iy * cw + ix] * (1 - tx) + plane[iy * cw + ix1] * tx) * (1 - ty) + (plane[iy1 * cw + ix] * (1 - tx) + plane[iy1 * cw + ix1] * tx) * ty;
    };
    const feather = Math.max(5, Math.round(sigma * 0.12));
    for (let gy = Math.max(0, y0 - feather); gy < Math.min(H, y1 + feather); gy++) {
      for (let gx = Math.max(0, x0 - feather); gx < Math.min(W, x1 + feather); gx++) {
        const i = (gy * W + gx) * 4;
        if (data[i + 3] === 0) continue;
        const fx = (gx - wx0 + 0.5) / f - 0.5, fy = (gy - wy0 + 0.5) / f - 0.5;
        const den = at(dBlur, fx, fy);
        if (den < 1e-6) continue;
        const d = Math.min(gx - x0, x1 - 1 - gx, gy - y0, y1 - 1 - gy); // >= 0 inside the box
        const wgt = d >= 0 ? 1 : Math.max(0, 1 + d / feather);
        const grain = rand() * 2.4;
        for (let k = 0; k < 3; k++) {
          const fill = at(nBlur[k], fx, fy) / den + grain;
          data[i + k] = Math.min(255, Math.max(0, Math.round(data[i + k] * (1 - wgt) + fill * wgt)));
        }
      }
    }
  }
  return sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer();
}

// One studio look for every cut-out: the same exposure target, a touch more colour, and a clean 1 px edge.
const GRADE = { targetMedian: 112, minGamma: 0.82, maxGamma: 1.18, saturation: 1.07 };

/**
 * Photos were taken in different light. Bring the car's median brightness toward one target (only a little, so a
 * white car stays white and a black car stays black), add a touch of colour, and tidy the alpha edge: a slight
 * blur removes staircase jaggies and pulling the ramp in a little removes the halo left from the old background.
 */
async function gradeCar(rgba) {
  const { data, info } = await sharp(rgba).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const { width: W, height: H } = info;
  const hist = new Uint32Array(256);
  let n = 0;
  for (let i = 0; i < data.length; i += 4) {
    if (data[i + 3] < 230) continue;
    hist[Math.round(0.2126 * data[i] + 0.7152 * data[i + 1] + 0.0722 * data[i + 2])]++;
    n++;
  }
  let acc = 0, median = 128;
  for (let v = 0; v < 256; v++) { acc += hist[v]; if (acc >= n / 2) { median = Math.max(8, v); break; } }
  const gamma = Math.min(GRADE.maxGamma, Math.max(GRADE.minGamma, Math.log(GRADE.targetMedian / 255) / Math.log(median / 255)));
  const lut = new Uint8Array(256);
  for (let v = 0; v < 256; v++) lut[v] = Math.round(255 * Math.pow(v / 255, gamma));
  for (let i = 0; i < data.length; i += 4) {
    const r = lut[data[i]], g = lut[data[i + 1]], b = lut[data[i + 2]];
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    data[i] = Math.min(255, Math.max(0, Math.round(y + (r - y) * GRADE.saturation)));
    data[i + 1] = Math.min(255, Math.max(0, Math.round(y + (g - y) * GRADE.saturation)));
    data[i + 2] = Math.min(255, Math.max(0, Math.round(y + (b - y) * GRADE.saturation)));
  }
  const alpha = new Float32Array(W * H);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3] / 255;
  const soft = gaussianBlur(alpha, W, H, 0.8);
  for (let i = 0; i < alpha.length; i++) {
    const t = Math.min(1, Math.max(0, (soft[i] - 0.18) / 0.64));
    data[i * 4 + 3] = alpha[i] === 0 && t < 0.02 ? 0 : Math.round(t * t * (3 - 2 * t) * 255);
  }
  return { buffer: await sharp(data, { raw: { width: W, height: H, channels: 4 } }).png().toBuffer(), gamma, median };
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
  if (only && p.slug !== only) continue;
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
    const filled = await fillRedactions(await sharp(rgbaFile).ensureAlpha().toBuffer(), p);
    // "grade": false in the manifest skips the automatic grade (for images that already come with studio lighting).
    const graded = p.grade === false ? { buffer: filled, gamma: 1, median: 0 } : await gradeCar(filled);
    const rgba = graded.buffer;
    if (p.grade !== false) console.log(`  grade ${p.slug}: median ${graded.median} -> gamma ${graded.gamma.toFixed(2)}`);
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

if (only) {
  console.log(`\n--only ${only}: files written; run without --only to refresh src/data/car-photos.ts`);
  process.exit(0);
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
