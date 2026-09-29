import { useId } from "react";
import type { VehicleAsset } from "@/domain/catalog";
import { darken, lighten, mix } from "./color";
import { GROUND_Y, RIM_R, TIRE_R, VEHICLE_VIEWBOX, WHEEL_CY, bodyPath, vehicleShapes, type VehicleShape } from "./vehicle-shapes";

export type ArtTreatment = "float" | "outline" | "blueprint" | "duotone";

interface VehicleArtProps {
  readonly vehicle: VehicleAsset;
  readonly treatment?: ArtTreatment;
  /** Line/ink colour for outline, blueprint and duotone treatments. */
  readonly ink?: string;
  /** Small accent (tail light, brake calipers). */
  readonly accent?: string;
  readonly className?: string;
  readonly x?: number;
  readonly y?: number;
  readonly width?: number | string;
  readonly height?: number | string;
  /** Draw the soft floor shadow (float treatment). */
  readonly shadow?: boolean;
  readonly shadowOpacity?: number;
}

const SPOKES = [0, 72, 144, 216, 288] as const;

function Wheel({ cx, mode, ink, accent }: { cx: number; mode: ArtTreatment; ink: string; accent: string }) {
  if (mode === "blueprint" || mode === "outline") {
    return (
      <g fill="none" stroke={ink} strokeWidth={1.6}>
        <circle cx={cx} cy={WHEEL_CY} r={TIRE_R} />
        <circle cx={cx} cy={WHEEL_CY} r={RIM_R} />
        <circle cx={cx} cy={WHEEL_CY} r={10} />
        {SPOKES.map((a) => (
          <line key={a} x1={cx} y1={WHEEL_CY} x2={cx + RIM_R * Math.cos((a * Math.PI) / 180)} y2={WHEEL_CY + RIM_R * Math.sin((a * Math.PI) / 180)} />
        ))}
      </g>
    );
  }
  const rim = mode === "duotone" ? lighten(ink, 0.7) : "#c9ced6";
  const tire = mode === "duotone" ? darken(ink, 0.2) : "#0c0d0f";
  return (
    <g>
      <circle cx={cx} cy={WHEEL_CY} r={TIRE_R} fill={tire} />
      <circle cx={cx} cy={WHEEL_CY} r={TIRE_R - 6} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={1.2} />
      <circle cx={cx} cy={WHEEL_CY} r={RIM_R} fill="#15171a" stroke={rim} strokeWidth={3.5} />
      {mode === "float" && <path d={`M ${cx + 30} ${WHEEL_CY - 18} A 34 34 0 0 1 ${cx + 34} ${WHEEL_CY + 6}`} fill="none" stroke={accent} strokeWidth={5} strokeLinecap="round" opacity={0.9} />}
      {SPOKES.map((a) => (
        <line key={a} x1={cx} y1={WHEEL_CY} x2={cx + (RIM_R - 3) * Math.cos((a * Math.PI) / 180)} y2={WHEEL_CY + (RIM_R - 3) * Math.sin((a * Math.PI) / 180)} stroke={rim} strokeWidth={6} strokeLinecap="round" />
      ))}
      <circle cx={cx} cy={WHEEL_CY} r={9} fill={rim} />
    </g>
  );
}

