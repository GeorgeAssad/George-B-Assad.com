import { Button } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { IconArrow } from "@/components/ui/icons";

export function FinalCta() {
  return (
    <section aria-labelledby="final-title" className="container-x py-24 sm:py-32">
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-[2rem] border border-line-strong bg-surface px-6 py-20 text-center sm:px-16 sm:py-28">
          <div className="tech-grid absolute inset-0 -z-10 opacity-70" aria-hidden="true" />
          <div className="absolute -bottom-32 left-1/2 -z-10 h-72 w-[46rem] -translate-x-1/2 rounded-full bg-red/30 blur-[110px]" aria-hidden="true" />
          <p className="eyebrow justify-center">SC / 10 — Start</p>
          <h2 id="final-title" className="h-display mx-auto mt-6 max-w-4xl text-[clamp(3rem,9vw,7.5rem)]">
            Your car deserves <span className="text-red-text">a wall.</span>
          </h2>
          <p className="mx-auto mt-6 max-w-md text-lg text-muted">It takes about a minute to design. Pick your car and see the poster before you buy.</p>
          <div className="mt-10 flex justify-center"><Button href="/create" size="lg">Create your poster <IconArrow size={18} /></Button></div>
        </div>
      </Reveal>
    </section>
  );
}
