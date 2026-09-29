import type { Metadata } from "next";
import { CartPage } from "@/components/cart/CartPage";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = { title: "Your cart", robots: { index: false, follow: true } };

export default function Cart() {
  return (
    <div className="container-x py-10 sm:py-16">
      <SectionHeading as="h1" eyebrow="SC / Cart" title="Your cart." />
      <div className="mt-10"><CartPage /></div>
    </div>
  );
}
