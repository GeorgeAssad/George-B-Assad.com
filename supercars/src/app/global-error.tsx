"use client";

/* Last-resort boundary: it replaces the root layout, so it cannot rely on the app stylesheet.
 * The few rules it needs are inlined; colours follow the device's light or dark setting. */
const CSS = `
  :root { color-scheme: light dark; --bg: #f5f5f7; --fg: #1d1d1f; --muted: #6e6e73; }
  @media (prefers-color-scheme: dark) { :root { --bg: #000000; --fg: #f5f5f7; --muted: #aeaeb2; } }
  body { margin: 0; min-height: 100dvh; display: grid; place-items: center; padding: 2rem; text-align: center;
    background: var(--bg); color: var(--fg);
    font: 400 17px/1.5 -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; }
  h1 { margin: 0.5rem 0; font-size: clamp(2rem, 6vw, 3.25rem); font-weight: 650; letter-spacing: -0.03em; line-height: 1.08; }
  p { margin: 0 auto; max-width: 26rem; color: var(--muted); }
  button { margin-top: 1.75rem; min-height: 50px; padding: 0 1.625rem; border: 0; border-radius: 999px; cursor: pointer;
    background: #e10600; color: #fff; font: 600 17px/1 inherit; font-family: inherit; }
  small { display: block; margin-top: 1.5rem; font-size: 13px; color: var(--muted); }
`;

export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body>
        <style>{CSS}</style>
        <main>
          <p>SuperCars</p>
          <h1>Something slipped.</h1>
          <p>We hit an unexpected problem. Nothing has been charged. Please try again.</p>
          <button type="button" onClick={reset}>Try again</button>
          {error.digest && <small>Reference: {error.digest}</small>}
        </main>
      </body>
    </html>
  );
}
