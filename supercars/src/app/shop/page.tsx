import type { Metadata } from "next";
import { HeroCar } from "@/components/showroom/HeroCar";
import { PageHero } from "@/components/showroom/PageHero";
import { ProductScene } from "@/components/showroom/ProductScene";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Shop personalized car posters",
  description: "Personalized car posters in five design styles and three sizes — as a print or a ready-to-hang framed poster.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const repos = getRepositories();
  const [products, sizes, templates, m3, porsche, feature] = await Promise.all([
    repos.products.listProducts(),
    repos.products.listSizes(),
    repos.templates.list(),
    repos.cars.getEntryBySlug("bmw-m3-g80"),
    repos.cars.getEntryBySlug("porsche-911-992"),
    repos.cars.getEntryBySlug("audi-r8-4s"),
  ]);
  const tpl = (id: string) => templates.find((t) => t.id === id) ?? templates[0]!;
  const scenes = products.map((p, i) => ({ product: p, entry: (i === 0 ? m3 : porsche) ?? m3!, template: tpl(i === 0 ? "racing" : "heritage"), name: i === 0 ? "GEORGE" : "ALEX", cta: p.kind === "framed-poster" ? "Design a framed poster" : "Design a print" }));
  return (
    <>
      <PageHero
        eyebrow="SC / Shop"
        title={<>Two ways to <span className="text-red-text">hang it.</span></>}
        lead="Every poster is made to order around your exact car."
        word="Shop"
        visual={feature && <HeroCar entry={feature} priority />}
      />
      <div className="container-x section-y">
        <div className="grid gap-5 md:grid-cols-2 lg:gap-8">
          {scenes.map((s) => <ProductScene key={s.product.id} sizes={sizes} {...s} />)}
        </div>
      </div>
    </>
  );
}
