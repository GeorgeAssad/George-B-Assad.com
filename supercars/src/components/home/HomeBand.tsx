import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { WallPoster } from "@/components/showroom/WallPoster";
import { Reveal } from "@/components/ui/Reveal";
import { IconGauge, IconPackage, IconPalette, IconShield, IconTruck } from "@/components/ui/icons";

const STEPS = [
  { title: "Pick your car", body: "Your exact model and generation.", icon: <IconGauge size={22} /> },
  { title: "Choose a style", body: "Five looks, three sizes.", icon: <IconPalette size={22} /> },
  { title: "Add your name", body: "Preview it live as you type.", icon: <span className="font-display text-xl font-bold leading-none" aria-hidden="true">Aa</span> },
  { title: "We print & ship", body: "Made to order, tracked to your door.", icon: <IconPackage size={22} /> },
] as const;

/** Rotation of each print in the fan, left to right. */
const FAN = [-17, -8.5, 0, 8.5, 17] as const;

interface HomeBandProps {
  readonly entry: CarEntry;
  readonly templates: readonly DesignTemplate[];
  /** Ready-made sentences for the trust strip (delivery, paper, checkout). */
  readonly facts: readonly string[];
}

/**
 * Scene two: what happens after the click, in one band. The four steps on the left; on the right the five styles
 * hanging like prints in a hand. Nothing here repeats the navigation or the header's Create button.
 */
export function HomeBand({ entry, templates, facts }: HomeBandProps) {
  return (
    <section aria-labelledby="band-title" className="on-dark wall-dark relative isolate overflow-hidden border-t border-line text-fg">
      <div className="picture-light" aria-hidden="true" />
      <div className="container-x section-y grid items-center gap-8 lg:grid-cols-[1fr_1.05fr] lg:gap-14">
        <Reveal>
          <p className="eyebrow">How it works</p>
          <h2 id="band-title" className="h-display mt-3 text-[clamp(2rem,5vw,3.5rem)]">Four steps. One poster.</h2>
          <ol className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 sm:mt-6 sm:gap-x-5 sm:gap-y-5">
            {STEPS.map((s, i) => (
              <li key={s.title} className="flex gap-3">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-full border border-line-strong text-red-text">{s.icon}</span>
                <span className="min-w-0">
                  <span className="spec block text-[0.625rem]">Step 0{i + 1}</span>
                  <span className="mt-0.5 block font-semibold leading-tight">{s.title}</span>
                  <span className="mt-0.5 block text-sm leading-snug text-muted max-sm:hidden">{s.body}</span>
                </span>
              </li>
            ))}
          </ol>
        </Reveal>

        <Reveal delay={120}>
          <div className="fan relative mx-auto aspect-[10/7] w-full max-w-[34rem]" role="img" aria-label={`The five poster styles, shown on a ${entry.generation.displayName}: ${templates.map((t) => t.name).join(", ")}`}>
            {templates.slice(0, FAN.length).map((t, i) => (
              <div key={t.id} aria-hidden="true" className="absolute bottom-[4%] left-[31%] w-[38%]" style={{ ["--r" as string]: `${FAN[i]}deg`, zIndex: i === 2 ? 5 : i < 2 ? i : 4 - (i - 3) }}>
                <WallPoster entry={entry} template={t} name="ALEX" kind="poster" />
              </div>
            ))}
          </div>
        </Reveal>
      </div>

      <div className="border-t border-line">
        <ul className="container-x flex flex-col gap-2 py-3 text-sm text-muted sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          {[<IconTruck key="t" size={18} />, <IconPackage key="p" size={18} />, <IconShield key="s" size={18} />].map((icon, i) => (
            <li key={i} className="flex items-center gap-2"><span className="text-red-text" aria-hidden="true">{icon}</span>{facts[i]}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
