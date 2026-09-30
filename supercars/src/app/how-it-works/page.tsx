import type { Metadata } from "next";
import type { ReactNode } from "react";
import { CutoutFit } from "@/components/cars/CutoutFit";
import { HeroCar } from "@/components/showroom/HeroCar";
import { PageHero } from "@/components/showroom/PageHero";
import { WallPoster } from "@/components/showroom/WallPoster";
import { IconPackage } from "@/components/ui/icons";
import { formatPrice } from "@/lib/format";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "How it works",
  description: "Pick your car, choose a style, add your name, and we print and ship your poster. Here is what happens at each step.",
  alternates: { canonical: "/how-it-works" },
};

const FAQ = [
  ["Is this a real store?", "Not yet. This is a prototype: checkout is a demonstration, no payment is taken, and nothing is shipped."],
  ["Is the artwork AI-generated?", "In the prototype the artwork is composed locally from generic silhouettes and templates. The production design engine will replace that step."],
  ["What will the print quality be?", "Print files are prepared at exact physical dimensions with bleed and a fixed resolution — not just a large image. Final paper and printer specifications will be published before launch."],
  ["Can I track my order without an account?", "Yes. Enter your order number on the tracking page. No account is needed."],
] as const;

function Step({ n, title, body, children }: { n: string; title: string; body: string; children: ReactNode }) {
  return (
    <li className="card flex flex-col overflow-hidden">
      <div className="on-dark studio-stage relative isolate h-24 overflow-hidden border-b border-line sm:h-40" aria-hidden="true">{children}</div>
      <div className="p-3 sm:p-5">
        <p className="spec">Step {n}</p>
        <h2 className="h-display mt-1 text-xl sm:text-3xl">{title}</h2>
        <p className="mt-1.5 text-xs text-muted sm:text-base">{body}</p>
      </div>
    </li>
  );
}

export default async function HowItWorksPage() {
  const repos = getRepositories();
  const [cars, templates, rules, sizes, products] = await Promise.all([repos.cars.listEntries(), repos.templates.list(), repos.products.getShippingRules(), repos.products.listSizes(), repos.products.listProducts()]);
  const pick = (slug: string) => cars.find((e) => e.generation.slug === slug) ?? cars[0]!;
  const step1 = pick("porsche-911-gt3-rs-992");
  const step2 = pick("bmw-m4-g82");
  const step3 = pick("audi-rs6-c8");
  const hero = pick("mercedes-amg-gt-c190");
  const photo1 = step1.generation.photos[0];
  const cheapest = products.flatMap((p) => p.variants).reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));
  const facts: readonly (readonly [string, string])[] = [
    ["Delivery", `${rules.minBusinessDays}–${rules.maxBusinessDays} business days`],
    ["Sizes", `${sizes.map((s) => s.label.replace(/ cm$/, "").replace(/ /g, "")).join(", ")} cm`],
    ["Posters from", formatPrice(cheapest.price)],
    ["Shipping", `${formatPrice(rules.flatRate)}, free over ${formatPrice(rules.freeOver)}`],
  ];

  return (
    <>
      <PageHero
        eyebrow="SC / Process"
        title={<>From your car to <span className="text-red-text">your wall.</span></>}
        lead="Four steps, about two minutes, no account."
        word="Steps"
        visual={<HeroCar entry={hero} priority />}
      />

      <div className="container-x section-y">
        <ol className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4 lg:gap-5">
          <Step n="01" title="Pick your car" body="Search the catalog for your exact model and generation.">
            {photo1?.mode === "cutout" && (
              <>
                <div className="studio-floor absolute inset-x-0 bottom-0 h-1/2" />
                <CutoutFit slug={step1.generation.slug} photo={photo1} sizes="(min-width:1024px) 22vw, 46vw" className="absolute inset-x-[8%] bottom-[10%] top-[10%]" />
              </>
            )}
          </Step>
          <Step n="02" title="Choose a style" body="Minimal, Blueprint, Racing, Heritage or Luxury, in three sizes.">
            <div className="absolute inset-x-0 bottom-3 top-4 flex items-end justify-center gap-1.5 px-3">
              {templates.slice(0, 5).map((t) => (
                <div key={t.id} className="w-[18%] shrink-0"><WallPoster entry={step2} template={t} name="ALEX" kind="poster" /></div>
              ))}
            </div>
          </Step>
          <Step n="03" title="Add your name" body="Name, a line of text, a year and a place. Watch the poster update live.">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 sm:gap-2">
              <span className="spec text-[0.625rem]">Your name</span>
              <span className="rounded-lg border border-line-strong bg-white/5 px-4 py-0.5 font-display text-2xl font-bold tracking-wide sm:px-5 sm:py-2 sm:text-4xl">ALEX<span className="ml-0.5 inline-block h-[0.9em] w-0.5 translate-y-1 animate-pulse bg-red" /></span>
              <span className="spec text-[0.625rem] text-muted">{step3.car.name} · 2024</span>
            </div>
          </Step>
          <Step n="04" title="We print & ship" body="Checked at exact size, printed on heavyweight matte paper, shipped with tracking.">
            <div className="absolute inset-0 flex items-center justify-center gap-2 text-red-text sm:gap-4">
              <IconPackage size={36} />
              <span className="block h-px w-8 bg-line-strong sm:w-12" />
              <span className="font-display text-3xl font-bold leading-none text-fg sm:text-5xl">{rules.minBusinessDays}–{rules.maxBusinessDays}<span className="block text-center text-xs font-normal uppercase tracking-[0.18em] text-muted">days</span></span>
            </div>
          </Step>
        </ol>

        <dl className="mt-5 grid grid-cols-2 gap-x-4 gap-y-4 border-y border-line py-4 sm:mt-6 sm:gap-y-5 sm:py-5 lg:grid-cols-4">
          {facts.map(([label, value]) => (
            <div key={label}>
              <dt className="spec">{label}</dt>
              <dd className="mt-1 font-semibold tabular-nums">{value}</dd>
            </div>
          ))}
        </dl>

        <section aria-labelledby="faq-title" className="mt-6 grid gap-3 sm:mt-8 lg:grid-cols-[0.6fr_1.4fr] lg:gap-12">
          <h2 id="faq-title" className="h-display text-3xl sm:text-4xl">Questions</h2>
          <div className="divide-y divide-line border-y border-line">
            {FAQ.map(([q, a]) => (
              <details key={q} className="group py-3.5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {q}<span aria-hidden="true" className="text-xl text-muted transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-muted">{a}</p>
              </details>
            ))}
          </div>
        </section>
      </div>
    </>
  );
}
