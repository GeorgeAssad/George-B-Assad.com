import type { Metadata } from "next";
import { CarExplorer } from "@/components/cars/CarExplorer";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Cars — find your machine",
  description: "Browse the SuperCars catalog by manufacturer, model, generation, body type and performance category, then create a personalized poster of your car.",
  alternates: { canonical: "/cars" },
};

export default async function CarsPage() {
  const repos = getRepositories();
  const [entries, brands] = await Promise.all([repos.cars.listEntries(), repos.cars.listBrands()]);
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow="SC / Catalog" title="Find your machine." lead="Search the catalog, drill down by manufacturer, model and generation, then create a poster made for that exact car." />
      <div className="mt-10">
        <CarExplorer entries={entries} brands={brands} />
      </div>
      <p className="mt-10 text-xs text-subtle">Catalog specifications are illustrative prototype data, not verified manufacturer figures. Vehicle names identify the subject of an artwork; SuperCars is not affiliated with any manufacturer.</p>
    </div>
  );
}
