import type { Metadata } from "next";
import { ProofRow } from "@/components/home/HomeSections";
import { PageHero } from "@/components/showroom/PageHero";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "About",
  description: "SuperCars is an automotive design studio for personalized car artwork, built around automation so every poster is made for one specific car and one specific owner.",
  alternates: { canonical: "/about" },
};

const PRINCIPLES = [
  ["Your exact car", "Most car posters are one picture of a similar car. We start from your model and generation, then build everything around it."],
  ["Made to order", "A design engine composes the artwork, a print file is prepared at exact dimensions, and a fulfilment partner prints and ships it."],
  ["Honest about the prototype", "Payments, AI generation, fulfilment and email are simulated. Company details will be added here when they are real."],
] as const;

export default async function AboutPage() {
  const repos = getRepositories();
  const [cars, templates, sizes, destinations] = await Promise.all([repos.cars.listEntries(), repos.templates.list(), repos.products.listSizes(), repos.products.listShippingDestinations()]);
  return (
    <>
      <PageHero title="A studio for car people." lead="SuperCars turns the car you love into artwork made for one owner." />
      <div className="container-x mt-8 sm:mt-10">
        <ul className="grid gap-3 sm:gap-4 md:grid-cols-3">
          {PRINCIPLES.map(([title, body]) => (
            <li key={title} className="card p-5 sm:p-6">
              <h2 className="text-[1.3125rem] font-semibold leading-snug tracking-[-0.02em]">{title}</h2>
              <p className="mt-2 text-[0.9375rem] text-muted sm:text-[1.0625rem]">{body}</p>
            </li>
          ))}
        </ul>
      </div>
      <ProofRow
        items={[
          [String(cars.length), "cars in the catalog"],
          [String(templates.length), "poster styles"],
          [String(sizes.length), "sizes"],
          [String(destinations.length), "countries we plan to ship to"],
        ]}
      />
      <p className="container-x mt-6 max-w-3xl text-[0.8125rem] text-subtle">Vehicle names identify the subject of an artwork only. SuperCars is not affiliated with any manufacturer.</p>
    </>
  );
}
