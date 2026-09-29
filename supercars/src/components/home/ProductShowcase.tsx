import type { CarEntry, DesignTemplate, Product } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { ProductFrame } from "@/components/poster/ProductFrame";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface Item { readonly product: Product; readonly entry: CarEntry; readonly template: DesignTemplate; readonly name: string }

export function ProductShowcase({ items }: { items: readonly Item[] }) {
  return (
    <section aria-labelledby="showcase-title" className="container-x py-24 sm:py-32">
      <Reveal><SectionHeading id="showcase-title" eyebrow="SC / 06 — Product" title="Made to hang." lead="Choose a print on premium paper, or have it framed and ready for the wall." /></Reveal>
      <ul className="mt-14 grid gap-5 lg:grid-cols-2">
        {items.map(({ product, entry, template, name }, i) => {
          const cheapest = product.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
          return (
            <li key={product.id}>
              <Reveal delay={i * 100} className="h-full">
                <article className="card group flex h-full flex-col overflow-hidden">
                  <div className="wall relative flex justify-center px-8 pb-12 pt-16 sm:px-16">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-fg/30 to-transparent" aria-hidden="true" />
                    {/* picture light */}
                    <div className="absolute left-1/2 top-6 h-1.5 w-24 -translate-x-1/2 rounded-full bg-fg/70 shadow-[0_18px_40px_14px_color-mix(in_srgb,var(--fg)_22%,transparent)]" aria-hidden="true" />
                    <div className="zoom-img w-[46%] max-w-[15rem]">
                      <ProductFrame variant={product.kind}>
                        <PosterPreview template={template} vehicle={entry.generation.vehicle} customization={{ name }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId="40x60" />
                      </ProductFrame>
                    </div>
                  </div>
                  <div className="flex flex-1 flex-col gap-4 border-t border-line p-6 sm:p-8">
                    <div>
                      <p className="spec">{product.kind === "framed-poster" ? "Framed" : "Print"}</p>
                      <h3 className="h-display mt-1 text-4xl">{product.name}</h3>
                      <p className="mt-2 text-muted">{product.tagline}</p>
                    </div>
                    <div className="mt-auto flex flex-wrap items-center justify-between gap-4">
                      <Price value={cheapest.price} prefix="from" className="text-2xl" />
                      <Button href={`/products/${product.slug}`} variant="secondary">View product</Button>
                    </div>
                  </div>
                </article>
              </Reveal>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
