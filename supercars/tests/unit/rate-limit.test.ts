import { describe, expect, it } from "vitest";
import { InMemoryRateLimiter, rateLimitPolicies } from "@/server/security/rate-limit";

describe("InMemoryRateLimiter", () => {
  it("allows up to the limit then blocks with Retry-After", async () => {
    const rl = new InMemoryRateLimiter();
    const policy = { name: "t", windows: [{ limit: 3, windowMs: 1000 }] };
    const t = 1_000_000;
    expect((await rl.check("ip", policy, t)).allowed).toBe(true);
    expect((await rl.check("ip", policy, t + 1)).allowed).toBe(true);
    const third = await rl.check("ip", policy, t + 2);
    expect(third).toMatchObject({ allowed: true, remaining: 0 });
    const blocked = await rl.check("ip", policy, t + 3);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThanOrEqual(1);
  });
  it("recovers after the window and isolates keys", async () => {
    const rl = new InMemoryRateLimiter();
    const policy = { name: "t", windows: [{ limit: 1, windowMs: 1000 }] };
    await rl.check("a", policy, 0);
    expect((await rl.check("a", policy, 10)).allowed).toBe(false);
    expect((await rl.check("b", policy, 10)).allowed).toBe(true);
    expect((await rl.check("a", policy, 1500)).allowed).toBe(true);
  });
  it("enforces multi-window quotas (AI generation)", async () => {
    const rl = new InMemoryRateLimiter();
    const p = rateLimitPolicies.designGenerate;
    let allowed = 0;
    for (let i = 0; i < 12; i++) if ((await rl.check("x", p, i)).allowed) allowed++;
    expect(allowed).toBe(8); // per-minute cap
  });
  it("does not let blocked attempts extend the block", async () => {
    const rl = new InMemoryRateLimiter();
    const policy = { name: "t", windows: [{ limit: 1, windowMs: 1000 }] };
    await rl.check("a", policy, 0);
    for (let i = 1; i < 50; i++) await rl.check("a", policy, i * 10);
    expect((await rl.check("a", policy, 1001)).allowed).toBe(true);
  });
});
