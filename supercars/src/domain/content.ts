import type { TemplateId } from "./catalog";

/** Demo review shown on the homepage. Always flagged so the UI can label it as placeholder content. */
export interface DemoReview {
  readonly id: string;
  readonly author: string;
  readonly car: string;
  readonly style: string;
  readonly quote: string;
  readonly isDemo: true;
}

/** Social/media item. `videoUrl`/`posterUrl` let a CMS or object storage supply real clips later. */
export interface MediaItem {
  readonly id: string;
  readonly kind: "reel" | "post";
  readonly caption: string;
  /** Slug of a car whose local artwork stands in for the thumbnail. */
  readonly carSlug: string;
  readonly templateId: TemplateId;
  /** Demo name printed on the stand-in poster. */
  readonly posterName: string;
  readonly videoUrl?: string;
  readonly posterUrl?: string;
  readonly isDemo: true;
}
