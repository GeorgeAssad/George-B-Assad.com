import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const repos = getRepositories();
  const [destinations, rules] = await Promise.all([repos.products.listShippingDestinations(), repos.products.getShippingRules()]);
  return (
    <div className="container-x pb-16 pt-[clamp(2.25rem,6vw,4.5rem)]">
      <SectionHeading as="h1" title="Checkout." lead="Demo checkout. No real payment is taken." />
      <div className="mt-8"><CheckoutForm destinations={destinations} delivery={{ minDays: rules.minBusinessDays, maxDays: rules.maxBusinessDays }} /></div>
    </div>
  );
}
