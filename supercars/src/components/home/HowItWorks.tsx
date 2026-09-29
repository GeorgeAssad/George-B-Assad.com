import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { IconGauge, IconPackage, IconPalette } from "@/components/ui/icons";

const STEPS = [
  { n: "01", title: "Choose your car", body: "Search the catalog and pick your model and generation.", icon: <IconGauge size={26} /> },
  { n: "02", title: "Choose your style", body: "Minimal, Blueprint, Racing, Heritage or Luxury.", icon: <IconPalette size={26} /> },
  { n: "03", title: "Personalize", body: "Add your name, a line of text, a year and a location. Preview it live.", icon: <span className="font-display text-2xl font-bold" aria-hidden="true">Aa</span> },
  { n: "04", title: "We create and ship it", body: "Your design is produced, printed and shipped to your door.", icon: <IconPackage size={26} /> },
] as const;

export function HowItWorks() {
  return (
    <section aria-labelledby="how-title" className="cv-auto border-y border-line bg-surface py-20 sm:py-28">
      <div className="container-x">
        <Reveal><SectionHeading id="how-title" eyebrow="SC / 03 — How it works" title="Four steps. One poster." /></Reveal>
        <ol className="relative mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((s, i) => (
            <li key={s.n}>
              <Reveal delay={i * 90} className="h-full">
                <div className="card relative h-full overflow-hidden p-6">
                  {/* Decorative watermark drawn with a pseudo-element, so it is not text content. */}
                  <span data-n={s.n} className="pointer-events-none absolute -right-2 -top-4 font-display text-[7.5rem] font-bold leading-none text-fg/[0.045] after:content-[attr(data-n)]" aria-hidden="true" />
                  <div className="flex size-12 items-center justify-center rounded-full border border-line-strong text-red-text">{s.icon}</div>
                  <p className="spec mt-6">Step {s.n}</p>
                  <h3 className="h-display mt-2 text-3xl">{s.title}</h3>
                  <p className="mt-3 text-muted">{s.body}</p>
                </div>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
