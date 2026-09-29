import type { TextStyleSpec } from "@/domain/catalog";
import { FONT_CLASS, fitFontSize } from "./poster-geometry";

interface PosterTextProps {
  readonly text: string;
  readonly style: TextStyleSpec;
  readonly canvasWidth: number;
  readonly margin: number;
  readonly y: number;
  readonly opacity?: number;
  /** Override the anchor x; defaults to the style's alignment against the margins. */
  readonly x?: number;
  /** Maximum text width; defaults to the width between margins. */
  readonly maxWidth?: number;
}

/** One line of SVG poster text. Content is a React text node, so it is always escaped. */
export function PosterText({ text, style, canvasWidth, margin, y, opacity = 1, x, maxWidth }: PosterTextProps) {
  if (!text) return null;
  const content = style.uppercase ? text.toUpperCase() : text;
  const m = margin * canvasWidth;
  const available = maxWidth ?? canvasWidth - 2 * m;
  const size = fitFontSize(content, style.size * canvasWidth, available, style);
  const anchorX = x ?? (style.align === "start" ? m : style.align === "end" ? canvasWidth - m : canvasWidth / 2);
  return (
    <text
      x={anchorX}
      y={y}
      textAnchor={style.align}
      fontSize={size}
      fontWeight={style.weight}
      letterSpacing={`${style.tracking}em`}
      fill={style.color}
      opacity={opacity}
      className={FONT_CLASS[style.font]}
    >
      {content}
    </text>
  );
}
