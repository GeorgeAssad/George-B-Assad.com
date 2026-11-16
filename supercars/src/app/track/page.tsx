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
    <div className="container-x pb-12 pt-[clamp(2.25rem,6vw,4.5rem)]">
      <SectionHeading as="h1" title="Track your order." lead="Enter your order number. No account needed." />
      <div className="mt-8">
        <Suspense fallback={<Skeleton className="h-24 max-w-2xl" />}>
          <TrackLookup />
        </Suspense>
      </div>
    </div>
  );
}
