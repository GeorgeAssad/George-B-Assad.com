import type { CarEntry, DesignTemplate, PosterSize, Product } from "@/domain/catalog";
import { Button } from "@/components/ui/Button";
import { formatPrice } from "@/lib/format";
import { WallPoster } from "./WallPoster";

interface PlanCardProps {
  readonly product: Product;
  readonly sizes: readonly PosterSize[];
  readonly entry: CarEntry;
  readonly template: DesignTemplate;
  readonly name: string;
  /** Text on the one contextual button, e.g. "Design a framed poster". */
  readonly cta: string;
  /** Short factual label above the name. */
  readonly badge: string;
  /** The highlighted finish: tint ring and the filled button. */
  readonly featured?: boolean;
}

/** One finish as a pricing card: the poster on a gallery wall, what you get, every size with its price, one button. */
export function PlanCard({ product, sizes, entry, template, name, cta, badge, featured = false }: PlanCardProps) {
  const cheapest = product.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  return (
    <article className={`lg-plan ${featured ? "lg-plan--featured" : ""}`} aria-labelledby={`p-${product.id}`}>
      <div className="wall -mx-2 -mt-2 flex items-center justify-center rounded-[14px] px-6 py-8 sm:py-10">
        <WallPoster entry={entry} template={template} name={name} kind={product.kind} className="w-[46%] max-w-[13rem]" />
      </div>
      <span className={`lg-plan-badge ${featured ? "" : "!bg-fill !text-muted"}`}>{badge}</span>
      <div>
        <h2 id={`p-${product.id}`} className="text-[1.3125rem] font-semibold tracking-[-0.02em]">{product.name}</h2>
        <p className="mt-1 text-[0.9375rem] text-muted">{product.tagline}</p>
      </div>
      <p className="lg-plan-price"><small>From </small>{formatPrice(cheapest.price)}</p>
      <ul className="ticks">
        {product.highlights.map((h) => <li key={h}>{h}</li>)}
      </ul>
      <dl className="grid grid-cols-3 gap-2 text-[0.9375rem]" aria-label="Sizes and prices">
        {sizes.map((s) => {
          const v = product.variants.find((x) => x.sizeId === s.id);
          return v ? (
            <div key={s.id} className="rounded-xl bg-elevated px-3 py-2.5">
              <dt className="spec">{s.label}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{formatPrice(v.price)}</dd>
            </div>
          ) : null;
        })}
      </dl>
      <Button href={`/create?product=${product.slug}`} variant={featured ? "primary" : "secondary"} className="mt-auto w-full">{cta}</Button>
    </article>
  );
}
