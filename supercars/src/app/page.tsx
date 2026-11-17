import type { Metadata } from "next";
import { HomeHero } from "@/components/home/HomeHero";
import { CarPicker, Steps } from "@/components/home/HomeSections";
import { Benefits } from "@/components/sell/Benefits";
import { StylesWall } from "@/components/sell/StylesWall";
import { GiftSection } from "@/components/sell/GiftSection";
import { ExampleReviews } from "@/components/sell/ExampleReviews";
import { Faq } from "@/components/sell/Faq";
import { IconGauge, IconPackage, IconShield } from "@/components/ui/icons";
import { getRepositories } from "@/server/repositories";
import { HOME_HERO_SLUG } from "@/config/catalog";
import { siteConfig } from "@/config/site";
import { HOME_FAQ } from "@/content/faq";
import { formatPrice } from "@/lib/format";
import { resolveReviews, styleShowcase } from "@/lib/showcase";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Turn your car into art` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

/**
 * Home sells in order: the product and the one way to start (first screen), why buy here,
 * pick your car, the five styles, the gift angle, how it works, what customers say (examples),
 * and the questions people ask before they buy.
 */
export default async function HomePage() {
  const repos = getRepositories();
  const [cars, templates, rules, products] = await Promise.all([
    repos.cars.listEntries(),
    repos.templates.list(),
    repos.products.getShippingRules(),
    repos.products.listProducts(),
  ]);
  const hero = cars.find((e) => e.generation.slug === HOME_HERO_SLUG) ?? cars.find((e) => e.generation.photos[0]?.mode === "cutout") ?? cars[0];
  if (!hero) throw new Error("Missing demo data: cars");
  const cheapest = products.flatMap((p) => p.variants).reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const deliveryDays = `${rules.minBusinessDays}–${rules.maxBusinessDays}`;
  const giftCar = cars.find((e) => e.generation.slug === "porsche-911-992") ?? hero;
  const giftStyle = templates.find((t) => t.id === "heritage") ?? templates[0]!;

  return (
    <>
      <HomeHero hero={hero} templates={templates} priceFrom={formatPrice(cheapest.price)} deliveryDays={deliveryDays} />
      <Benefits
        items={[
          { icon: <IconGauge size={22} />, title: "Your exact car", body: `${cars.length} cars, each in its own generation.` },
          { icon: <span className="text-[1.0625rem] font-bold leading-none" aria-hidden="true">Aa</span>, title: "Your name on it", body: "Plus a line of text, a year and a place." },
          { icon: <IconShield size={22} />, title: "Checked before print", body: "Every poster is prepared at exact size." },
          { icon: <IconPackage size={22} />, title: "Tracked delivery", body: `${deliveryDays} business days, made to order.` },
        ]}
      />
      <CarPicker cars={cars} />
      <StylesWall items={styleShowcase(cars, templates)} />
      <GiftSection entry={giftCar} template={giftStyle} deliveryDays={deliveryDays} />
      <Steps />
      <ExampleReviews items={resolveReviews(cars, templates, 3)} />
      <Faq items={HOME_FAQ} />
    </>
  );
}
