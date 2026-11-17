import type { Metadata } from "next";
import { Faq } from "@/components/sell/Faq";
import { HOW_FAQ } from "@/content/faq";
import type { ReactNode } from "react";
import { CutoutFit } from "@/components/cars/CutoutFit";
import { ProofRow } from "@/components/home/HomeSections";
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


function Step({ n, title, body, children, visualClass = "stage-soft" }: { n: number; title: string; body: string; children: ReactNode; visualClass?: string }) {
  return (
    <li className="card flex h-full flex-col overflow-hidden">
      <div className={`${visualClass} relative h-28 sm:h-40`} aria-hidden="true">{children}</div>
      <div className="p-4 sm:p-6">
        <p className="spec">Step {n}</p>
        <h2 className="mt-0.5 text-[1.0625rem] font-semibold leading-snug tracking-[-0.02em] sm:text-[1.3125rem]">{title}</h2>
        <p className="mt-1.5 text-[0.9375rem] leading-snug text-muted">{body}</p>
      </div>
    </li>
  );
}

export default async function HowItWorksPage() {
  const repos = getRepositories();
  const [cars, templates, rules, sizes, products] = await Promise.all([repos.cars.listEntries(), repos.templates.list(), repos.products.getShippingRules(), repos.products.listSizes(), repos.products.listProducts()]);
  const pick = (slug: string) => cars.find((e) => e.generation.slug === slug) ?? cars[0]!;
  const step1 = pick("porsche-911-992");
  const step2 = pick("bmw-m4-g82");
  const photo1 = step1.generation.photos[0];
  const cheapest = products.flatMap((p) => p.variants).reduce((a, b) => (a.price.amount <= b.price.amount ? a : b));

  return (
    <>
      <PageHero title="From your car to your wall." lead="Four steps, about two minutes, no account." />

      <div className="container-x mt-8 sm:mt-10">
        <ol className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          <Step n={1} title="Pick your car" body="Search the catalog for your exact model and generation.">
            {photo1?.mode === "cutout" && <CutoutFit slug={step1.generation.slug} photo={photo1} sizes="(min-width:1024px) 280px, 46vw" className="absolute inset-x-[9%] bottom-[12%] top-[14%]" />}
          </Step>
          <Step n={2} title="Choose a style" body="Minimal, Blueprint, Racing, Heritage or Luxury, in three sizes." visualClass="wall">
            <div className="absolute inset-x-0 bottom-3 top-3 flex items-center justify-center gap-1.5 px-3 sm:gap-2">
              {templates.slice(0, 5).map((t) => (
                <div key={t.id} className="w-[16.5%] shrink-0"><WallPoster entry={step2} template={t} name="ALEX" kind="poster" /></div>
              ))}
            </div>
          </Step>
          <Step n={3} title="Add your name" body="A name, a line of text, a year and a place. The poster updates live.">
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4">
              <span className="spec self-start sm:self-center">Name</span>
              <span className="flex min-h-10 w-full max-w-[11rem] items-center rounded-xl bg-surface px-3 text-[1.0625rem] font-semibold shadow-[inset_0_0_0_2px_var(--lg-tint)]">Alex<span className="ml-0.5 inline-block h-5 w-0.5 animate-pulse bg-red" /></span>
            </div>
          </Step>
          <Step n={4} title="We print and ship" body="Checked at exact size, printed on heavyweight matte paper, shipped with tracking.">
            <div className="absolute inset-0 flex items-center justify-center gap-3">
              <span className="icon-tile"><IconPackage size={24} /></span>
              <span className="text-left leading-tight"><span className="block text-[1.75rem] font-bold tracking-[-0.03em] tabular-nums sm:text-[2.125rem]">{rules.minBusinessDays}–{rules.maxBusinessDays}</span><span className="spec block">business days</span></span>
            </div>
          </Step>
        </ol>
      </div>

      <ProofRow
        items={[
          [formatPrice(cheapest.price), "posters start at"],
          [String(sizes.length), `sizes, ${sizes.map((s) => s.label.replace(/ cm$/, "").replace(/ /g, "")).join(", ")} cm`],
          [formatPrice(rules.flatRate), "shipping, tracked to your door"],
          [`${rules.minBusinessDays}–${rules.maxBusinessDays}`, "business days to your door"],
        ]}
      />

      <Faq items={HOW_FAQ} />
    </>
  );
}
