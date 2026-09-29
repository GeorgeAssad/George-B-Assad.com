import type { Metadata } from "next";
import { CheckoutForm } from "@/components/checkout/CheckoutForm";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = { title: "Checkout", robots: { index: false, follow: false } };

export default async function CheckoutPage() {
  const destinations = await getRepositories().products.listShippingDestinations();
  return (
    <div className="container-x pb-28 pt-10 sm:pt-16 lg:pb-16">
      <SectionHeading as="h1" eyebrow="SC / Checkout" title="Checkout." lead="Demo checkout — no real payment is taken." />
      <div className="mt-10"><CheckoutForm destinations={destinations} /></div>
    </div>
  );
}
