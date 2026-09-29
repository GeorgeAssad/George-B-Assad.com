import type { DecorationId, DesignTemplate, SizeId, VehicleAsset } from "@/domain/catalog";
import { GROUND_Y, VEHICLE_VIEWBOX, WHEEL_CY, vehicleShapes } from "./vehicle-shapes";
import { POSTER_WIDTH } from "./poster-geometry";

/* Data-driven decorative elements. A template lists ids; this registry draws
 * them. Underlay elements sit behind the vehicle, overlay elements above. */

export interface DecorationContext {
  readonly id: string;
  readonly W: number;
  readonly H: number;
  readonly template: DesignTemplate;
  readonly vehicle: VehicleAsset;
  readonly sizeId: SizeId;
  readonly sizeLabel: string;
  /** Vehicle placement in poster units. */
  readonly art: { readonly x: number; readonly y: number; readonly scale: number };
}

type Draw = (c: DecorationContext) => React.ReactNode;

const techGrid: Draw = ({ id, W, H, template }) => (
  <g>
    <defs>
      <pattern id={`${id}-g1`} width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke={template.layout.accent} strokeWidth="0.6" opacity="0.16" />
      </pattern>
      <pattern id={`${id}-g2`} width="200" height="200" patternUnits="userSpaceOnUse">
        <path d="M 200 0 L 0 0 0 200" fill="none" stroke={template.layout.accent} strokeWidth="1" opacity="0.26" />
      </pattern>
    </defs>
    <rect width={W} height={H} fill={`url(#${id}-g1)`} />
    <rect width={W} height={H} fill={`url(#${id}-g2)`} />
  </g>
);

