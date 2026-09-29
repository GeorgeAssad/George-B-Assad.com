import { Reveal } from "@/components/ui/Reveal";

export function BrandStatement() {
  return (
    <section aria-labelledby="statement-title" className="cv-auto container-x py-24 sm:py-32">
      <Reveal>
        <p className="eyebrow">SC / 02 — The idea</p>
        <h2 id="statement-title" className="h-display mt-6 max-w-5xl text-[clamp(2.6rem,7.5vw,6.5rem)]">
          Every car has a story. <span className="text-muted">We compose yours into a piece that belongs on the wall.</span>
        </h2>
      </Reveal>
      <Reveal delay={120}>
        <div className="mt-10 grid grid-cols-1 gap-8 border-t border-line pt-8 sm:grid-cols-3">
          {[
            ["Your exact car", "Pick the model and generation. The artwork is built around it, not a generic stock car."],
            ["Your name on it", "Add your name, a year and a place. It makes the print unmistakably yours."],
            ["Designed, not templated", "Five considered styles, from quiet Minimal to full Racing, each with its own typography."],
          ].map(([title, body]) => (
            <div key={title}>
              <h3 className="text-sm font-semibold uppercase tracking-[0.14em]">{title}</h3>
              <p className="mt-2 text-muted">{body}</p>
            </div>
          ))}
        </div>
      </Reveal>
    </section>
  );
}
