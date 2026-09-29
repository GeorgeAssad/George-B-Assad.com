import type { Metadata } from "next";
import { ProductCard } from "@/components/products/ProductCard";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Shop personalized car posters",
  description: "Personalized car posters in five design styles and three sizes — as a print or ready-to-hang framed poster.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const repos = getRepositories();
  const [products, templates, m3, gtr] = await Promise.all([repos.products.listProducts(), repos.templates.list(), repos.cars.getEntryBySlug("bmw-m3-g80"), repos.cars.getEntryBySlug("porsche-911-992")]);
  const tpl = (id: string) => templates.find((t) => t.id === id) ?? templates[0]!;
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow="SC / Shop" title="Posters made for your car." lead="Every poster is made to order around your exact car. Choose a finish, then design it." />
      <ul className="mt-12 grid grid-cols-1 gap-5 md:grid-cols-2">
        {products.map((p, i) => {
          const entry = (i === 0 ? m3 : gtr) ?? m3!;
          return <li key={p.id}><ProductCard product={p} entry={entry} template={tpl(i === 0 ? "racing" : "heritage")} name={i === 0 ? "GEORGE" : "ALEX"} /></li>;
        })}
      </ul>
      <div className="mt-14 flex flex-col items-center gap-4 rounded-3xl border border-line bg-surface p-10 text-center">
        <p className="h-display text-4xl">Not sure where to start?</p>
        <p className="max-w-md text-muted">Pick your car first. We&apos;ll take you through style, size and personalization.</p>
        <Button href="/create" size="lg">Create your poster</Button>
      </div>
    </div>
  );
}
