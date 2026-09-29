import Link from "next/link";
import type { CarEntry, DesignTemplate, Product } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { ProductFrame } from "@/components/poster/ProductFrame";
import { Price } from "@/components/ui/Price";

interface ProductCardProps { readonly product: Product; readonly entry: CarEntry; readonly template: DesignTemplate; readonly name: string }

export function ProductCard({ product, entry, template, name }: ProductCardProps) {
  const cheapest = product.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  return (
    <Link href={`/products/${product.slug}`} className="group card card-lift block overflow-hidden" aria-label={`${product.name}, from ${cheapest.price.amount / 100} euros`}>
      <div className="wall relative flex justify-center px-10 pb-12 pt-16">
        <div className="absolute left-1/2 top-6 h-1.5 w-24 -translate-x-1/2 rounded-full bg-fg/70 shadow-[0_18px_40px_14px_color-mix(in_srgb,var(--fg)_22%,transparent)]" aria-hidden="true" />
        <div className="zoom-img w-[52%] max-w-[15rem]">
          <ProductFrame variant={product.kind}>
            <PosterPreview template={template} vehicle={entry.generation.vehicle} customization={{ name }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId="40x60" />
          </ProductFrame>
        </div>
      </div>
      <div className="border-t border-line p-6">
        <p className="spec">{product.kind === "framed-poster" ? "Framed" : "Print"}</p>
        <h2 className="h-display mt-1 text-4xl">{product.name}</h2>
        <p className="mt-2 text-muted">{product.tagline}</p>
        <div className="mt-5 flex items-center justify-between"><Price value={cheapest.price} prefix="from" className="text-xl" /><span className="text-xs font-semibold uppercase tracking-[0.14em] text-fg">View product →</span></div>
      </div>
    </Link>
  );
}
