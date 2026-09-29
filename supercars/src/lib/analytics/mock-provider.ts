import type { AnalyticsProvider } from "./types";

/** Development-only logger. Silent in production; nothing leaves the browser. */
export const mockAnalyticsProvider: AnalyticsProvider = {
  id: "mock",
  track(event, props) {
    if (process.env.NODE_ENV === "production") return;
    console.debug(`[analytics] ${event}`, props);
  },
};
