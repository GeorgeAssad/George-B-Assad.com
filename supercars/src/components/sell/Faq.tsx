import type { FaqItem } from "@/content/faq";

/** Short questions and answers as native disclosure widgets (keyboard and screen-reader friendly, no script). */
export function Faq({ items, title = "Questions", id = "faq-title", className = "" }: { items: readonly FaqItem[]; title?: string; id?: string; className?: string }) {
  return (
    <section aria-labelledby={id} className={`container-x section-t grid gap-5 lg:grid-cols-[0.6fr_1.4fr] lg:gap-12 ${className}`}>
      <div>
        <h2 id={id} className="h-display h-section">{title}</h2>
        <p className="mt-3 max-w-[28ch] text-[0.9375rem] text-muted">Something else? Ask us in the chat at the bottom of the page.</p>
      </div>
      <div className="card divide-y-[0.5px] divide-line px-5 sm:px-6">
        {items.map(({ q, a }) => (
          <details key={q} className="group py-4">
            <summary className="flex min-h-7 cursor-pointer list-none items-center justify-between gap-4 rounded font-semibold [&::-webkit-details-marker]:hidden">
              {q}<span aria-hidden="true" className="text-xl font-normal text-subtle transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-2 max-w-2xl text-[0.9375rem] text-muted">{a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
