import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";

export interface Benefit {
  readonly icon: ReactNode;
  readonly title: string;
  readonly body: string;
}

/** Why buy here: four short, true benefits right under the hero. */
export function Benefits({ items }: { items: readonly Benefit[] }) {
  return (
    <section aria-label="Why SuperCars" className="container-x mt-10 sm:mt-14">
      <ul className="grid grid-cols-2 gap-x-4 gap-y-6 border-y-[0.5px] border-line py-6 sm:py-8 lg:grid-cols-4 lg:gap-6">
        {items.map((b, i) => (
          <li key={b.title}>
            <Reveal delay={i * 50} className="flex flex-col gap-3 sm:flex-row sm:items-start">
              <span className="icon-tile icon-tile-soft">{b.icon}</span>
              <span>
                <span className="block text-[1rem] font-semibold leading-snug tracking-[-0.01em] sm:text-[1.0625rem]">{b.title}</span>
                <span className="mt-0.5 block text-[0.875rem] leading-snug text-muted sm:text-[0.9375rem]">{b.body}</span>
              </span>
            </Reveal>
          </li>
        ))}
      </ul>
    </section>
  );
}
