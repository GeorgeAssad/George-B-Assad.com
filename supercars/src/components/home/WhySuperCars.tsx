import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconChat, IconGauge, IconPackage, IconPalette, IconTruck } from "@/components/ui/icons";

const REASONS = [
  { icon: <IconGauge size={24} />, title: "Made for your car", body: "Built around your exact model and generation, not a generic silhouette." },
  { icon: <IconPalette size={24} />, title: "Premium design", body: "Five art-directed styles with proper typography and technical detail." },
  { icon: <IconPackage size={24} />, title: "High-quality printing", body: "Printed by a fulfilment partner on heavyweight matte art paper." },
  { icon: <IconChat size={24} />, title: "Personalized", body: "Your name, year and place on the print. No two are the same." },
  { icon: <IconTruck size={24} />, title: "Delivered to your door", body: "Tracked shipping, with an order page you can check any time." },
] as const;

export function WhySuperCars() {
  return (
    <section aria-labelledby="why-title" className="border-y border-line bg-surface py-24 sm:py-32">
      <div className="container-x">
        <Reveal><SectionHeading id="why-title" eyebrow="SC / 07 — Why SuperCars" title="Built for car people." /></Reveal>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl border border-line bg-line sm:grid-cols-2 lg:grid-cols-5">
          {REASONS.map((r, i) => (
            <li key={r.title} className="bg-surface">
              <Reveal delay={i * 60} className="h-full">
                <div className="h-full p-6">
                  <div className="text-red-text">{r.icon}</div>
                  <h3 className="mt-5 text-sm font-semibold uppercase tracking-[0.12em]">{r.title}</h3>
                  <p className="mt-2 text-sm text-muted">{r.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
