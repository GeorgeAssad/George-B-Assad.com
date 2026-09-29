/* CSRF-style guard for state-changing requests: the request must originate
 * from our own site. Uses Origin when present, else Sec-Fetch-Site. */

/**
 * `extraAllowed` lets a deployment that is reachable on more than one hostname
 * (e.g. apex and www) name its canonical origin explicitly. It is never inferred.
 */
export function isSameOrigin(req: Request, extraAllowed: readonly (string | null)[] = []): boolean {
  const origin = req.headers.get("origin");
  if (origin) {
    try {
      const o = new URL(origin).origin;
      return o === new URL(req.url).origin || extraAllowed.some((a) => a !== null && a === o);
    } catch {
      return false;
    }
  }
  const site = req.headers.get("sec-fetch-site");
  // No Origin header: only same-origin/none fetches are acceptable. Non-browser
  // clients (curl) lack both headers and are rejected on browser-facing routes.
  return site === "same-origin" || site === "none";
}
