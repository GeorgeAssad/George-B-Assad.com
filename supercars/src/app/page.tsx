import type { Metadata } from "next";
import { HomeBand } from "@/components/home/HomeBand";
import { HomeStage } from "@/components/home/HomeStage";
import { getRepositories } from "@/server/repositories";
import { HOME_HERO_SLUG } from "@/config/catalog";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Turn your car into art` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const repos = getRepositories();
  const [cars, templates, rules] = await Promise.all([repos.cars.listEntries(), repos.templates.list(), repos.products.getShippingRules()]);
  const hero = cars.find((e) => e.generation.slug === HOME_HERO_SLUG) ?? cars.find((e) => e.generation.photos[0]?.mode === "cutout") ?? cars[0];
  if (!hero) throw new Error("Missing demo data: cars");
  const facts = [
    `Delivered in ${rules.minBusinessDays}–${rules.maxBusinessDays} business days`,
    "Heavyweight matte art paper",
    "Demo checkout: nothing is charged",
  ];
  return (
    <>
      <HomeStage hero={hero} cars={cars} />
      <HomeBand entry={hero} templates={templates} facts={facts} />
    </>
  );
}
