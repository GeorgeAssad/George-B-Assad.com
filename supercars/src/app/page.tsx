import type { Metadata } from "next";
import { BrandStatement } from "@/components/home/BrandStatement";
import { FeaturedCars } from "@/components/home/FeaturedCars";
import { FeaturedStyles } from "@/components/home/FeaturedStyles";
import { FeedSection } from "@/components/home/FeedSection";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ProductShowcase } from "@/components/home/ProductShowcase";
import { SocialProof } from "@/components/home/SocialProof";
import { WhySuperCars } from "@/components/home/WhySuperCars";
import { getRepositories } from "@/server/repositories";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name} — Turn your car into art` },
  description: siteConfig.description,
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const repos = getRepositories();
  const [entries, templates, products, reviews, media] = await Promise.all([
    repos.cars.listEntries(),
    repos.templates.list(),
    repos.products.listProducts(),
    repos.content.listReviews(),
    repos.content.listMedia(),
  ]);

  const bySlug = new Map(entries.map((e) => [e.generation.slug, e]));
  const tplById = new Map(templates.map((t) => [t.id as string, t]));
  const must = <T,>(v: T | undefined, what: string): T => {
    if (v === undefined) throw new Error(`Missing demo data: ${what}`);
    return v;
  };

  const m3 = must(bySlug.get("bmw-m3-g80"), "bmw-m3-g80");
  const gtr = must(bySlug.get("nissan-gt-r-r35"), "nissan-gt-r-r35");
  const featured = entries.filter((e) => e.generation.featured).slice(0, 6);
  const [poster, framed] = [must(products[0], "poster product"), must(products[1], "framed product")];

  return (
    <>
      <Hero main={m3} second={gtr} racing={must(tplById.get("racing"), "racing")} blueprint={must(tplById.get("blueprint"), "blueprint")} />
      <BrandStatement />
      <HowItWorks />
      <FeaturedCars entries={featured} />
      <FeaturedStyles templates={templates} entry={m3} />
      <ProductShowcase
        items={[
          { product: poster, entry: gtr, template: must(tplById.get("minimal"), "minimal"), name: "MIA" },
          { product: framed, entry: must(bySlug.get("porsche-911-992"), "911"), template: must(tplById.get("heritage"), "heritage"), name: "ALEX" },
        ]}
      />
      <WhySuperCars />
      <SocialProof reviews={reviews} />
      <FeedSection items={media} entries={bySlug} templates={tplById} />
      <FinalCta />
    </>
  );
}
