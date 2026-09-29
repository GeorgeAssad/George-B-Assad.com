import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarStage } from "@/components/cars/CarStage";
import { Button } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
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
    openGraph: { title: `${title} | SuperCars`, description, type: "website", images: [{ url: `/og/cars/${generation.slug}.jpg`, width: 1200, height: 630, alt: `${generation.displayName} poster preview` }] },
    twitter: { card: "summary_large_image", title: `${title} | SuperCars`, description, images: [`/og/cars/${generation.slug}.jpg`] },
  };
}

/** One screen: the car, its name, three facts, the price and one button. */
export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const entry = await load(slug);
  if (!entry) notFound();

  const product = await getRepositories().products.getProductById(DEFAULT_PRODUCT_ID);
  const { brand, car, generation } = entry;
  const cheapest = product?.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const { specs } = generation;

  return (
    <article className="flex flex-1 flex-col">
      <CarStage entry={entry} />

      <div className="container-x flex flex-col gap-4 py-4 sm:py-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8">
        <div className="min-w-0">
          <h1 className="h-display text-[clamp(2rem,5vw,3.5rem)] leading-none">
            {brand.name} {car.name} <span className="text-red-text">{generation.generation}</span>
          </h1>
          <p className="mt-1.5 text-muted">{generation.tagline}</p>
        </div>

        <dl className="flex gap-6 sm:gap-8">
          {[
            ["Years", specs.years],
            ["Power", `${specs.powerKw} kW`],
            ["Drive", specs.drivetrain],
          ].map(([label, value]) => (
            <div key={label}>
              <dt className="spec">{label}</dt>
              <dd className="mt-0.5 font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 lg:justify-end">
          {cheapest && <Price value={cheapest.price} prefix="Posters from" className="text-lg" />}
          <Button href={`/create?car=${generation.slug}`} size="lg" className="max-sm:flex-1">Create this car <IconArrow size={18} /></Button>
        </div>
      </div>
    </article>
  );
}
