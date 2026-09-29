import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StyleCard } from "@/components/create/StyleCard";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { ProductFrame } from "@/components/poster/ProductFrame";
import { SizeScale } from "@/components/cars/SizeScale";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StickyCta } from "@/components/ui/StickyCta";
import { IconArrow, IconCheck } from "@/components/ui/icons";
import { Price } from "@/components/ui/Price";
import { slugSchema } from "@/lib/validation";
import { getRepositories } from "@/server/repositories";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  return (await getRepositories().products.listProducts()).map((p) => ({ slug: p.slug }));
}

async function load(slug: string) {
  if (!slugSchema.safeParse(slug).success) return null;
  return getRepositories().products.getProductBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await load((await params).slug);
  if (!product) return { title: "Product unavailable", robots: { index: false } };
  return {
    title: product.name,
    description: product.description,
    alternates: { canonical: `/products/${product.slug}` },
    openGraph: { title: `${product.name} | SuperCars`, description: product.description, images: [{ url: "/og/shop.png", width: 1200, height: 630, alt: product.name }] },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await load((await params).slug);
  if (!product) notFound();

  const repos = getRepositories();
  const [sizes, templates, entry] = await Promise.all([repos.products.listSizes(), repos.templates.list(), repos.cars.getEntryBySlug("bmw-m3-g80")]);
  const hero = templates.find((t) => t.id === (product.kind === "framed-poster" ? "heritage" : "racing")) ?? templates[0]!;
  const cheapest = product.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const customizeHref = `/products/${product.slug}/customize`;

  return (
    <article>
      <div className="container-x grid gap-12 py-12 sm:py-16 lg:grid-cols-[1.05fr_1fr] lg:gap-20">
        <div className="wall relative flex items-center justify-center rounded-3xl border border-line px-10 pb-14 pt-20">
          <div className="absolute left-1/2 top-8 h-1.5 w-28 -translate-x-1/2 rounded-full bg-fg/70 shadow-[0_22px_50px_18px_color-mix(in_srgb,var(--fg)_22%,transparent)]" aria-hidden="true" />
          {entry && (
            <div className="w-[62%] max-w-[22rem]">
              <ProductFrame variant={product.kind}>
                <PosterPreview template={hero} vehicle={entry.generation.vehicle} customization={{ name: "GEORGE", year: "2024" }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId="50x70" />
              </ProductFrame>
            </div>
          )}
        </div>

        <div>
          <nav aria-label="Breadcrumb" className="spec mb-6"><ol className="flex gap-2"><li><Link href="/shop" className="hover:text-fg">Shop</Link></li><li aria-hidden="true">/</li><li aria-current="page" className="text-fg">{product.name}</li></ol></nav>
          <h1 className="h-display text-[clamp(3rem,7vw,5.5rem)]">{product.name}</h1>
          <p className="mt-3 text-xl font-medium">{product.tagline}</p>
          <p className="mt-4 text-muted">{product.description}</p>
          <div className="mt-6"><Price value={cheapest.price} prefix="from" className="text-3xl" /></div>
          <ul className="mt-8 space-y-3">
            {product.highlights.map((h) => <li key={h} className="flex items-start gap-3 text-sm"><IconCheck size={18} className="mt-0.5 flex-none text-red-text" />{h}</li>)}
          </ul>
          <div className="mt-10 hidden lg:block"><Button href={customizeHref} size="lg">Customize <IconArrow size={18} /></Button></div>
          <p className="mt-6 text-xs text-subtle">Prototype specifications and placeholder prices. See <Link href="/shipping" className="underline underline-offset-4">shipping</Link> and <Link href="/returns" className="underline underline-offset-4">returns</Link>.</p>
        </div>
      </div>

      <section aria-labelledby="prod-sizes" className="border-y border-line bg-surface py-20">
        <div className="container-x">
          <SectionHeading id="prod-sizes" eyebrow="SC / Sizes" title="Pick your size." />
          <div className="mt-14"><SizeScale sizes={sizes} variants={product.variants} /></div>
        </div>
      </section>

      {entry && (
        <section aria-labelledby="prod-styles" className="container-x py-20">
          <SectionHeading id="prod-styles" eyebrow="SC / Styles" title="Five styles." />
          <ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible" aria-label="Design styles">
            {templates.map((t, i) => (
              <li key={t.id} className="w-[68vw] max-w-[19rem] flex-none snap-start lg:w-auto lg:max-w-none">
                <StyleCard template={t} vehicle={entry.generation.vehicle} vehicleName={entry.generation.displayName} specs={entry.generation.specs} index={i} href={`/create?product=${product.slug}&style=${t.id}`} />
              </li>
            ))}
          </ul>
        </section>
      )}
      <StickyCta href={customizeHref} label="Customize" caption={<Price value={cheapest.price} prefix="from" className="text-lg" />} />
    </article>
  );
}
