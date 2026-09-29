/* RATE LIMITING. The interface is what routes depend on; the in-memory
 * implementation is per-isolate and therefore best-effort. In production swap
 * in Cloudflare's Rate Limiting binding or a Durable Object behind the same
 * `RateLimiter` interface (see ARCHITECTURE.md). */

export interface RateWindow {
  readonly limit: number;
  readonly windowMs: number;
}

export interface RateLimitPolicy {
  readonly name: string;
  readonly windows: readonly RateWindow[];
}

export interface RateLimitResult {
  readonly allowed: boolean;
  readonly remaining: number;
  readonly retryAfterSeconds: number;
}

export interface RateLimiter {
  check(key: string, policy: RateLimitPolicy, now?: number): Promise<RateLimitResult>;
}

const MIN = 60_000;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;

/** Central policy table. AI generation is deliberately the tightest: it is the expensive endpoint. */
export const rateLimitPolicies = {
  quote: { name: "quote", windows: [{ limit: 60, windowMs: MIN }] },
  checkout: { name: "checkout", windows: [{ limit: 6, windowMs: 10 * MIN }, { limit: 30, windowMs: DAY }] },
  lookup: { name: "lookup", windows: [{ limit: 15, windowMs: 5 * MIN }] },
  support: { name: "support", windows: [{ limit: 20, windowMs: 5 * MIN }, { limit: 200, windowMs: DAY }] },
  designGenerate: { name: "design-generate", windows: [{ limit: 4, windowMs: MIN }, { limit: 20, windowMs: HOUR }, { limit: 60, windowMs: DAY }] },
  designProcess: { name: "design-process", windows: [{ limit: 10, windowMs: MIN }, { limit: 60, windowMs: HOUR }] },
} as const satisfies Record<string, RateLimitPolicy>;

const MAX_KEYS = 5000;

export class InMemoryRateLimiter implements RateLimiter {
  private readonly hits = new Map<string, number[]>();

  async check(key: string, policy: RateLimitPolicy, now = Date.now()): Promise<RateLimitResult> {
    const id = `${policy.name}:${key}`;
    const longest = Math.max(...policy.windows.map((w) => w.windowMs));
    const recent = (this.hits.get(id) ?? []).filter((t) => now - t < longest);

    let retryAfterMs = 0;
    let remaining = Number.POSITIVE_INFINITY;
    for (const w of policy.windows) {
      const inWindow = recent.filter((t) => now - t < w.windowMs);
      remaining = Math.min(remaining, Math.max(0, w.limit - inWindow.length - 1));
      if (inWindow.length >= w.limit) {
        const oldest = inWindow[0] ?? now;
        retryAfterMs = Math.max(retryAfterMs, w.windowMs - (now - oldest));
      }
    }

    if (retryAfterMs > 0) {
      this.hits.set(id, recent);
      return { allowed: false, remaining: 0, retryAfterSeconds: Math.max(1, Math.ceil(retryAfterMs / 1000)) };
    }

    recent.push(now);
    this.hits.set(id, recent);
    if (this.hits.size > MAX_KEYS) this.prune(now, longest);
    return { allowed: true, remaining, retryAfterSeconds: 0 };
  }

  private prune(now: number, windowMs: number): void {
    for (const [k, times] of this.hits) {
      if (times.every((t) => now - t >= windowMs)) this.hits.delete(k);
    }
    if (this.hits.size > MAX_KEYS) {
      // Still over budget under sustained abuse: drop the oldest half.
      let i = 0;
      for (const k of this.hits.keys()) {
        if (i++ < MAX_KEYS / 2) this.hits.delete(k);
        else break;
      }
    }
  }
}

const globalLimiter = globalThis as typeof globalThis & { __scLimiter?: RateLimiter };

export function getRateLimiter(): RateLimiter {
  return (globalLimiter.__scLimiter ??= new InMemoryRateLimiter());
}

/** Client key for limiting. `CF-Connecting-IP` is set by Cloudflare's edge and cannot be spoofed by clients behind it. */
export function clientKey(req: Request): string {
  const cf = req.headers.get("cf-connecting-ip");
  if (cf) return cf.trim().slice(0, 64);
  const fwd = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  return (fwd || "unknown").slice(0, 64);
}
