import type { Metadata } from "next";
import { CarExplorer } from "@/components/cars/CarExplorer";
import { PageHero } from "@/components/showroom/PageHero";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Cars — find your car",
  description: "Browse the SuperCars catalog by manufacturer, model and generation, then create a personalized poster of your car.",
  alternates: { canonical: "/cars" },
};

export default async function CarsPage() {
  const repos = getRepositories();
  const [entries, brands] = await Promise.all([repos.cars.listEntries(), repos.cars.listBrands()]);
  return (
    <>
      <PageHero title="Find your car." lead="Pick the exact model and generation. Every poster is made around it." />
      <div className="container-x mt-7 sm:mt-9">
        <CarExplorer entries={entries} brands={brands} />
        <p className="mt-8 max-w-3xl text-[0.8125rem] text-subtle">Catalog specifications are illustrative prototype data, not verified manufacturer figures. Vehicle names identify the subject of an artwork; SuperCars is not affiliated with any manufacturer.</p>
      </div>
    </>
  );
}
