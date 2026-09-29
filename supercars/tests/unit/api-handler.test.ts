import { describe, expect, it, vi } from "vitest";
import { z } from "zod";
import { ApiError, withApi } from "@/server/security/api-handler";

const schema = z.strictObject({ n: z.number().int().min(1).max(5) });
const ok = withApi({ route: "test.ok", method: "POST", schema }, async ({ input }) => ({ doubled: input.n * 2 }));

const post = (body: unknown, headers: Record<string, string> = {}, url = "https://shop.test/api/x") =>
  new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json", origin: "https://shop.test", "cf-connecting-ip": `ip-${Math.random()}`, ...headers },
    body: typeof body === "string" ? body : JSON.stringify(body),
  });

describe("withApi", () => {
  it("handles a valid same-origin request", async () => {
    const res = await ok(post({ n: 2 }));
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ doubled: 4 });
    expect(res.headers.get("cache-control")).toBe("no-store");
    expect(res.headers.get("x-content-type-options")).toBe("nosniff");
    expect(res.headers.get("x-request-id")).toMatch(/^req_/);
  });

  it("rejects wrong methods with 405", async () => {
    const res = await ok(new Request("https://shop.test/api/x", { method: "GET" }));
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
  });

  it("rejects cross-origin and origin-less non-browser POSTs with 403", async () => {
    expect((await ok(post({ n: 1 }, { origin: "https://evil.test" }))).status).toBe(403);
    const noOrigin = new Request("https://shop.test/api/x", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" });
    expect((await ok(noOrigin)).status).toBe(403);
  });

  it("allows Sec-Fetch-Site same-origin when Origin is absent", async () => {
    const req = new Request("https://shop.test/api/x", {
      method: "POST",
      headers: { "content-type": "application/json", "sec-fetch-site": "same-origin", "cf-connecting-ip": "sfs" },
      body: JSON.stringify({ n: 1 }),
    });
    expect((await ok(req)).status).toBe(200);
  });

  it("requires JSON content type (415) and valid JSON (400)", async () => {
    expect((await ok(post({ n: 1 }, { "content-type": "text/plain" }))).status).toBe(415);
    expect((await ok(post("{not json"))).status).toBe(400);
  });

  it("caps body size (413) by Content-Length and by streamed size", async () => {
    const big = withApi({ route: "test.big", method: "POST", schema, maxBodyBytes: 64 }, async () => ({}));
    expect((await big(post({ n: 1, pad: "x".repeat(500) }))).status).toBe(413);
    const noLength = new Request("https://shop.test/api/x", {
      method: "POST",
      headers: { "content-type": "application/json", origin: "https://shop.test" },
      body: new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode("x".repeat(500))); c.close(); } }),
      // @ts-expect-error duplex is required by undici for streamed bodies
      duplex: "half",
    });
    expect((await big(noLength)).status).toBe(413);
  });

  it("returns 422 for invalid or unknown fields and never echoes the input value", async () => {
    const res = await ok(post({ n: 2, price: 1 }));
    expect(res.status).toBe(422);
    const text = await res.text();
    expect(text).toContain("invalid_request");
    const bad = await ok(post({ n: 99 }));
    expect(bad.status).toBe(422);
  });

  it("hides internals on unexpected errors (500) but keeps ApiError messages", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const boom = withApi({ route: "test.boom", method: "POST" }, async () => {
      throw new Error("db password hunter2 at /srv/app/secret.ts:12");
    });
    const res = await boom(post({}));
    const body = await res.text();
    expect(res.status).toBe(500);
    expect(body).not.toContain("hunter2");
    expect(body).not.toContain("/srv/app");
    expect(body).not.toContain("stack");
    const logged = spy.mock.calls.map((c) => String(c[0])).join("\n");
    expect(logged).toContain("api.unhandled_error");
    spy.mockRestore();

    const teapot = withApi({ route: "test.err", method: "POST" }, async () => {
      throw new ApiError(409, "conflict", "Nope.");
    });
    const r2 = await teapot(post({}));
    expect(r2.status).toBe(409);
    expect((await r2.json()).error.code).toBe("conflict");
  });

  it("rate limits with 429 and Retry-After", async () => {
    const limited = withApi(
      { route: "test.limit", method: "POST", rateLimit: { name: `t-${Math.random()}`, windows: [{ limit: 2, windowMs: 60_000 }] } },
      async () => ({ ok: true }),
    );
    const headers = { "cf-connecting-ip": "same-client" };
    expect((await limited(post({}, headers))).status).toBe(200);
    expect((await limited(post({}, headers))).status).toBe(200);
    const third = await limited(post({}, headers));
    expect(third.status).toBe(429);
    expect(Number(third.headers.get("retry-after"))).toBeGreaterThan(0);
  });

  it("validates GET query params with the schema", async () => {
    const get = withApi({ route: "test.get", method: "GET", schema: z.strictObject({ q: z.string().max(5) }) }, async ({ input }) => ({ q: input.q }));
    expect((await get(new Request("https://shop.test/api/x?q=ab"))).status).toBe(200);
    expect((await get(new Request("https://shop.test/api/x?q=abcdefgh"))).status).toBe(422);
  });
});
