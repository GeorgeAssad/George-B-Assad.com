import type { DemoReview } from "@/domain/content";
import { Badge } from "@/components/ui/Badge";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function SocialProof({ reviews }: { reviews: readonly DemoReview[] }) {
  return (
    <section aria-labelledby="proof-title" className="container-x py-24 sm:py-32">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <Reveal><SectionHeading id="proof-title" eyebrow="SC / 08 — Reviews" title="What owners say." /></Reveal>
        <Badge tone="demo">Demo content · not real reviews</Badge>
      </div>
      <ul className="mt-12 grid gap-4 md:grid-cols-3">
        {reviews.map((r, i) => (
          <li key={r.id}>
            <Reveal delay={i * 90} className="h-full">
              <figure className="card flex h-full flex-col p-6">
                <blockquote className="flex-1 text-lg leading-relaxed">“{r.quote}”</blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t border-line pt-4 text-sm">
                  <span className="font-semibold">{r.author}</span>
                  <span className="text-muted">{r.car} · {r.style}</span>
                </figcaption>
              </figure>
            </Reveal>
          </li>
        ))}
      </ul>
      <p className="mt-6 text-xs text-subtle">These are placeholder reviews written for the prototype. Real customer reviews will replace them after launch.</p>
    </section>
  );
}
