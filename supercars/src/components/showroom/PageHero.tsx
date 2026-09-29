import type { ReactNode } from "react";
import { ShowroomStage } from "./ShowroomStage";

interface PageHeroProps {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  /** Optional picture on the right (a cut-out car). Hidden on phones so the page stays short. */
  readonly visual?: ReactNode;
  readonly word?: string;
}

/** The same cinematic opening for every inner page: light cone, big title, one line of copy. */
export function PageHero({ eyebrow, title, lead, visual, word }: PageHeroProps) {
  return (
    <ShowroomStage className="border-b border-line" word={word} wordClassName="is-right top-[10%] text-[clamp(6rem,16vw,14rem)] max-md:hidden">
      <div className={`container-x relative grid items-center gap-4 py-7 sm:py-10 lg:py-12 ${visual ? "md:grid-cols-[1.05fr_0.95fr]" : ""}`}>
        <div>
          <p className="eyebrow">{eyebrow}</p>
          <h1 className="h-display mt-3 text-[clamp(2.4rem,6.2vw,4.75rem)]">{title}</h1>
          {lead && <p className="mt-3 max-w-xl text-muted sm:text-lg">{lead}</p>}
        </div>
        {visual && <div className="relative hidden h-[clamp(8rem,22svh,15rem)] md:block">{visual}</div>}
      </div>
    </ShowroomStage>
  );
}
