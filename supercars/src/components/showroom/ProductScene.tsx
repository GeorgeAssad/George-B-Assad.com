import type { CarEntry, DesignTemplate, PosterSize, Product } from "@/domain/catalog";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { IconArrow } from "@/components/ui/icons";
import { WallPoster } from "./WallPoster";

interface ProductSceneProps {
  readonly product: Product;
  readonly sizes: readonly PosterSize[];
  readonly entry: CarEntry;
  readonly template: DesignTemplate;
  readonly name: string;
  /** Text on the one contextual button, e.g. "Design a framed poster". */
  readonly cta: string;
}

/** One product hanging on a dark gallery wall, its sizes with prices underneath, and the one button that starts it. */
export function ProductScene({ product, sizes, entry, template, name, cta }: ProductSceneProps) {
  const cheapest = product.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  return (
    <article className="card overflow-hidden" aria-labelledby={`p-${product.id}`}>
      <div className="grid grid-cols-[minmax(0,0.85fr)_minmax(0,1fr)] md:grid-cols-1">
        <div className="on-dark wall-dark relative flex items-center justify-center overflow-hidden px-[8%] pb-8 pt-12 md:pb-10 md:pt-14">
          <div className="picture-light" aria-hidden="true" />
          <WallPoster entry={entry} template={template} name={name} kind={product.kind} className="w-[90%] max-w-[15rem] md:w-[52%]" />
        </div>
        <div className="flex flex-col justify-center p-4 sm:p-6 md:border-t md:border-line md:pb-2">
          <p className="spec">{product.kind === "framed-poster" ? "Framed · ready to hang" : "Print · gallery paper"}</p>
          <h2 id={`p-${product.id}`} className="h-display mt-1 text-3xl sm:text-4xl">{product.name}</h2>
          <p className="mt-1.5 text-sm text-muted sm:text-base">{product.tagline}</p>
        </div>
      </div>
      <div className="space-y-3 px-4 pb-4 sm:px-6 sm:pb-6">
        <ul className="grid grid-cols-3 gap-2 sm:max-w-md" aria-label="Sizes and prices">
          {sizes.map((s) => {
            const v = product.variants.find((x) => x.sizeId === s.id);
            return v ? (
              <li key={s.id} className="rounded-lg border border-line-strong px-2.5 py-1.5 text-xs leading-tight sm:text-sm">
                <span className="block text-muted">{s.label.replace(" cm", "")}</span>
                <Price value={v.price} className="font-semibold" />
              </li>
            ) : null;
          })}
        </ul>
        <div className="flex items-center justify-between gap-3">
          <Price value={cheapest.price} prefix="from" className="shrink-0 text-lg sm:text-xl" />
          <Button href={`/create?product=${product.slug}`} className="max-sm:flex-1 max-sm:!px-3">{cta} <IconArrow size={18} className="max-sm:hidden" /></Button>
        </div>
      </div>
    </article>
  );
}
