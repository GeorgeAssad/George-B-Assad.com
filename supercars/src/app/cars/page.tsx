import type { Metadata } from "next";
import { CarExplorer } from "@/components/cars/CarExplorer";
import { HeroCar } from "@/components/showroom/HeroCar";
import { PageHero } from "@/components/showroom/PageHero";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Cars — find your machine",
  description: "Browse the SuperCars catalog by manufacturer, model and generation, then create a personalized poster of your car.",
  alternates: { canonical: "/cars" },
};

export default async function CarsPage() {
  const repos = getRepositories();
  const [entries, brands] = await Promise.all([repos.cars.listEntries(), repos.cars.listBrands()]);
  const feature = entries.find((e) => e.generation.slug === "lamborghini-huracan-lp610") ?? entries.find((e) => e.generation.photos[0]?.mode === "cutout");
  return (
    <>
      <PageHero
        eyebrow="SC / Garage"
        title={<>Find your <span className="text-red-text">machine.</span></>}
        lead="Pick the exact car. Every poster is made around that model and generation."
        word="Garage"
        visual={feature && <HeroCar entry={feature} priority />}
      />
      <div className="container-x section-y">
        <CarExplorer entries={entries} brands={brands} />
        <p className="mt-10 text-xs text-subtle">Catalog specifications are illustrative prototype data, not verified manufacturer figures. Vehicle names identify the subject of an artwork; SuperCars is not affiliated with any manufacturer.</p>
      </div>
    </>
  );
}
