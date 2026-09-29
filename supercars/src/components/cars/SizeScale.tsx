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
    <ul className="flex items-end justify-center gap-6 sm:gap-12" aria-label="Poster sizes">
      {sizes.map((s) => {
        const v = variants.find((x) => x.sizeId === s.id);
        return (
          <li key={s.id} className="flex flex-col items-center gap-3 text-center">
            <div className="rounded-sm border border-line-strong bg-elevated shadow-[var(--shadow-lift)]" style={{ width: s.widthCm * px, height: s.heightCm * px }} role="img" aria-label={`${s.label} poster, drawn to relative scale`} />
            <div>
              <p className="h-display text-2xl">{s.label}</p>
              {v && <Price value={v.price} prefix="from" className="text-sm" />}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
