import type { AnalyticsEventMap, AnalyticsEventName } from "@/domain/analytics";
import { mockAnalyticsProvider } from "./mock-provider";
import type { AnalyticsProvider } from "./types";

export type { AnalyticsProvider } from "./types";

/* Register real providers here later (after consent handling), e.g.
 *   providers.push(googleAnalyticsProvider, metaPixelProvider, tiktokPixelProvider)
 * No vendor code belongs in components. */
const providers: AnalyticsProvider[] = [mockAnalyticsProvider];

const MAX_STRING = 80;

/** Only primitives, truncated: analytics props must never carry personal data or blobs. */
function sanitize<T extends object>(props: T): T {
  const out: Record<string, string | number | boolean> = {};
  for (const [k, v] of Object.entries(props)) {
    if (typeof v === "string") out[k] = v.slice(0, MAX_STRING);
    else if (typeof v === "number" || typeof v === "boolean") out[k] = v;
  }
  return out as T;
}

export function track<E extends AnalyticsEventName>(event: E, props: AnalyticsEventMap[E]): void {
  const safe = sanitize(props);
  for (const provider of providers) {
    try {
      provider.track(event, safe);
    } catch {
      // Analytics must never break the storefront.
    }
  }
}
