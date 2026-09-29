import type { AnalyticsEventMap, AnalyticsEventName } from "@/domain/analytics";

/** Vendor-neutral analytics boundary. GA, Meta Pixel, TikTok Pixel and server-side
 * events each become an `AnalyticsProvider`; components only ever call `track()`. */
export interface AnalyticsProvider {
  readonly id: string;
  track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void;
}
