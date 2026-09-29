import type { PosterSize, ProductVariant } from "@/domain/catalog";
import { Price } from "@/components/ui/Price";

interface SizeScaleProps {
  readonly sizes: readonly PosterSize[];
  readonly variants: readonly ProductVariant[];
  /** Pixel height of the largest poster in the diagram. */
  readonly maxHeight?: number;
}

/** Posters drawn to relative physical scale, so sizes are understandable at a glance. */
export function SizeScale({ sizes, variants, maxHeight = 190 }: SizeScaleProps) {
  const tallest = Math.max(...sizes.map((s) => s.heightCm));
  const px = maxHeight / tallest;
  return (
    // Three equal columns on phones (no overflow at 320px); the rectangles scale with the viewport.
    <ul className="mx-auto grid max-w-2xl grid-cols-3 items-end gap-2 sm:gap-12" aria-label="Poster sizes" style={{ ["--sz" as string]: `min(${px}px, calc((100vw - 3rem) / 150))` }}>
      {sizes.map((s) => {
        const v = variants.find((x) => x.sizeId === s.id);
        return (
          <li key={s.id} className="flex min-w-0 flex-col items-center gap-3 text-center">
            <div
              className="rounded-sm border border-line-strong bg-elevated shadow-[var(--shadow-lift)] sm:![--sz:2.7px]"
              style={{ width: `calc(${s.widthCm} * var(--sz))`, height: `calc(${s.heightCm} * var(--sz))` }}
              role="img"
              aria-label={`${s.label} poster, drawn to relative scale`}
            />
            <div className="min-w-0">
              <p className="h-display whitespace-nowrap text-lg sm:text-2xl">{s.label}</p>
              {v && <Price value={v.price} prefix="from" className="text-xs sm:text-sm" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
