import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CarStage } from "@/components/cars/CarStage";
import { CarTile } from "@/components/cars/CarTile";
import { StyleStrip } from "@/components/cars/StyleStrip";
import { OfferPrice } from "@/components/offers/OfferPrice";
import { DeliveryEstimate } from "@/components/offers/DeliveryEstimate";
import { ExampleReviews } from "@/components/sell/ExampleReviews";
import { Faq } from "@/components/sell/Faq";
import { FollowBar } from "@/components/sell/FollowBar";
import { SizesTable } from "@/components/sell/SizesTable";
import { TrustPoints } from "@/components/sell/TrustPoints";
import { Button } from "@/components/ui/Button";
import { IconArrow, IconPackage } from "@/components/ui/icons";
import { CAR_FAQ } from "@/content/faq";
import { getRepositories } from "@/server/repositories";
import { relatedCars, resolveReviews } from "@/lib/showcase";
import { slugSchema } from "@/lib/validation";

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

/**
 * The product page for one car: what it is, the price, when it arrives and the one way to start, next to the car
 * itself; then the five styles, sizes and prices, what customers say (examples), questions, and similar cars.
 * On phones the start button follows you once it scrolls away.
 */
export default async function CarPage({ params }: Props) {
  const { slug } = await params;
  const entry = await load(slug);
  if (!entry) notFound();

  const repos = getRepositories();
  const [products, templates, sizes, rules, cars] = await Promise.all([repos.products.listProducts(), repos.templates.list(), repos.products.listSizes(), repos.products.getShippingRules(), repos.cars.listEntries()]);
  const { brand, car, generation } = entry;
  const cheapest = products.flatMap((p) => p.variants).reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const { specs } = generation;
  const createHref = `/create?car=${generation.slug}`;

  return (
    <article>
      <nav aria-label="Breadcrumb" className="container-x pt-5 sm:pt-7">
        <ol className="flex flex-wrap items-center gap-1.5 text-[0.8125rem] text-muted">
          <li><Link href="/cars" prefetch={false} className="rounded hover:text-fg">Cars</Link></li>
          <li aria-hidden="true">›</li>
          <li><Link href={`/cars?brand=${brand.id}`} prefetch={false} className="rounded hover:text-fg">{brand.name}</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page" className="font-medium text-fg">{car.name} {generation.generation}</li>
        </ol>
      </nav>

      <div className="container-x grid items-center gap-7 pt-5 sm:pt-6 lg:grid-cols-[0.92fr_1.08fr] lg:gap-12 lg:pt-8">
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
          <p className="mt-6 text-[1.0625rem]">Posters <OfferPrice value={cheapest.price} prefix="from" className="text-[1.25rem]" /></p>
          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-3" data-car-cta>
            <Button href={createHref} size="lg" className="max-sm:w-full">Create this car <IconArrow size={18} /></Button>
          </div>
          <p className="mt-4 flex items-center gap-2 text-[0.9375rem] font-medium"><IconPackage size={17} className="flex-none text-subtle" /><DeliveryEstimate minDays={rules.minBusinessDays} maxDays={rules.maxBusinessDays} /></p>
          <TrustPoints className="mt-3" items={["Your name on it", "Preview before you pay", "Gift option at checkout"]} />
        </div>
        <CarStage entry={entry} />
      </div>

      <StyleStrip entry={entry} templates={templates} sizes={sizes} />

      <section aria-labelledby="sizes-title" className="container-x section-t grid items-start gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:gap-12">
        <div>
          <h2 id="sizes-title" className="h-display h-section">Sizes and prices.</h2>
          <p className="lead mt-3 max-w-[40ch]">As a rolled print for your own frame, or framed and ready to hang. 40 × 60 cm is our recommendation for most walls.</p>
        </div>
        <SizesTable sizes={sizes} products={products} />
      </section>

      <ExampleReviews items={resolveReviews(cars, templates, 2, entry)} title="Made for one owner." />

      <Faq items={CAR_FAQ} />

      <section aria-labelledby="more-title" className="container-x section-t">
        <h2 id="more-title" className="h-display h-section">More cars like this.</h2>
        <ul className="mt-7 grid grid-cols-2 gap-3 sm:mt-9 sm:gap-4 md:grid-cols-3">
          {relatedCars(cars, entry).map((c) => (
            <li key={c.generation.slug}><CarTile entry={c} href={`/cars/${c.generation.slug}`} detail /></li>
          ))}
        </ul>
      </section>

      <FollowBar target="[data-car-cta]">
        <p className="min-w-0 flex-1 leading-tight"><span className="block truncate text-[0.8125rem] text-muted">{generation.displayName}</span><OfferPrice value={cheapest.price} prefix="from" /></p>
        <Button href={createHref} size="lg" className="flex-none">Create this car</Button>
      </FollowBar>
    </article>
  );
}
