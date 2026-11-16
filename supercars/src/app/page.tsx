import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { CarPicker, ProofRow, Steps } from "@/components/home/HomeSections";
import { getRepositories } from "@/server/repositories";
import { HOME_HERO_SLUG } from "@/config/catalog";
import { siteConfig } from "@/config/site";
import { formatPrice } from "@/lib/format";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Turn your car into art` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const repos = getRepositories();
  const [cars, templates, rules, sizes, products] = await Promise.all([
    repos.cars.listEntries(),
    repos.templates.list(),
    repos.products.getShippingRules(),
    repos.products.listSizes(),
    repos.products.listProducts(),
  ]);
  const hero = cars.find((e) => e.generation.slug === HOME_HERO_SLUG) ?? cars.find((e) => e.generation.photos[0]?.mode === "cutout") ?? cars[0];
  if (!hero) throw new Error("Missing demo data: cars");
  const cheapest = products.flatMap((p) => p.variants).reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const deliveryDays = `${rules.minBusinessDays}–${rules.maxBusinessDays}`;

  return (
    <>
      <HomeHero hero={hero} templates={templates} priceFrom={formatPrice(cheapest.price)} deliveryDays={deliveryDays} />
      <ProofRow
        items={[
          [String(cars.length), "cars, each in its exact generation"],
          [String(templates.length), "poster styles to choose from"],
          [String(sizes.length), "sizes, as a print or framed"],
          [deliveryDays, "business days to your door"],
        ]}
      />
      <CarPicker cars={cars} />
      <Steps />
    </>
  );
}
