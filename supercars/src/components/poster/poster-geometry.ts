import type { SizeId, TextStyleSpec } from "@/domain/catalog";

/** Poster canvas is always 1000 units wide; height follows the physical ratio. */
export const POSTER_WIDTH = 1000;

const RATIOS: Record<SizeId, number> = { "30x40": 40 / 30, "40x60": 60 / 40, "50x70": 70 / 50 };

export const posterHeight = (sizeId: SizeId): number => Math.round(POSTER_WIDTH * RATIOS[sizeId]);
export const posterRatio = (sizeId: SizeId): number => RATIOS[sizeId];

/** Average glyph width (em) per font family, uppercase-weighted. Used to shrink text that would overflow. */
const GLYPH_EM: Record<TextStyleSpec["font"], number> = { display: 0.5, sans: 0.68, serif: 0.72, mono: 0.62 };

export function estimateTextWidth(text: string, fontSize: number, style: Pick<TextStyleSpec, "font" | "tracking">): number {
  return text.length * (GLYPH_EM[style.font] + style.tracking) * fontSize;
}

/** Returns a font size that fits `maxWidth`, never larger than `fontSize`. */
export function fitFontSize(text: string, fontSize: number, maxWidth: number, style: Pick<TextStyleSpec, "font" | "tracking">): number {
  const w = estimateTextWidth(text, fontSize, style);
  return w <= maxWidth ? fontSize : Math.max(fontSize * 0.35, (fontSize * maxWidth) / w);
}

export const FONT_VAR: Record<TextStyleSpec["font"], string> = {
  display: "var(--font-display), 'Barlow Condensed', 'Arial Narrow', sans-serif",
  sans: "var(--font-sans), Inter, system-ui, sans-serif",
  serif: "'Iowan Old Style', 'Palatino Linotype', Palatino, Georgia, serif",
  mono: "ui-monospace, 'SF Mono', 'Cascadia Mono', Menlo, Consolas, monospace",
};
