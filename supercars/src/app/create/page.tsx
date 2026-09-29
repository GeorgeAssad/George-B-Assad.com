import type { Metadata } from "next";
import { Suspense } from "react";
import { Configurator } from "@/components/configurator/Configurator";
import { ConfiguratorSkeleton } from "@/components/configurator/ConfiguratorSkeleton";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Create your poster",
  description: "Choose your car, pick a design style and size, add your name and preview your personalized poster live before you order.",
  alternates: { canonical: "/create" },
  openGraph: { title: "Create your poster | SuperCars", description: "Design a personalized poster of your car in about a minute.", images: [{ url: "/og/create.png", width: 1200, height: 630, alt: "SuperCars poster designer" }] },
};

export default async function CreatePage() {
  const repos = getRepositories();
  const [cars, templates, products, sizes] = await Promise.all([repos.cars.listEntries(), repos.templates.list(), repos.products.listProducts(), repos.products.listSizes()]);
  return (
    <Suspense fallback={<ConfiguratorSkeleton />}>
      <Configurator catalog={{ cars, templates, products, sizes }} />
    </Suspense>
  );
}
