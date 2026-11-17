import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { Button } from "@/components/ui/Button";
import { TrustPoints } from "@/components/sell/TrustPoints";
import { HeroStudio } from "./HeroStudio";

interface HomeHeroProps {
  readonly hero: CarEntry;
  readonly templates: readonly DesignTemplate[];
  /** e.g. "€39" */
  readonly priceFrom: string;
  /** e.g. "7–10" */
  readonly deliveryDays: string;
}

const TRUST = ["Preview before you pay", "Made to order", "Change anything until checkout"] as const;

/** Copy left, the real product right; both inside the first screen. One primary action. */
export function HomeHero({ hero, templates, priceFrom, deliveryDays }: HomeHeroProps) {
  return (
    <section aria-labelledby="hero-title" className="container-x grid items-center gap-8 pt-8 sm:pt-12 lg:grid-cols-[1fr_1.06fr] lg:gap-12 lg:pt-14">
      <div>
        <h1 id="hero-title" className="h-display h-hero stagger max-w-[11ch]">Turn your car into art.</h1>
        <p className="lead stagger mt-5 max-w-[36ch]" style={{ ["--d" as string]: "80ms" }}>
          Personalized posters made for your exact model, with your name on them. From {priceFrom}, delivered in {deliveryDays} business days.
        </p>
        <div className="stagger mt-8" style={{ ["--d" as string]: "160ms" }} data-hero-cta>
          <Button href="/create" size="lg">Create your poster</Button>
          <TrustPoints className="mt-5 max-lg:hidden" items={TRUST} />
        </div>
      </div>
      <HeroStudio entry={hero} templates={templates} />
      {/* On smaller screens the reassurance sits under the product, so the product still fits the first screen. */}
      <TrustPoints className="-mt-3 justify-center lg:hidden" items={TRUST} />
    </section>
  );
}
