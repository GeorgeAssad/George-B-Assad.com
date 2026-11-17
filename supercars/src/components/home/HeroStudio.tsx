import Link from "next/link";
import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { CutoutFit } from "@/components/cars/CutoutFit";
import { VehicleArt } from "@/components/poster/VehicleArt";
import { WallPoster } from "@/components/showroom/WallPoster";
import { IconArrow } from "@/components/ui/icons";

/** The style shown first. */
const DEFAULT_STYLE = "racing";

/**
 * The product, live in the hero: the car in a dark studio, its framed poster on the wall, and a glass control card
 * that switches the poster between the five styles. The switch is plain HTML radios plus CSS (`:has`), so it works
 * before (and without) any script. Each style carries its own link into the designer.
 */
export function HeroStudio({ entry, templates }: { entry: CarEntry; templates: readonly DesignTemplate[] }) {
  const { generation } = entry;
  const photo = generation.photos[0];
  const styles = templates.slice(0, 5);
  const initial = Math.max(0, styles.findIndex((t) => t.id === DEFAULT_STYLE));

  return (
    <div className="stage scope-dark studio aspect-[4/5] w-full sm:aspect-[6/5] lg:aspect-auto lg:h-full lg:min-h-[34rem]">
      <div className="stage-floor" aria-hidden="true" />

      {/* The poster on the studio wall. */}
      <div className="absolute right-[6%] top-[6%] w-[29%] lg:w-[28%]" role="img" aria-label={`A framed poster of the ${generation.displayName} with the name Alex on it`}>
        {styles.map((t, i) => (
          <div key={t.id} data-i={i} aria-hidden="true"><WallPoster entry={entry} template={t} name="ALEX" kind="framed-poster" /></div>
        ))}
      </div>

      {/* Glass control card: floating over the studio, clear of the car and the poster. */}
      <fieldset className="lg-glass lg-glass--media absolute left-[5%] top-[6%] w-[57%] p-3.5 sm:p-5 lg:w-[54%]">
        <legend className="sr-only">Poster style</legend>
        <p className="text-[0.9375rem] font-semibold leading-tight tracking-[-0.01em] sm:text-[1.0625rem]">{generation.displayName}</p>
        <p className="lg-secondary mt-0.5 text-[0.8125rem]">Framed poster · 40 × 60 cm</p>
        <div className="mt-3 flex gap-1.5 sm:mt-4 sm:gap-2.5">
          {styles.map((t, i) => (
            <label key={t.id} className="relative block">
              <input type="radio" name="hero-style" value={i} defaultChecked={i === initial} className="absolute -inset-x-[3px] -inset-y-2 cursor-pointer appearance-none rounded-full opacity-0 sm:-inset-x-[5px] sm:-inset-y-1" />
              <span className="swatch max-sm:!size-7" style={{ background: `linear-gradient(135deg, ${t.layout.background.base} 0 58%, ${t.layout.accent} 58% 100%)` }} />
              <span className="sr-only">{t.name}</span>
            </label>
          ))}
        </div>
        {styles.map((t, i) => (
          <div key={t.id} data-i={i} className="mt-3 sm:mt-4">
            <p className="text-[0.9375rem] font-semibold leading-tight">{t.name}</p>
            <p className="lg-secondary mt-0.5 text-[0.8125rem] leading-snug max-sm:hidden">{t.tagline}</p>
            <Link href={`/create?car=${generation.slug}&style=${t.id}&size=40x60`} prefetch={false} className="btn btn-glass btn-sm mt-3 !text-white" aria-label={`Design this poster in the ${t.name} style`}>
              Design this poster <IconArrow size={16} />
            </Link>
          </div>
        ))}
      </fieldset>

      {/* The car. */}
      <div className="drive-in absolute inset-x-[4%] bottom-[5%] h-[40%] sm:h-[44%]">
        {photo?.mode === "cutout" ? (
          <CutoutFit slug={generation.slug} photo={photo} priority sizes="(min-width:1024px) 600px, 96vw" alt={photo.alt} className="absolute inset-0" />
        ) : (
          <div className="absolute inset-x-[6%] bottom-0 text-white/70"><VehicleArt vehicle={generation.vehicle} treatment="outline" ink="currentColor" shadow={false} className="block w-full" /></div>
        )}
      </div>
    </div>
  );
}
