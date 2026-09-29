import type { Metadata } from "next";
import { CarPhotoImage } from "@/components/cars/CarPhotoImage";
import { CutoutFit } from "@/components/cars/CutoutFit";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = {
  title: "Photo credits",
  description: "Every car image on SuperCars, with its author, licence and source.",
  alternates: { canonical: "/credits" },
};

export default async function CreditsPage() {
  const entries = await getRepositories().cars.listEntries();
  const rows = entries.flatMap((e) => e.generation.photos.map((photo) => ({ entry: e, photo })));

  return (
    <div className="container-x py-12 sm:py-16">
      <SectionHeading
        as="h1"
        eyebrow="SC / Credits"
        title="Photo credits."
        lead="The car images on this site are free-licensed photographs or images we made ourselves. We thank the photographers below. The poster artwork itself is drawn by us."
      />
      <div className="mt-8 max-w-3xl space-y-3 text-sm text-muted">
        <p>Changes made: cropped, resized, compressed for the web and, where visible, licence plates and faces covered; in most images the background has been removed. Colours may be graded by the page they appear on.</p>
        <p>Photographs by others are used only under CC0, public-domain or CC&nbsp;BY licences. Vehicle names and badges appear only because the photographed cars carry them; SuperCars is not affiliated with any manufacturer.</p>
      </div>

      {rows.length === 0 ? (
        <p className="mt-12 text-muted">No photographs are used yet.</p>
      ) : (
        <ul className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {rows.map(({ entry, photo }) => (
            <li key={`${entry.generation.slug}/${photo.id}`} className="card overflow-hidden">
              {photo.mode === "cutout" ? (
                <div className="on-dark studio-stage relative aspect-[3/2] overflow-hidden">
                  <CutoutFit slug={entry.generation.slug} photo={photo} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" className="absolute inset-x-[6%] bottom-[10%] top-[10%]" />
                </div>
              ) : (
                <div className="aspect-[3/2] overflow-hidden bg-elevated">
                  <CarPhotoImage slug={entry.generation.slug} photo={photo} sizes="(min-width:1024px) 30vw, (min-width:640px) 45vw, 92vw" />
                </div>
              )}
              <div className="space-y-1.5 p-4 text-sm">
                <p className="spec">{entry.generation.displayName}</p>
                <p className="text-fg">{photo.credit.title}</p>
                <p className="text-muted">By {photo.credit.author}</p>
                {photo.credit.kind === "third-party" ? (
                  <p className="text-muted">
                    <a href={photo.credit.licenseUrl} target="_blank" rel="noopener noreferrer license" className="underline underline-offset-4 hover:text-fg">{photo.credit.licenseName}</a>
                    {" · "}
                    <a href={photo.credit.sourceUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-4 hover:text-fg">Original on {photo.credit.sourceName ?? "source"}</a>
                    <span className="sr-only"> (links open in a new tab)</span>
                  </p>
                ) : (
                  <p className="text-muted">{photo.credit.note ?? "Image made by SuperCars."}</p>
                )}
                {photo.credit.kind === "third-party" && photo.credit.note && <p className="text-xs text-subtle">{photo.credit.note}</p>}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
