import type { Metadata } from "next";
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
  const [products, sizes, templates, rules, m3, porsche] = await Promise.all([
    repos.products.listProducts(),
    repos.products.listSizes(),
    repos.templates.list(),
    repos.products.getShippingRules(),
    repos.cars.getEntryBySlug("bmw-m3-g80"),
    repos.cars.getEntryBySlug("porsche-911-992"),
  ]);
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
        <p className="mx-auto mt-6 max-w-[56rem] text-[0.9375rem] text-muted">
          Shipping {formatPrice(rules.flatRate)}, free over {formatPrice(rules.freeOver)}. Made to order and delivered in {rules.minBusinessDays}–{rules.maxBusinessDays} business days. Demo prices in euros; this prototype takes no payment.
        </p>
      </div>
    </>
  );
}
