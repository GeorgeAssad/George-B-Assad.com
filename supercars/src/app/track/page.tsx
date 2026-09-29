import type { Metadata } from "next";
import { Suspense } from "react";
import { TrackLookup } from "@/components/orders/TrackLookup";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Skeleton } from "@/components/ui/Skeleton";

export const metadata: Metadata = {
  title: "Track your order",
  description: "Enter your order number to see where your personalized SuperCars poster is: design, print, shipped, delivered.",
  alternates: { canonical: "/track" },
};

export default function TrackPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow="SC / Tracking" title="Track your order." lead="Enter your order number. No account needed." />
      <div className="mt-10">
        <Suspense fallback={<Skeleton className="h-24 max-w-2xl" />}>
          <TrackLookup />
        </Suspense>
      </div>
    </div>
  );
}
