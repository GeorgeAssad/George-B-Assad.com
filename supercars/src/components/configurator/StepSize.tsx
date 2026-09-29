import type { DesignTemplate, PosterSize, Product, SizeId } from "@/domain/catalog";
import { addMoney } from "@/domain/money";
import { formatPrice } from "@/lib/format";
import { RadioCard } from "./RadioCard";

interface StepSizeProps {
  readonly sizes: readonly PosterSize[];
  readonly products: readonly Product[];
  readonly template: DesignTemplate;
  readonly productId: string;
  readonly sizeId: SizeId;
  readonly onProduct: (id: string) => void;
  readonly onSize: (id: SizeId) => void;
}

/** Display prices come from the catalog; the authoritative price is re-quoted by the server. */
export function StepSize({ sizes, products, template, productId, sizeId, onProduct, onSize }: StepSizeProps) {
  const product = products.find((p) => p.id === productId) ?? products[0];
  const tallest = Math.max(...sizes.map((s) => s.heightCm));
  const px = 92 / tallest;
  return (
    <div className="space-y-10">
      <fieldset>
        <legend className="spec mb-3">Finish</legend>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {products.map((p) => (
            <RadioCard key={p.id} name="finish" value={p.id} checked={productId === p.id} onChange={() => onProduct(p.id)}>
              <div className="p-4 pr-11">
                <p className="h-display text-2xl">{p.kind === "framed-poster" ? "Framed" : "Print only"}</p>
                <p className="mt-1 text-sm text-muted">{p.tagline}</p>
              </div>
            </RadioCard>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="spec mb-3">Size</legend>
        <div className="grid grid-cols-3 gap-3">
          {sizes.map((s) => {
            const variant = product?.variants.find((v) => v.sizeId === s.id);
            return (
              <RadioCard key={s.id} name="size" value={s.id} checked={sizeId === s.id} onChange={() => onSize(s.id)}>
                <div className="flex flex-col items-center p-3 pb-4 text-center">
                  <div className="flex h-24 items-end">
                    <div className="rounded-[2px] border border-line-strong bg-elevated" style={{ width: s.widthCm * px, height: s.heightCm * px }} aria-hidden="true" />
                  </div>
                  <p className="h-display mt-3 text-2xl">{s.label.replace(" cm", "")}</p>
                  <p className="spec">cm</p>
                  {variant && <p className="mt-2 text-sm font-semibold text-red-text tabular-nums">{formatPrice(addMoney(variant.price, template.surcharge))}</p>}
                </div>
              </RadioCard>
            );
          })}
        </div>
      </fieldset>
    </div>
  );
}
