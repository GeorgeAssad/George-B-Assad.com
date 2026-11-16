import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CarStage } from "@/components/cars/CarStage";
import { StyleStrip } from "@/components/cars/StyleStrip";
import { Button } from "@/components/ui/Button";
import { IconArrow } from "@/components/ui/icons";
import { DEFAULT_PRODUCT_ID } from "@/config/catalog";
import { formatPrice } from "@/lib/format";
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

/** Split hero: what the car is and the one way to start on the left, the car in the studio on the right. Then the five styles. */
export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const entry = await load(slug);
  if (!entry) notFound();

  const repos = getRepositories();
  const [product, templates, sizes] = await Promise.all([repos.products.getProductById(DEFAULT_PRODUCT_ID), repos.templates.list(), repos.products.listSizes()]);
  const { brand, car, generation } = entry;
  const cheapest = product?.variants.reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const { specs } = generation;

  return (
    <article>
      <div className="container-x grid items-center gap-7 pt-6 sm:pt-10 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pt-14">
        <div className="max-lg:order-2">
          <p className="eyebrow mb-3">{brand.name}</p>
          <h1 className="h-display h-page">{car.name} <span className="text-muted">{generation.generation}</span></h1>
          <p className="lead mt-4">{generation.tagline}</p>
          <dl className="mt-6 flex gap-8 border-y-[0.5px] border-line py-4 sm:gap-10">
            {[
              ["Years", specs.years],
              ["Power", `${specs.powerKw} kW`],
              ["Drive", specs.drivetrain],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="spec">{label}</dt>
                <dd className="mt-0.5 text-[1.0625rem] font-semibold tabular-nums">{value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
            <Button href={`/create?car=${generation.slug}`} size="lg" className="max-sm:w-full">Create this car <IconArrow size={18} /></Button>
            {cheapest && <p className="text-[0.9375rem] text-muted">Posters from <span className="font-semibold text-fg tabular-nums">{formatPrice(cheapest.price)}</span></p>}
          </div>
        </div>
        <CarStage entry={entry} />
      </div>
      <StyleStrip entry={entry} templates={templates} sizes={sizes} />
    </article>
  );
}
