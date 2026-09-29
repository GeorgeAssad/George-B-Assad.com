import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarCard } from "@/components/cars/CarCard";
import { CarStage } from "@/components/cars/CarStage";
import { SizeScale } from "@/components/cars/SizeScale";
import { SpecGrid } from "@/components/cars/SpecGrid";
import { StyleCard } from "@/components/create/StyleCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { StickyCta } from "@/components/ui/StickyCta";
import { IconArrow } from "@/components/ui/icons";
import { DEFAULT_PRODUCT_ID } from "@/config/catalog";
import { slugSchema } from "@/lib/validation";
import { getRepositories } from "@/server/repositories";

interface Props { params: Promise<{ slug: string }> }

export async function generateStaticParams() {
  const entries = await getRepositories().cars.listEntries();
  return entries.map((e) => ({ slug: e.generation.slug }));
}

async function load(slug: string) {
  if (!slugSchema.safeParse(slug).success) return null;
  return getRepositories().cars.getEntryBySlug(slug);
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const entry = await load((await params).slug);
  if (!entry) return { title: "Car not found", robots: { index: false } };
  const { generation } = entry;
  const title = `Personalized ${generation.displayName} Poster`;
  const description = `Create a personalized ${generation.displayName} poster in five design styles and three sizes. Add your name, preview it live, then order.`;
  return {
    title,
    description,
    alternates: { canonical: `/cars/${generation.slug}` },
    openGraph: { title: `${title} | SuperCars`, description, type: "website", images: [{ url: `/og/cars/${generation.slug}.png`, width: 1200, height: 630, alt: `${generation.displayName} poster preview` }] },
    twitter: { card: "summary_large_image", title: `${title} | SuperCars`, description, images: [`/og/cars/${generation.slug}.png`] },
  };
}

export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const entry = await load(slug);
  if (!entry) notFound();

  const repos = getRepositories();
  const [templates, sizes, product, all] = await Promise.all([
    repos.templates.list(),
    repos.products.listSizes(),
    repos.products.getProductById(DEFAULT_PRODUCT_ID),
    repos.cars.listEntries(),
  ]);
  const { brand, car, generation } = entry;
  const related = all
    .filter((e) => e.generation.slug !== generation.slug && (e.brand.id === brand.id || e.generation.bodyType === generation.bodyType))
    .slice(0, 3);
  const cheapest = product?.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const createHref = `/create?car=${generation.slug}`;

  return (
    <article>
      <CarStage entry={entry} />

      <div className="container-x py-12 sm:py-16">
        <nav aria-label="Breadcrumb" className="spec mb-8">
          <ol className="flex flex-wrap items-center gap-2">
            <li><Link href="/cars" className="hover:text-fg">Cars</Link></li>
            <li aria-hidden="true">/</li>
            <li><Link href={`/cars?brand=${brand.id}`} className="hover:text-fg">{brand.name}</Link></li>
            <li aria-hidden="true">/</li>
            <li aria-current="page" className="text-fg">{car.name} {generation.generation}</li>
          </ol>
        </nav>

        <div className="grid gap-12 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone="outline">{generation.performance}</Badge>
              <Badge>{generation.bodyType}</Badge>
            </div>
            <h1 className="h-display mt-5 text-[clamp(3rem,8vw,6.5rem)]">
              {brand.name} {car.name} <span className="text-red-text">{generation.generation}</span>
            </h1>
            <p className="mt-4 text-xl font-medium">{generation.tagline}</p>
            <p className="mt-4 max-w-xl text-muted">{generation.description}</p>
            <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button href={createHref} size="lg">Create this car <IconArrow size={18} /></Button>
              {cheapest && <Price value={cheapest.price} prefix="Posters from" className="text-lg" />}
            </div>
          </div>
          <SpecGrid specs={generation.specs} />
        </div>
      </div>

      <section aria-labelledby="car-styles" className="border-y border-line bg-surface py-20 sm:py-24">
        <div className="container-x">
          <SectionHeading id="car-styles" eyebrow="SC / Styles" title={`Available styles for the ${car.name}.`} lead="Pick a style to start designing. You can change it any time in the next step." />
        </div>
        <ul className="no-scrollbar container-x mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-5 lg:overflow-visible" aria-label="Available styles">
          {templates.map((t, i) => (
            <li key={t.id} className="w-[68vw] max-w-[19rem] flex-none snap-start lg:w-auto lg:max-w-none">
              <StyleCard template={t} vehicle={generation.vehicle} vehicleName={generation.displayName} specs={generation.specs} index={i} href={`/create?car=${generation.slug}&style=${t.id}`} />
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="car-sizes" className="container-x py-20 sm:py-24">
        <SectionHeading id="car-sizes" eyebrow="SC / Sizes" title="Available sizes." lead="Three sizes, drawn here to relative scale. Framed versions are available in every size." />
        <div className="mt-14">{product && <SizeScale sizes={sizes} variants={product.variants} />}</div>
        <div className="mt-14 flex justify-center"><Button href={createHref} size="lg">Create this car <IconArrow size={18} /></Button></div>
      </section>

      {related.length > 0 && (
        <section aria-labelledby="car-related" className="container-x pb-24">
          <SectionHeading id="car-related" eyebrow="SC / More" title="More machines." />
          <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((e, i) => <li key={e.generation.slug}><CarCard entry={e} index={i} /></li>)}
          </ul>
        </section>
      )}

      <StickyCta href={createHref} label="Create this car" caption={<><span className="block font-semibold">{generation.displayName}</span>{cheapest && <Price value={cheapest.price} prefix="from" className="text-sm" />}</>} />
    </article>
  );
}
