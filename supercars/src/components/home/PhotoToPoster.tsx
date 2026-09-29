import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { CarPhotoImage } from "@/components/cars/CarPhotoImage";
import { PhotoCredit } from "@/components/cars/PhotoCredit";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { ProductFrame } from "@/components/poster/ProductFrame";
import { Button } from "@/components/ui/Button";
import { IconArrow } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

/** The pitch in one picture: the real car on the left, the artwork made from it on the right. */
export function PhotoToPoster({ entry, template }: { entry: CarEntry; template: DesignTemplate }) {
  const photo = entry.generation.photos[0];
  if (!photo) return null;
  return (
    <section aria-labelledby="idea-title" className="cv-auto container-x py-24 sm:py-32">
      <Reveal>
        <SectionHeading id="idea-title" eyebrow="From car to art" title="From the street to the wall." lead="Start with the machine you love. We turn it into a piece worth hanging." />
      </Reveal>
      <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-[1.35fr_1fr]">
        <Reveal className="h-full">
          <figure className="on-dark card relative isolate flex h-full min-h-[18rem] flex-col justify-end overflow-hidden bg-bg">
            <div className="absolute inset-0 -z-10">
              <CarPhotoImage slug={entry.generation.slug} photo={photo} sizes="(min-width:1024px) 56vw, 92vw" className="photo-cinema" />
            </div>
            <div className="absolute inset-0 -z-10 bg-[linear-gradient(180deg,transparent_45%,rgb(0_0_0/0.78)_100%)]" aria-hidden="true" />
            <figcaption className="p-5 sm:p-7">
              <p className="spec text-white/80">01 — The car</p>
              <p className="h-display mt-1 text-4xl text-white sm:text-5xl">{entry.generation.displayName}</p>
              <PhotoCredit photo={photo} className="mt-2 text-white/70" />
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={120} className="h-full">
          <div className="card flex h-full flex-col overflow-hidden">
            <div className="wall relative flex flex-1 items-center justify-center px-8 pb-10 pt-14 sm:px-14">
              <div className="absolute left-1/2 top-5 h-1.5 w-24 -translate-x-1/2 rounded-full bg-fg/70 shadow-[0_18px_40px_14px_color-mix(in_srgb,var(--fg)_22%,transparent)]" aria-hidden="true" />
              <div className="w-[62%] max-w-[15rem]">
                <ProductFrame variant="framed-poster">
                  <PosterPreview template={template} vehicle={entry.generation.vehicle} customization={{ name: "ALEX", year: "2024" }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId="40x60" />
                </ProductFrame>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line p-5 sm:p-6">
              <div>
                <p className="spec">02 — The poster</p>
                <p className="mt-1 text-sm text-muted">Illustrated, personalised, printed.</p>
              </div>
              <Button href={`/create?car=${entry.generation.slug}`} variant="secondary">Create yours <IconArrow size={16} /></Button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
