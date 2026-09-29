import type { Metadata } from "next";
import { Button } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "How it works",
  description: "Choose your car, pick a style, personalize it, and we create and ship your poster. Here is what happens at each step.",
  alternates: { canonical: "/how-it-works" },
};

const STEPS = [
  ["01", "Choose your car", "Search the catalog for your model and generation. The artwork is built around that specific car."],
  ["02", "Choose your style", "Minimal, Blueprint, Racing, Heritage or Luxury. Each is a design template with its own typography and details."],
  ["03", "Personalize", "Add your name, plus an optional line of text, a year and a place. You see the poster update live."],
  ["04", "We create and ship it", "After payment your design is finalized at exact print dimensions, checked, printed by a fulfilment partner and shipped with tracking."],
] as const;

const FAQ = [
  ["Is this a real store?", "Not yet. This is a prototype: checkout is a demonstration, no payment is taken, and nothing is shipped."],
  ["Is the artwork AI-generated?", "In the prototype the artwork is composed locally from generic silhouettes and templates. The production design engine will replace that step."],
  ["What will the print quality be?", "Print files are prepared at exact physical dimensions with bleed and a fixed resolution — not just a large image. Final paper and printer specifications will be published before launch."],
  ["Can I track my order without an account?", "Yes. Enter your order number on the tracking page. No account is needed."],
] as const;

export default function HowItWorksPage() {
  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading as="h1" eyebrow="SC / Process" title="How it works." lead="From your car to your wall, in four steps." />
      <ol className="mt-14 grid gap-4 md:grid-cols-2">
        {STEPS.map(([n, title, body]) => (
          <li key={n} className="card p-6 sm:p-8">
            <p className="spec">Step {n}</p>
            <h2 className="h-display mt-2 text-4xl">{title}</h2>
            <p className="mt-3 text-muted">{body}</p>
          </li>
        ))}
      </ol>

      <section aria-labelledby="faq-title" className="mt-24 max-w-3xl">
        <h2 id="faq-title" className="h-display text-4xl">Questions</h2>
        <div className="mt-6 divide-y divide-line border-y border-line">
          {FAQ.map(([q, a]) => (
            <details key={q} className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                {q}<span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-muted">{a}</p>
            </details>
          ))}
        </div>
      </section>
      <div className="mt-14"><Button href="/create" size="lg">Create your poster</Button></div>
    </div>
  );
}
