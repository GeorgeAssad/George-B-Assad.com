import type { Metadata } from "next";
import { HeroCar } from "@/components/showroom/HeroCar";
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
  const feature = cars.find((e) => e.generation.slug === "porsche-911-992") ?? cars[0];
  const stats: readonly (readonly [string, number])[] = [
    ["Cars", cars.length],
    ["Styles", templates.length],
    ["Sizes", sizes.length],
    ["Countries", destinations.length],
  ];
  return (
    <>
      <PageHero
        eyebrow="SC / About"
        title={<>A studio for <span className="text-red-text">car people.</span></>}
        lead="SuperCars turns the car you love into artwork made for one owner."
        word="Studio"
        visual={feature && <HeroCar entry={feature} priority />}
      />
      <div className="container-x section-y">
        <ul className="grid gap-3 md:grid-cols-3 md:gap-5">
          {PRINCIPLES.map(([title, body], i) => (
            <li key={title} className="card p-4 sm:p-6">
              <p className="spec">0{i + 1}</p>
              <h2 className="h-display mt-1.5 text-2xl sm:mt-2 sm:text-3xl">{title}</h2>
              <p className="mt-1.5 text-sm text-muted sm:mt-2 sm:text-base">{body}</p>
            </li>
          ))}
        </ul>
        <dl className="mt-5 grid grid-cols-4 gap-2 border-y border-line py-4 sm:mt-6 sm:gap-4 sm:py-6">
          {stats.map(([label, value]) => (
            <div key={label} className="text-center">
              <dd className="h-display text-4xl text-red-text tabular-nums sm:text-6xl">{value}</dd>
              <dt className="spec mt-1">{label}</dt>
            </div>
          ))}
        </dl>
        <p className="mt-6 max-w-3xl text-xs text-subtle">Vehicle names identify the subject of an artwork only. SuperCars is not affiliated with any manufacturer.</p>
      </div>
    </>
  );
}
