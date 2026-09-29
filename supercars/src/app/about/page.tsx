import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "About",
  description: "SuperCars is an automotive design studio for personalized car artwork, built around automation so every poster is made for one specific car and one specific owner.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow="SC / About" title="A studio for car people." lead="SuperCars turns the car you love into a piece of artwork made for one owner." />
      <div className="mt-14 grid grid-cols-1 max-w-5xl gap-10 md:grid-cols-2">
        <div className="space-y-4 text-lg text-muted">
          <p>Most car posters are the same picture of a similar car. We start from the opposite end: your exact model, a design style that suits it, and the details that make it yours.</p>
          <p>Behind the storefront is an automated pipeline: a design engine composes the artwork, a print file is prepared at exact dimensions, and a fulfilment partner prints and ships it.</p>
        </div>
        <div className="space-y-4 text-lg text-muted">
          <p>This site is an early prototype of that experience. Payments, AI generation, fulfilment and email are simulated, and the company details are still to come — we&apos;ll add them here when they&apos;re real.</p>
          <p>Vehicle names identify the subject of an artwork only. We are not affiliated with any manufacturer.</p>
        </div>
      </div>
      <div className="mt-14 flex flex-col gap-3 sm:flex-row"><Button href="/create" size="lg">Create your poster</Button><Button href="/how-it-works" variant="secondary" size="lg">How it works</Button></div>
    </div>
  );
}
