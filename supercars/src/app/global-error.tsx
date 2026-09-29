"use client";

/** Last-resort boundary (replaces the root layout), so it must be self-contained and unstyled by app CSS. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, background: "#050506", color: "#f3f3f1", fontFamily: "system-ui, sans-serif", display: "grid", placeItems: "center", minHeight: "100dvh", padding: "2rem", textAlign: "center" }}>
        <main>
          <p style={{ letterSpacing: "0.2em", fontSize: 12, textTransform: "uppercase", color: "#a4a6ad" }}>SuperCars</p>
          <h1 style={{ fontSize: "clamp(2rem, 8vw, 4rem)", margin: "0.5rem 0" }}>Something slipped.</h1>
          <p style={{ color: "#a4a6ad", maxWidth: 420, margin: "0 auto 1.5rem" }}>We hit an unexpected problem. Nothing has been charged. Please try again.</p>
          <button onClick={reset} style={{ background: "#e10600", color: "#fff", border: 0, borderRadius: 999, padding: "0.9rem 1.6rem", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", cursor: "pointer" }}>Try again</button>
          {error.digest && <p style={{ marginTop: 24, fontSize: 12, color: "#8b8d95" }}>Reference: {error.digest}</p>}
        </main>
      </body>
    </html>
  );
}
