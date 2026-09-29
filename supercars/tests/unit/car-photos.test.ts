import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";
import { describe, expect, it } from "vitest";
import { generations } from "@/data/cars";
import { carPhotos } from "@/data/car-photos";
import { PHOTO_FORMATS, photoFallbackSrc, photoPath, photoSrcSet } from "@/lib/car-photo";
import { getRepositories } from "@/server/repositories";

const root = join(__dirname, "..", "..");
const publicDir = join(root, "public");
const all = Object.entries(carPhotos).flatMap(([slug, photos]) => photos.map((photo) => ({ slug, photo })));

// Only licences that allow commercial use and adaptation without share-alike.
const ALLOWED_LICENCE = /^(CC0(?: 1\.0)?|Public domain|CC BY (?:2\.0|2\.5|3\.0|4\.0))$/;

describe("car photos: licences and credits", () => {
  it("has photos for most of the catalog", () => {
    expect(all.length).toBeGreaterThanOrEqual(10);
  });

  it("only references cars that exist", () => {
    const slugs = new Set(generations.map((g) => g.slug));
    for (const slug of Object.keys(carPhotos)) expect(slugs.has(slug)).toBe(true);
  });

  it.each(all.map((x) => [`${x.slug}/${x.photo.id}`, x] as const))("%s has a complete credit", (_name, { photo }) => {
    const c = photo.credit;
    expect(c.author.length).toBeGreaterThan(1);
    expect(c.title.length).toBeGreaterThan(3);
    expect(photo.alt.length).toBeGreaterThanOrEqual(20);
    if (c.kind === "third-party") {
      // Photographs by others: only licences that allow commercial use and adaptation without share-alike.
      expect(c.licenseName).toMatch(ALLOWED_LICENCE);
      expect(c.licenseName).not.toMatch(/SA|NC|ND/);
      expect(c.licenseUrl).toMatch(/^https:\/\/creativecommons\.org\//);
      expect(c.sourceUrl).toMatch(/^https:\/\/(commons\.wikimedia\.org\/wiki\/File:|www\.flickr\.com\/photos\/)/);
      expect(c.sourceName).toMatch(/^(Wikimedia Commons|Flickr)$/);
      if (photo.mode === "cutout") expect(c.note).toMatch(/background removed/i); // CC BY: changes must be stated
    } else {
      // Images we made or commissioned ourselves (including AI-generated): a plain label, no third-party links.
      expect(c.licenseName).toBe("SuperCars");
      expect(c.note).toMatch(/\S/);
      expect(c.sourceUrl).toBeUndefined();
    }
  });

  it("matches photos/manifest.json (credits cannot drift from the source of truth)", () => {
    const manifest = JSON.parse(readFileSync(join(root, "photos", "manifest.json"), "utf8")) as {
      photos: { slug: string; id: string; mode?: string; alt: string; credit: unknown }[];
    };
    expect(manifest.photos.length).toBe(all.length);
    for (const m of manifest.photos) {
      const built = carPhotos[m.slug]?.find((p) => p.id === m.id);
      expect(built, `${m.slug}/${m.id} missing from car-photos.ts`).toBeDefined();
      expect(built?.credit).toEqual(m.credit);
      expect(built?.alt).toBe(m.alt);
      expect(built?.mode).toBe(m.mode ?? "backdrop");
    }
  });
});

describe("car photos: files", () => {
  it.each(all.map((x) => [`${x.slug}/${x.photo.id}`, x] as const))("%s has every file and stays within budget", (_name, { slug, photo }) => {
    expect(photo.widths.length).toBeGreaterThanOrEqual(3);
    expect([...photo.widths]).toEqual([...photo.widths].sort((a, b) => a - b));
    expect(photo.width).toBe(photo.widths[photo.widths.length - 1]);
    const aspect = photo.width / photo.height;
    // Backdrop photos are cropped to a landscape frame; cutouts keep the car's own shape.
    expect(aspect).toBeGreaterThan(photo.mode === "cutout" ? 1.2 : 1.3);
    expect(aspect).toBeLessThan(photo.mode === "cutout" ? 3.2 : 2.4);
    expect(photo.focal.x).toBeGreaterThanOrEqual(0);
    expect(photo.focal.x).toBeLessThanOrEqual(100);
    expect(photo.focal.y).toBeGreaterThanOrEqual(0);
    expect(photo.focal.y).toBeLessThanOrEqual(100);
    expect(photo.color).toMatch(photo.mode === "cutout" ? /^transparent$/ : /^#[0-9a-f]{6}$/);

    let bytes = 0;
    for (const w of photo.widths) {
      for (const f of PHOTO_FORMATS) {
        const file = join(publicDir, photoPath(slug, photo.id, w, f));
        expect(existsSync(file), `${file} missing`).toBe(true);
        const size = statSync(file).size;
        // The largest file is the hero-grade one; nothing may exceed 400 KB.
        expect(size).toBeLessThan(400 * 1024);
        bytes += size;
      }
    }
    expect(bytes).toBeLessThan(1.1 * 1024 * 1024);
  });

  it("cutouts really are transparent and backdrops are not", async () => {
    for (const { slug, photo } of all) {
      for (const f of PHOTO_FORMATS) {
        const meta = await sharp(join(publicDir, photoPath(slug, photo.id, photo.widths[0] ?? 320, f))).metadata();
        expect(meta.hasAlpha, `${slug}/${photo.id}.${f}`).toBe(photo.mode === "cutout");
      }
    }
  });

  it("has no orphaned files in public/cars", () => {
    const expected = new Set(all.flatMap(({ slug, photo }) => photo.widths.flatMap((w) => PHOTO_FORMATS.map((f) => join(publicDir, photoPath(slug, photo.id, w, f))))));
    const carsDir = join(publicDir, "cars");
    for (const slug of readdirSync(carsDir)) for (const f of readdirSync(join(carsDir, slug))) expect(expected.has(join(carsDir, slug, f)), `${slug}/${f} is not referenced`).toBe(true);
  });

  it("keeps the whole photo set under 12 MB", () => {
    const carsDir = join(publicDir, "cars");
    let total = 0;
    for (const slug of readdirSync(carsDir)) for (const f of readdirSync(join(carsDir, slug))) total += statSync(join(carsDir, slug, f)).size;
    expect(total).toBeLessThan(12 * 1024 * 1024);
  });
});

describe("car photos: repository and URL helpers", () => {
  it("merges photos into catalog entries and leaves the rest empty", async () => {
    const entries = await getRepositories().cars.listEntries();
    expect(entries.length).toBe(generations.length);
    for (const e of entries) expect(e.generation.photos).toEqual(carPhotos[e.generation.slug] ?? []);
    expect(entries.some((e) => e.generation.photos.length === 0)).toBe(true); // a car without a qualifying photo keeps its drawing
  });

  it("builds srcset strings and a WebP fallback", () => {
    const first = all[0];
    expect(first).toBeDefined();
    if (!first) return;
    const { slug, photo } = first;
    expect(photoSrcSet(slug, photo, "avif").split(", ").length).toBe(photo.widths.length);
    expect(photoSrcSet(slug, photo, "webp")).toContain(`${photoPath(slug, photo.id, 640, "webp")} 640w`);
    expect(photoFallbackSrc(slug, photo)).toBe(photoPath(slug, photo.id, 1280, "webp"));
    expect(photoPath("a-b", "main", 320, "avif")).toBe("/cars/a-b/main-320.avif");
  });
});
