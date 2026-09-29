/* CSRF-style guard for state-changing requests: the request must originate
 * from our own site. Uses Origin when present, else Sec-Fetch-Site. */

export function isSameOrigin(req: Request): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      return new URL(origin).origin === new URL(req.url).origin;
    } catch {
      return false;
    }
  }
  const site = req.headers.get("sec-fetch-site");
  // No Origin header: only same-origin/none fetches are acceptable. Non-browser
  // clients (curl) lack both headers and are rejected on browser-facing routes.
  return site === "same-origin" || site === "none";
}