function Silhouette({ shape, traits, body, accent, treatment, ink, id, shadow, shadowOpacity }: {
  shape: VehicleShape;
  traits: readonly string[];
  body: string;
  accent: string;
  treatment: ArtTreatment;
  ink: string;
  id: string;
  shadow: boolean;
  shadowOpacity: number;
}) {
  const d = bodyPath(shape);
  const wide = traits.includes("wide-body");
  const wing = traits.includes("wing");
  const wheelX = [shape.rearX, shape.frontX];

  if (treatment === "blueprint" || treatment === "outline") {
    const isBlue = treatment === "blueprint";
    return (
      <g fill="none" stroke={ink} strokeWidth={isBlue ? 1.8 : 3} strokeLinejoin="round" strokeLinecap="round">
        {isBlue && (
          <>
            <defs>
              <pattern id={`${id}-hatch`} width="9" height="9" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1="0" y1="0" x2="0" y2="9" stroke={ink} strokeWidth="0.8" opacity="0.5" />
              </pattern>
            </defs>
            <line x1="30" y1={GROUND_Y} x2="970" y2={GROUND_Y} strokeDasharray="14 6" strokeWidth={1} opacity={0.7} />
            <line x1={shape.rearX - 110} y1={WHEEL_CY} x2={shape.frontX + 110} y2={WHEEL_CY} strokeDasharray="22 6 3 6" strokeWidth={0.9} opacity={0.75} />
            {wheelX.map((cx) => (
              <line key={cx} x1={cx} y1={WHEEL_CY - 84} x2={cx} y2={GROUND_Y + 6} strokeDasharray="22 6 3 6" strokeWidth={0.9} opacity={0.75} />
            ))}
          </>
        )}
        <path d={d} fill={isBlue ? `${ink}0f` : "none"} />
        <path d={shape.glass} fill={isBlue ? `url(#${id}-hatch)` : "none"} />
        {shape.pillars.map((p) => <path key={p} d={p} strokeWidth={4} />)}
        <path d={shape.crease} strokeWidth={1} opacity={0.8} />
        {shape.doors.map((p) => <path key={p} d={p} strokeWidth={1.1} opacity={0.75} />)}
        <path d={shape.headlight} />
        <path d={shape.taillight} />
        {shape.vent && <path d={shape.vent} />}
        {wide && shape.flares.map((p) => <path key={p} d={p} strokeWidth={1.2} opacity={0.8} />)}
        {wing && <path d={shape.wing} />}
        {wheelX.map((cx) => <Wheel key={cx} cx={cx} mode={treatment} ink={ink} accent={accent} />)}
      </g>
    );
  }

  const duo = treatment === "duotone";
  const top = duo ? lighten(ink, 0.32) : lighten(body, 0.32);
  const mid = duo ? mix(ink, "#000000", 0.05) : body;
  const low = duo ? darken(ink, 0.35) : darken(body, 0.62);
  const line = duo ? lighten(ink, 0.78) : lighten(body, 0.55);
  const glassA = duo ? lighten(ink, 0.6) : "#0b0f15";
  const glassB = duo ? lighten(ink, 0.82) : "#243041";
  const wellR = shape.archR - 4;

  return (
    <g>
      <defs>
        <linearGradient id={`${id}-body`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.42" stopColor={mid} />
          <stop offset="1" stopColor={low} />
        </linearGradient>
        <linearGradient id={`${id}-sheen`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.28" stopColor="#fff" stopOpacity={duo ? 0.06 : 0.16} />
          <stop offset="0.62" stopColor="#fff" stopOpacity="0" />
          <stop offset="1" stopColor="#fff" stopOpacity={duo ? 0.04 : 0.1} />
        </linearGradient>
        <linearGradient id={`${id}-glass`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={glassB} />
          <stop offset="0.5" stopColor={glassA} />
          <stop offset="1" stopColor={glassB} />
        </linearGradient>
        <radialGradient id={`${id}-shadow`} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#000" stopOpacity={shadowOpacity} />
          <stop offset="1" stopColor="#000" stopOpacity="0" />
        </radialGradient>
        <linearGradient id={`${id}-band`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#fff" stopOpacity="0" />
          <stop offset="0.35" stopColor="#fff" stopOpacity="1" />
          <stop offset="0.85" stopColor="#fff" stopOpacity="0.15" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {shadow && <ellipse cx={500} cy={GROUND_Y + 2} rx={480} ry={16} fill={`url(#${id}-shadow)`} />}
      {wheelX.map((cx) => <circle key={`well-${cx}`} cx={cx} cy={WHEEL_CY} r={wellR} fill="#050506" />)}
      {wing && <path d={shape.wing} fill={darken(duo ? ink : body, 0.45)} stroke={line} strokeWidth={1} />}
      <path d={d} fill={`url(#${id}-body)`} />
      <path d={d} fill={`url(#${id}-sheen)`} />
      <path d={shape.crease} fill="none" stroke={`url(#${id}-band)`} strokeWidth={18} strokeLinecap="round" opacity={duo ? 0.12 : 0.2} />
      {wide && shape.flares.map((p) => <path key={p} d={p} fill="none" stroke={darken(duo ? ink : body, 0.4)} strokeWidth={5} strokeLinecap="round" opacity={0.7} />)}
      <path d={shape.glass} fill={`url(#${id}-glass)`} />
      {shape.pillars.map((p) => <path key={p} d={p} stroke={mid} strokeWidth={9} strokeLinecap="round" />)}
      <path d={shape.crease} fill="none" stroke={line} strokeWidth={1.6} opacity={0.5} />
      {shape.doors.map((p) => <path key={p} d={p} fill="none" stroke="#000" strokeWidth={1.4} opacity={0.32} />)}
      {shape.vent && <path d={shape.vent} fill={darken(duo ? ink : body, 0.7)} opacity={0.75} />}
      <path d={shape.mirror} fill={darken(duo ? ink : body, 0.3)} />
      <path d={shape.headlight} fill={duo ? lighten(ink, 0.85) : "#f3f5f8"} opacity={0.95} />
      <path d={shape.taillight} fill={duo ? ink : accent} opacity={duo ? 0.8 : 0.95} />
      {wheelX.map((cx) => <Wheel key={cx} cx={cx} mode={treatment} ink={ink} accent={accent} />)}
    </g>
  );
}

/** Renders a `VehicleAsset`. Local SVG archetypes today; generated images tomorrow. */
export function VehicleArt({
  vehicle,
  treatment = "float",
  ink = "#e9edf3",
  accent,
  className,
  x,
  y,
  width,
  height,
  shadow = true,
  shadowOpacity = 0.55,
}: VehicleArtProps) {
  const id = useId().replace(/:/g, "");
  const box = `0 0 ${VEHICLE_VIEWBOX.width} ${VEHICLE_VIEWBOX.height}`;

  return (
    <svg
      viewBox={box}
      className={className}
      {...(x !== undefined ? { x } : {})}
      {...(y !== undefined ? { y } : {})}
      {...(width !== undefined ? { width } : {})}
      {...(height !== undefined ? { height } : {})}
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
      overflow="visible"
    >
      {vehicle.kind === "svg-archetype" ? (
        <Silhouette
          shape={vehicleShapes[vehicle.archetype]}
          traits={vehicle.traits}
          body={vehicle.palette.body}
          accent={accent ?? vehicle.palette.accent}
          treatment={treatment}
          ink={ink}
          id={id}
          shadow={shadow}
          shadowOpacity={shadowOpacity}
        />
      ) : (
        <image href={vehicle.url} x={0} y={0} width={VEHICLE_VIEWBOX.width} height={VEHICLE_VIEWBOX.height} preserveAspectRatio="xMidYMid meet" />
      )}
    </svg>
  );
}