const speedLines: Draw = ({ id, W, H, template, art }) => {
  const a = template.layout.artFrame;
  const top = a.y * H;
  const span = a.h * H;
  const lines = [0.12, 0.24, 0.36, 0.5, 0.62, 0.74, 0.86].map((t, i) => ({
    y: top + span * t,
    len: W * (0.34 + ((i * 37) % 30) / 100),
    w: 1.4 + ((i * 13) % 3),
    o: 0.22 + ((i * 17) % 40) / 100,
  }));
  return (
    <g>
      <defs>
        <linearGradient id={`${id}-sl`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity="1" />
        </linearGradient>
        <linearGradient id={`${id}-stripe`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={template.layout.accent} stopOpacity="0.95" />
          <stop offset="1" stopColor={template.layout.accent} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon points={`${W * 0.6},0 ${W * 0.76},0 ${W * 0.4},${H * 0.66} ${W * 0.24},${H * 0.66}`} fill={`url(#${id}-stripe)`} opacity="0.85" />
      {lines.map((l, i) => (
        <rect key={i} x={0} y={l.y} width={l.len + art.x * 0.2} height={l.w} fill={`url(#${id}-sl)`} opacity={l.o} />
      ))}
    </g>
  );
};

const checkerStrip: Draw = ({ id, W }) => (
  <g>
    <defs>
      <pattern id={`${id}-ck`} width="32" height="32" patternUnits="userSpaceOnUse">
        <rect width="32" height="32" fill="#0a0a0b" />
        <rect width="16" height="16" fill="#f4f4f2" />
        <rect x="16" y="16" width="16" height="16" fill="#f4f4f2" />
      </pattern>
    </defs>
    <rect x={0} y={0} width={W} height={32} fill={`url(#${id}-ck)`} opacity="0.92" />
  </g>
);

const redRule: Draw = ({ W, H, template }) => {
  const m = template.layout.margin * W;
  const y = H * 0.105;
  return (
    <g>
      <rect x={m} y={y} width={64} height={5} fill={template.layout.accent} />
      <line x1={m + 78} y1={y + 2.5} x2={W - m} y2={y + 2.5} stroke={template.layout.ink} strokeWidth="1" opacity="0.22" />
    </g>
  );
};

const goldRule: Draw = ({ W, H, template }) => {
  const y = H * 0.712;
  const c = template.layout.accent;
  return (
    <g stroke={c} strokeWidth="1.2" fill="none" opacity="0.9">
      <line x1={W / 2 - 150} y1={y} x2={W / 2 - 14} y2={y} />
      <line x1={W / 2 + 14} y1={y} x2={W / 2 + 150} y2={y} />
      <path d={`M ${W / 2} ${y - 7} L ${W / 2 + 7} ${y} L ${W / 2} ${y + 7} L ${W / 2 - 7} ${y} Z`} fill={c} />
    </g>
  );
};

const doubleFrame: Draw = ({ W, H, template }) => {
  const c = template.layout.accent;
  return (
    <g fill="none" stroke={c}>
      <rect x={26} y={26} width={W - 52} height={H - 52} strokeWidth="2.2" opacity="0.9" />
      <rect x={38} y={38} width={W - 76} height={H - 76} strokeWidth="0.9" opacity="0.65" />
    </g>
  );
};

const cornerMarks: Draw = ({ W, H, template }) => {
  const c = template.layout.ink;
  const o = 44;
  const l = 30;
  return (
    <g stroke={c} strokeWidth="1.4" fill="none" opacity="0.7">
      <path d={`M ${o} ${o + l} V ${o} H ${o + l}`} />
      <path d={`M ${W - o - l} ${o} H ${W - o} V ${o + l}`} />
      <path d={`M ${o} ${H - o - l} V ${H - o} H ${o + l}`} />
      <path d={`M ${W - o - l} ${H - o} H ${W - o} V ${H - o - l}`} />
    </g>
  );
};

const crosshair: Draw = ({ W, H, template }) => {
  const c = template.layout.accent;
  const x = W * 0.86;
  const y = H * 0.115;
  return (
    <g stroke={c} strokeWidth="1.2" fill="none" opacity="0.85">
      <circle cx={x} cy={y} r={15} />
      <line x1={x - 24} y1={y} x2={x + 24} y2={y} />
      <line x1={x} y1={y - 24} x2={x} y2={y + 24} />
    </g>
  );
};

const measureTicks: Draw = ({ H, template }) => {
  const c = template.layout.accent;
  const y0 = H * 0.16;
  const y1 = H * 0.6;
  const ticks: React.ReactNode[] = [];
  for (let y = y0, i = 0; y <= y1; y += 20, i++) {
    const major = i % 5 === 0;
    ticks.push(<line key={i} x1={30} y1={y} x2={major ? 48 : 40} y2={y} />);
  }
  return <g stroke={c} strokeWidth="1" opacity="0.7">{ticks}</g>;
};

const blueprintDims: Draw = ({ W, template, vehicle, art }) => {
  if (vehicle.kind !== "svg-archetype") return null;
  const c = template.layout.accent;
  const shape = vehicleShapes[vehicle.archetype];
  const s = art.scale;
  const left = art.x + 66 * s;
  const right = art.x + 950 * s;
  const rear = art.x + shape.rearX * s;
  const front = art.x + shape.frontX * s;
  const y1 = art.y + (GROUND_Y + 22) * s;
  const y2 = y1 + 22;
  const wheelY = art.y + WHEEL_CY * s;
  const t = 5;
  void W;
  return (
    <g stroke={c} strokeWidth="1" fill="none" opacity="0.9">
      <line x1={left} y1={y1} x2={right} y2={y1} />
      <line x1={left} y1={y1 - t} x2={left} y2={y1 + t} />
      <line x1={right} y1={y1 - t} x2={right} y2={y1 + t} />
      <line x1={left} y1={art.y + 250 * s} x2={left} y2={y1 + t} strokeDasharray="3 3" opacity="0.6" />
      <line x1={right} y1={art.y + 250 * s} x2={right} y2={y1 + t} strokeDasharray="3 3" opacity="0.6" />
      <text x={(left + right) / 2} y={y1 - 7} textAnchor="middle" fontSize="13" fill={c} stroke="none" letterSpacing="3" className="pf-mono">L</text>
      <line x1={rear} y1={y2} x2={front} y2={y2} />
      <line x1={rear} y1={y2 - t} x2={rear} y2={y2 + t} />
      <line x1={front} y1={y2 - t} x2={front} y2={y2 + t} />
      <line x1={rear} y1={wheelY + 70 * s} x2={rear} y2={y2 - t} strokeDasharray="3 3" opacity="0.6" />
      <line x1={front} y1={wheelY + 70 * s} x2={front} y2={y2 - t} strokeDasharray="3 3" opacity="0.6" />
      <text x={(rear + front) / 2} y={y2 + 16} textAnchor="middle" fontSize="13" fill={c} stroke="none" letterSpacing="3" className="pf-mono">WB</text>
    </g>
  );
};

const laurel: Draw = ({ W, H, template }) => {
  const c = template.layout.accent;
  const cx = W / 2;
  const cy = H * 0.095;
  const leaves = Array.from({ length: 7 }, (_, i) => {
    const a = (-70 + i * 22) * (Math.PI / 180);
    return { x: Math.sin(a) * 40, y: -Math.cos(a) * 40 + 8, rot: (a * 180) / Math.PI };
  });
  return (
    <g transform={`translate(${cx} ${cy})`} fill={c} opacity="0.92">
      <circle r={34} fill="none" stroke={c} strokeWidth="1.4" />
      {[-1, 1].map((side) =>
        leaves.map((l, i) => (
          <ellipse key={`${side}-${i}`} cx={side * (Math.abs(l.x) + 8)} cy={l.y} rx={3.2} ry={8} transform={`rotate(${side * (90 - Math.abs(l.rot)) * -0.6 + (side < 0 ? -20 : 20)} ${side * (Math.abs(l.x) + 8)} ${l.y})`} />
        )),
      )}
      <text textAnchor="middle" y={7} fontSize="20" fontWeight="700" letterSpacing="2" fill={c} className="pf-serif">SC</text>
    </g>
  );
};

const microLabels: Draw = ({ W, H, template, sizeLabel }) => {
  const m = template.layout.margin * W;
  const fill = template.layout.ink;
  const props = { fontSize: 13, letterSpacing: 3, fill, opacity: 0.55, className: "pf-mono" } as const;
  return (
    <g>
      <text x={m} y={H * 0.055} {...props}>{`SC / ${template.id.toUpperCase()}-01`}</text>
      <text x={W - m} y={H * 0.055} textAnchor="end" {...props}>{sizeLabel.toUpperCase()}</text>
    </g>
  );
};

export const underlay: Partial<Record<DecorationId, Draw>> = {
  "tech-grid": techGrid,
  "speed-lines": speedLines,
};

export const overlay: Partial<Record<DecorationId, Draw>> = {
  "checker-strip": checkerStrip,
  "red-rule": redRule,
  "gold-rule": goldRule,
  "double-frame": doubleFrame,
  "corner-marks": cornerMarks,
  crosshair,
  "measure-ticks": measureTicks,
  "blueprint-dims": blueprintDims,
  laurel,
  "micro-labels": microLabels,
};

export { POSTER_WIDTH, VEHICLE_VIEWBOX };
