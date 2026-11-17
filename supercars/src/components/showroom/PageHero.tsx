import type { ReactNode } from "react";

interface PageHeroProps {
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  /** Optional small label above the title. Use sparingly. */
  readonly eyebrow?: string;
  readonly children?: ReactNode;
}

/** The opening of every inner page: one big title, one line of copy. Type and space carry it. */
export function PageHero({ title, lead, eyebrow, children }: PageHeroProps) {
  return (
    <div className="container-x pt-[clamp(2.25rem,6vw,4.5rem)]">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h1 className="h-display h-page max-w-[16ch]">{title}</h1>
      {lead && <p className="lead mt-4 max-w-[46ch]">{lead}</p>}
      {children}
    </div>
  );
}
