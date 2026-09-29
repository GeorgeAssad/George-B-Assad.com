import { describe, expect, it } from "vitest";
import { isSameOrigin } from "@/server/security/origin";

const req = (headers: Record<string, string>, url = "https://shop.example/api/x") => new Request(url, { method: "POST", headers });

describe("isSameOrigin", () => {
  it("accepts the request's own origin and rejects others", () => {
    expect(isSameOrigin(req({ origin: "https://shop.example" }))).toBe(true);
    expect(isSameOrigin(req({ origin: "https://evil.example" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "https://shop.example.evil.example" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "http://shop.example" }))).toBe(false); // scheme matters
    expect(isSameOrigin(req({ origin: "null" }))).toBe(false);
    expect(isSameOrigin(req({ origin: "not a url" }))).toBe(false);
  });
  it("falls back to Sec-Fetch-Site only when Origin is absent", () => {
    expect(isSameOrigin(req({ "sec-fetch-site": "same-origin" }))).toBe(true);
    expect(isSameOrigin(req({ "sec-fetch-site": "cross-site" }))).toBe(false);
    expect(isSameOrigin(req({}))).toBe(false);
    expect(isSameOrigin(req({ origin: "https://evil.example", "sec-fetch-site": "same-origin" }))).toBe(false);
  });
  it("accepts an explicitly configured extra origin, never an inferred one", () => {
    expect(isSameOrigin(req({ origin: "https://www.shop.example" }), ["https://www.shop.example"])).toBe(true);
    expect(isSameOrigin(req({ origin: "https://www.shop.example" }), [null])).toBe(false);
    expect(isSameOrigin(req({ origin: "https://evil.example" }), ["https://www.shop.example"])).toBe(false);
  });
});
