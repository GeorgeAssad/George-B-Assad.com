import type { MediaItem } from "@/data/media";
import type { CarEntry, DesignTemplate } from "@/domain/catalog";
import { PosterPreview } from "@/components/poster/PosterPreview";
import { Badge } from "@/components/ui/Badge";
import { IconInstagram, IconPlay, IconTikTok } from "@/components/ui/icons";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { siteConfig } from "@/config/site";

interface FeedSectionProps {
  readonly items: readonly MediaItem[];
  readonly entries: ReadonlyMap<string, CarEntry>;
  readonly templates: ReadonlyMap<string, DesignTemplate>;
}

/** Placeholder feed. `MediaItem.videoUrl/posterUrl` let a CMS or object store supply real clips later. */
export function FeedSection({ items, entries, templates }: FeedSectionProps) {
  return (
    <section aria-labelledby="feed-title" className="border-y border-line bg-surface py-24 sm:py-32">
      <div className="container-x">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <Reveal><SectionHeading id="feed-title" eyebrow="SC / 09 — Seen on the feed" title="Your car. Your wall." /></Reveal>
          <div className="flex items-center gap-3">
            <Badge tone="demo">Placeholder clips</Badge>
            <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full border border-line-strong text-muted hover:border-fg hover:text-fg" aria-label="Instagram (opens in a new tab)"><IconInstagram size={18} /></a>
            <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full border border-line-strong text-muted hover:border-fg hover:text-fg" aria-label="TikTok (opens in a new tab)"><IconTikTok size={18} /></a>
          </div>
        </div>
        <ul className="no-scrollbar mt-12 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible" aria-label="Social posts">
          {items.map((m, i) => {
            const entry = entries.get(m.carSlug);
            const template = templates.get(m.templateId);
            if (!entry || !template) return null;
            return (
              <li key={m.id} className="w-[58vw] max-w-[15rem] flex-none snap-start md:w-auto md:max-w-none">
                <Reveal delay={i * 70}>
                  <figure className="group relative overflow-hidden rounded-2xl border border-line bg-black">
                    <div className="zoom-img">
                      <PosterPreview template={template} vehicle={entry.generation.vehicle} customization={{ name: m.posterName }} vehicleName={entry.generation.displayName} specs={entry.generation.specs} sizeId="30x40" />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30" aria-hidden="true" />
                    {m.kind === "reel" && (
                      <span className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white backdrop-blur"><IconPlay size={16} /></span>
                    )}
                    <figcaption className="absolute inset-x-0 bottom-0 p-4 text-sm text-white">{m.caption}</figcaption>
                  </figure>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
