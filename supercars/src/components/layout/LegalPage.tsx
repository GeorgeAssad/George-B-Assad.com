import type { ReactNode } from "react";
import { Badge } from "@/components/ui/Badge";
import { SectionHeading } from "@/components/ui/SectionHeading";

interface LegalPageProps {
  readonly eyebrow?: string;
  readonly title: string;
  readonly intro: ReactNode;
  readonly children: ReactNode;
}

/** Shared frame for the placeholder legal pages. No legal claims are made here. */
export function LegalPage({ eyebrow, title, intro, children }: LegalPageProps) {
  return (
    <div className="container-x pt-[clamp(2.25rem,6vw,4.5rem)]">
      <SectionHeading as="h1" eyebrow={eyebrow} title={title} />
      <div className="mt-6"><Badge tone="demo">Placeholder — final text to be added before launch</Badge></div>
      <div className="mt-8 max-w-3xl space-y-8 text-muted [&_a]:text-fg [&_a]:underline [&_a]:underline-offset-4 [&_h2]:text-fg [&_strong]:text-fg">
        <p className="lead">{intro}</p>
        {children}
      </div>
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="text-[1.3125rem] font-semibold tracking-[-0.02em]">{title}</h2>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}
