import type { DesignAsset, PrintSpec } from "@/domain/design";
import type { SizeId } from "@/domain/catalog";

/* PRINT FILE MATH. "8K" does not mean print-ready: print files are defined by
 * physical size, bleed and DPI. Everything below derives from those. */

export const PRINT_DPI = 300;
export const BLEED_MM = 3;
const MM_PER_INCH = 25.4;

const SIZES_CM: Record<SizeId, { w: number; h: number }> = {
  "30x40": { w: 30, h: 40 },
  "40x60": { w: 40, h: 60 },
  "50x70": { w: 50, h: 70 },
};

export const mmToPx = (mm: number, dpi: number): number => Math.round((mm / MM_PER_INCH) * dpi);

export function printSpecFor(sizeId: SizeId): PrintSpec {
  const size = SIZES_CM[sizeId];
  return { widthMm: size.w * 10, heightMm: size.h * 10, dpi: PRINT_DPI, bleedMm: BLEED_MM, colorProfile: "sRGB" };
}

/** Pixel dimensions of a print file INCLUDING bleed on every side. */
export function printPixelSize(spec: PrintSpec): { widthPx: number; heightPx: number } {
  return {
    widthPx: mmToPx(spec.widthMm + spec.bleedMm * 2, spec.dpi),
    heightPx: mmToPx(spec.heightMm + spec.bleedMm * 2, spec.dpi),
  };
}

/** The distinct assets the pipeline must produce for one poster. */
export function assetPlanFor(sizeId: SizeId): readonly DesignAsset[] {
  const spec = printSpecFor(sizeId);
  const print = printPixelSize(spec);
  const ratio = spec.heightMm / spec.widthMm;
  return [
    { kind: "web_preview", mimeType: "image/webp", widthPx: 1200, heightPx: Math.round(1200 * ratio) },
    { kind: "social_image", mimeType: "image/jpeg", widthPx: 1080, heightPx: 1350 },
    { kind: "print_image", mimeType: "image/png", widthPx: print.widthPx, heightPx: print.heightPx, dpi: spec.dpi },
    { kind: "print_pdf", mimeType: "application/pdf", widthPx: print.widthPx, heightPx: print.heightPx, dpi: spec.dpi },
    { kind: "master_source", mimeType: "image/tiff", widthPx: Math.round(print.widthPx * 1.5), heightPx: Math.round(print.heightPx * 1.5), dpi: spec.dpi },
  ];
}

/** Effective DPI when an image of `widthPx` is stretched over the print width. */
export const effectiveDpi = (widthPx: number, widthMm: number): number => (widthPx / widthMm) * MM_PER_INCH;
