import type { Metadata } from "next";
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
  const cars = await getRepositories().cars.listEntries();
  const hero = cars.find((e) => e.generation.slug === HOME_HERO_SLUG) ?? cars.find((e) => e.generation.photos[0]?.mode === "cutout") ?? cars[0];
  if (!hero) throw new Error("Missing demo data: cars");
  return <HomeStage hero={hero} cars={cars} />;
}
