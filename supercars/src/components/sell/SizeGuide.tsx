import type { PosterSize } from "@/domain/catalog";
import { Reveal } from "@/components/ui/Reveal";

/**
 * The three sizes drawn to scale on a wall above a 200 cm sofa, so people can picture them at home.
 * 1 cm = 2 SVG units. Purely illustrative (decorative SVG with a text summary for screen readers).
 */
export function SizeGuide({ sizes }: { sizes: readonly PosterSize[] }) {
  const sofaW = 400;
  const gap = 36;
  const scaled = sizes.map((s) => ({ ...s, w: s.widthCm * 2, h: s.heightCm * 2 }));
  const totalW = scaled.reduce((n, p) => n + p.w, 0) + gap * (scaled.length - 1);
  // Left edge of each poster, laid out side by side and centred over the sofa.
  const posters = scaled.map((p, i) => ({ ...p, x: 260 - totalW / 2 + scaled.slice(0, i).reduce((n, q) => n + q.w + gap, 0) }));
  const floor = 300;
  const sofaTop = floor - 84;
  return (
    <section aria-labelledby="size-guide-title" className="container-x section-t">
      <Reveal>
        <h2 id="size-guide-title" className="h-display h-section">Which size fits your wall?</h2>
        <p className="lead mt-3 max-w-[52ch]">All three sizes to scale above a 2-metre sofa. 40 × 60 cm is our recommendation for most rooms.</p>
      </Reveal>
      <Reveal delay={80} className="wall mt-7 overflow-hidden rounded-[var(--lg-radius-xl)] px-4 pt-6 sm:mt-9 sm:px-10 sm:pt-8">
        <p className="sr-only">{sizes.map((s) => s.label).join(", ")}, shown side by side above a sofa two metres wide.</p>
        <svg viewBox="0 0 520 300" className="mx-auto block w-full max-w-3xl" aria-hidden="true">
          {posters.map((p) => {
            const px = p.x;
            const py = sofaTop - 30 - p.h;
            const rec = p.id === "40x60";
            return (
              <g key={p.id}>
                <rect x={px} y={py} width={p.w} height={p.h} fill="#f4f2ec" stroke={rec ? "#e10600" : "rgba(0,0,0,0.18)"} strokeWidth={rec ? 2 : 1} />
                <rect x={px + p.w * 0.12} y={py + p.h * 0.1} width={p.w * 0.76} height={p.h * 0.55} fill={rec ? "#1d1d1f" : "#3a3a3c"} opacity="0.9" />
                <text x={px + p.w / 2} y={py - 8} textAnchor="middle" fontSize="11" fontWeight="600" fill="#1d1d1f" fontFamily="system-ui, sans-serif">{p.label}</text>
                {rec && <text x={px + p.w / 2} y={py - 21} textAnchor="middle" fontSize="9" fontWeight="600" fill="#c80500" fontFamily="system-ui, sans-serif">Recommended</text>}
              </g>
            );
          })}
          {/* sofa, 200 cm */}
          <g transform={`translate(${260 - sofaW / 2} ${sofaTop})`} fill="#8e8e93">
            <rect x="0" y="22" width={sofaW} height="46" rx="10" opacity="0.55" />
            <rect x="14" y="0" width={sofaW - 28} height="40" rx="12" opacity="0.45" />
            <rect x="-6" y="18" width="30" height="52" rx="10" opacity="0.6" />
            <rect x={sofaW - 24} y="18" width="30" height="52" rx="10" opacity="0.6" />
            <rect x="24" y="68" width="8" height="16" opacity="0.6" />
            <rect x={sofaW - 32} y="68" width="8" height="16" opacity="0.6" />
          </g>
          <line x1="0" x2="520" y1={floor} y2={floor} stroke="rgba(0,0,0,0.15)" />
          <text x={260} y={floor - 4} textAnchor="middle" fontSize="9" fill="#6e6e73" fontFamily="system-ui, sans-serif">sofa, 200 cm wide</text>
        </svg>
      </Reveal>
    </section>
  );
}
