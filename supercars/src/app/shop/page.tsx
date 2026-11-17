import type { Metadata } from "next";
import { DeliveryEstimate } from "@/components/offers/DeliveryEstimate";
import { ExampleReviews } from "@/components/sell/ExampleReviews";
import { Faq } from "@/components/sell/Faq";
import { SizeGuide } from "@/components/sell/SizeGuide";
import { TrustPoints } from "@/components/sell/TrustPoints";
import { SHOP_FAQ } from "@/content/faq";
import { resolveReviews } from "@/lib/showcase";
import { PageHero } from "@/components/showroom/PageHero";
import { PlanCard } from "@/components/showroom/PlanCard";
import { formatPrice } from "@/lib/format";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Shop personalized car posters",
  description: "Personalized car posters in five design styles and three sizes — as a print or a ready-to-hang framed poster.",
  alternates: { canonical: "/shop" },
};

export default async function ShopPage() {
  const repos = getRepositories();
  const [products, sizes, templates, rules, cars] = await Promise.all([
    repos.products.listProducts(),
    repos.products.listSizes(),
    repos.templates.list(),
    repos.products.getShippingRules(),
    repos.cars.listEntries(),
  ]);
  const m3 = cars.find((c) => c.generation.slug === "bmw-m3-g80") ?? cars[0];
  const porsche = cars.find((c) => c.generation.slug === "porsche-911-992") ?? cars[0];
  const tpl = (id: string) => templates.find((t) => t.id === id) ?? templates[0]!;
  const plans = products.map((p) => {
    const framed = p.kind === "framed-poster";
    return { product: p, entry: (framed ? porsche : m3) ?? m3!, template: tpl(framed ? "heritage" : "racing"), name: framed ? "ALEX" : "GEORGE", cta: framed ? "Design a framed poster" : "Design a print", badge: framed ? "Ready to hang" : "Gallery print", featured: framed };
  });
  return (
    <>
      <PageHero title="Two ways to hang it." lead="The same personalized artwork, as a gallery print or framed and ready for the wall." />
      <div className="container-x mt-8 sm:mt-10">
        <div className="lg-pricing mx-auto max-w-[56rem]">
          {plans.map((plan) => <PlanCard key={plan.product.id} sizes={sizes} {...plan} />)}
        </div>
        <div className="mx-auto mt-6 max-w-[56rem]">
          <TrustPoints items={[<DeliveryEstimate key="d" minDays={rules.minBusinessDays} maxDays={rules.maxBusinessDays} />, `Shipping ${formatPrice(rules.flatRate)}, tracked`, "Gift option at checkout", "Preview before you pay"]} />
          <p className="mt-3 text-[0.8125rem] text-subtle">Demo prices in euros; this prototype takes no payment.</p>
        </div>
      </div>
      <SizeGuide sizes={sizes} />
      <ExampleReviews items={resolveReviews(cars, templates, 6).slice(3)} title="Print or framed, both hang well." />
      <Faq items={SHOP_FAQ} />
    </>
  );
}
