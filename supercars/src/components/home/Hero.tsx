import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { Button } from "@/components/ui/Button";
import { IconArrow, IconPackage, IconPalette, IconShield } from "@/components/ui/icons";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { HeroParallax } from "./HeroParallax";

interface HeroProps {
  readonly main: CarEntry;
  readonly second: CarEntry;
  readonly racing: DesignTemplate;
  readonly blueprint: DesignTemplate;
}

export function Hero({ main, second, racing, blueprint }: HeroProps) {
  return (
    <section aria-labelledby="hero-title" className="relative isolate overflow-hidden border-b border-line">
      {/* Atmosphere: engineering grid, red horizon glow, faint vertical speed lines */}
      <div className="tech-grid absolute inset-0 -z-10 opacity-60" aria-hidden="true" />
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_70%_50%_at_60%_88%,color-mix(in_srgb,var(--red)_26%,transparent),transparent_72%)]" aria-hidden="true" />
      <div className="speed-lines absolute inset-x-0 top-0 -z-10 h-full opacity-70" aria-hidden="true" />

      <div className="container-x grid items-center gap-8 py-8 lg:min-h-[calc(100svh-4.5rem)] lg:grid-cols-[1.05fr_1fr] lg:gap-6 lg:py-16">
        <div className="relative z-10">
          <p className="eyebrow stagger" style={{ ["--d" as string]: "60ms" }}>SC / 01 — Personalized automotive artwork</p>
          <h1 id="hero-title" className="h-display stagger mt-5 text-[clamp(3.5rem,12vw,8.6rem)]" style={{ ["--d" as string]: "160ms" }}>
            Turn your car into <span className="text-red-text">art.</span>
          </h1>
          <p className="stagger mt-6 max-w-md text-lg text-muted sm:text-xl" style={{ ["--d" as string]: "300ms" }}>
            Premium personalized automotive artwork, made for your car.
          </p>
          <div className="stagger mt-8 flex flex-col gap-3 sm:flex-row" style={{ ["--d" as string]: "420ms" }}>
            <Button href="/create" size="lg">Create your poster <IconArrow size={18} /></Button>
            <Button href="/cars" variant="secondary" size="lg">Explore cars</Button>
          </div>
          <ul className="stagger mt-10 hidden flex-wrap sm:flex gap-x-7 gap-y-3 text-sm text-muted" style={{ ["--d" as string]: "540ms" }}>
            <li className="flex items-center gap-2"><IconPalette size={17} className="text-red-text" /> Made for your exact car</li>
            <li className="flex items-center gap-2"><IconPackage size={17} className="text-red-text" /> Printed &amp; shipped to your door</li>
            <li className="flex items-center gap-2"><IconShield size={17} className="text-red-text" /> Demo checkout, no real payment</li>
          </ul>
        </div>

        {/* Poster + car scene */}
        <HeroParallax className="relative mx-auto aspect-[5/5.7] w-full max-w-[30rem] sm:max-w-[36rem] lg:max-w-none">
          <div className="hero-layer hero-in absolute right-[0%] top-[0%] w-[40%] rotate-[7deg] overflow-hidden rounded-sm shadow-[0_40px_80px_-30px_rgba(0,0,0,0.9)] ring-1 ring-white/10" style={{ ["--depth" as string]: "0.6", ["--rot" as string]: "7deg", ["--from-rot" as string]: "12deg", ["--d" as string]: "380ms" }}>
            <PosterPreview template={blueprint} vehicle={second.generation.vehicle} customization={{ name: "ALEX", year: "2024" }} vehicleName={second.generation.displayName} specs={second.generation.specs} sizeId="40x60" />
          </div>
          <div className="hero-layer hero-in absolute left-[6%] top-[3%] w-[56%] -rotate-[4deg] overflow-hidden rounded-sm shadow-[0_50px_90px_-30px_rgba(0,0,0,0.95)] ring-1 ring-white/10" style={{ ["--depth" as string]: "1", ["--rot" as string]: "-4deg", ["--from-rot" as string]: "-9deg", ["--d" as string]: "200ms" }}>
            <PosterPreview template={racing} vehicle={main.generation.vehicle} customization={{ name: "GEORGE", text: "Sunday Drive", year: "2024" }} vehicleName={main.generation.displayName} specs={main.generation.specs} sizeId="50x70" />
          </div>
          <div className="hero-layer hero-in absolute inset-x-[-3%] bottom-[-1%]" style={{ ["--depth" as string]: "1.6", ["--d" as string]: "560ms" }}>
            <VehicleArt vehicle={main.generation.vehicle} shadowOpacity={0.85} />
          </div>
          <div className="absolute inset-x-[4%] bottom-[3.5%] h-px bg-gradient-to-r from-transparent via-fg/25 to-transparent" aria-hidden="true" />
          <span className="spec absolute bottom-[-4%] right-0 hidden sm:block">Prototype artwork · not to scale</span>
        </HeroParallax>
      </div>
    </section>
  );
}
