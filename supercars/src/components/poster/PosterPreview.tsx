import { useId } from "react";
import type { Customization } from "@/domain/cart";
import type { CarSpecs, DesignTemplate, SizeId, VehicleAsset } from "@/domain/catalog";
import { VehicleArt } from "./VehicleArt";
import { PosterText } from "./PosterText";
import { overlay, underlay, type DecorationContext } from "./decorations";
import { POSTER_WIDTH, posterHeight } from "./poster-geometry";
import { VEHICLE_VIEWBOX } from "./vehicle-shapes";

export interface PosterPreviewProps {
  readonly template: DesignTemplate;
  readonly vehicle: VehicleAsset;
  readonly customization: Customization;
  readonly vehicleName: string;
  readonly specs: Pick<CarSpecs, "years" | "powerKw" | "torqueNm" | "seats" | "drivetrain">;
  readonly sizeId: SizeId;
  readonly className?: string;
  /** Text shown (dimmed) when the customer hasn't typed a name yet. */
  readonly placeholderName?: string;
}

const SIZE_LABEL: Record<SizeId, string> = { "30x40": "30×40 cm", "40x60": "40×60 cm", "50x70": "50×70 cm" };

/**
 * VEHICLE ASSET + DESIGN TEMPLATE + CUSTOMIZATION DATA → POSTER PREVIEW.
 * Everything positional comes from `template.layout`; customer text is
 * rendered as escaped SVG text. The future AI/print pipeline replaces the
 * vehicle asset and the renderer, not this contract.
 */
export function PosterPreview({ template, vehicle, customization, vehicleName, specs, sizeId, className, placeholderName = "Your name" }: PosterPreviewProps) {
  const uid = useId().replace(/:/g, "");
  const W = POSTER_WIDTH;
  const H = posterHeight(sizeId);
  const L = template.layout;

  const frame = { x: L.artFrame.x * W, y: L.artFrame.y * H, w: L.artFrame.w * W, h: L.artFrame.h * H };
  const scale = Math.min(frame.w / VEHICLE_VIEWBOX.width, frame.h / VEHICLE_VIEWBOX.height);
  const art = {
    x: frame.x + (frame.w - VEHICLE_VIEWBOX.width * scale) / 2,
    y: frame.y + (frame.h - VEHICLE_VIEWBOX.height * scale) / 2,
    scale,
  };

  const paintedVehicle: VehicleAsset =
    L.artPaint && vehicle.kind === "svg-archetype" ? { ...vehicle, palette: { ...vehicle.palette, body: L.artPaint } } : vehicle;
  const ctx: DecorationContext = { id: uid, W, H, template, vehicle, sizeId, sizeLabel: SIZE_LABEL[sizeId], art };
  const hasName = customization.name.trim().length > 0;
  const metaLine = [customization.text, customization.year, customization.location].filter(Boolean).join("  ·  ");
  const tech = [
    { label: "Power", value: `${specs.powerKw} kW` },
    { label: "Torque", value: `${specs.torqueNm} Nm` },
    { label: "Seats", value: String(specs.seats) },
    { label: "Drive", value: specs.drivetrain },
  ];
  const m = L.margin * W;
  const colW = (W - 2 * m) / tech.length;
  const nameY = L.personalization.y * H;
  const label = `${template.name} style poster of ${vehicleName}${hasName ? ` for ${customization.name}` : ""}, ${SIZE_LABEL[sizeId]}`;

  const bg = L.background;
  const angle = ((bg.gradient?.angle ?? 180) * Math.PI) / 180;
  const gx = Math.sin(angle) / 2;
  const gy = -Math.cos(angle) / 2;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className={className}
      role="img"
      aria-label={label}
      preserveAspectRatio="xMidYMid meet"
      style={{ display: "block", width: "100%", height: "auto" }}
    >
      <defs>
        {bg.gradient && (
          <linearGradient id={`${uid}-bg`} x1={0.5 - gx} y1={0.5 - gy} x2={0.5 + gx} y2={0.5 + gy}>
            {bg.gradient.stops.map((s) => <stop key={s.offset} offset={s.offset} stopColor={s.color} />)}
          </linearGradient>
        )}
        {bg.glow && (
          <radialGradient id={`${uid}-glow`} cx={bg.glow.cx} cy={bg.glow.cy} r={bg.glow.r}>
            <stop offset="0" stopColor={bg.glow.color} />
            <stop offset="1" stopColor={bg.glow.color} stopOpacity="0" />
          </radialGradient>
        )}
      </defs>

      <rect width={W} height={H} fill={bg.base} />
      {bg.gradient && <rect width={W} height={H} fill={`url(#${uid}-bg)`} />}
      {bg.glow && <rect width={W} height={H} fill={`url(#${uid}-glow)`} />}

      {L.decorations.map((id) => {
        const draw = underlay[id];
        return draw ? <g key={id}>{draw(ctx)}</g> : null;
      })}

      <VehicleArt
        vehicle={paintedVehicle}
        treatment={L.artTreatment}
        ink={L.ink}
        accent={L.accent}
        x={frame.x}
        y={frame.y}
        width={frame.w}
        height={frame.h}
        shadowOpacity={template.id === "minimal" ? 0.28 : 0.6}
      />

      <PosterText text={vehicleName} style={L.title.style} canvasWidth={W} margin={L.margin} y={L.title.y * H} />
      <PosterText text={specs.years} style={L.subtitle.style} canvasWidth={W} margin={L.margin} y={L.subtitle.y * H} />

      <PosterText text={hasName ? customization.name : placeholderName} style={L.personalization.nameStyle} canvasWidth={W} margin={L.margin} y={nameY} opacity={hasName ? 1 : 0.25} />
      <PosterText text={metaLine} style={L.personalization.metaStyle} canvasWidth={W} margin={L.margin} y={nameY + L.personalization.metaStyle.size * W * 2.1} />

      {tech.map((t, i) => {
        const align = L.technical.valueStyle.align;
        const x = align === "start" ? m + i * colW : m + i * colW + colW / 2;
        const valueY = L.technical.y * H;
        return (
          <g key={t.label}>
            <PosterText text={t.label} style={L.technical.labelStyle} canvasWidth={W} margin={L.margin} y={valueY - L.technical.valueStyle.size * W * 1.35} x={x} maxWidth={colW - 12} />
            <PosterText text={t.value} style={L.technical.valueStyle} canvasWidth={W} margin={L.margin} y={valueY} x={x} maxWidth={colW - 12} />
            {L.technical.layout === "columns" && i > 0 && (
              <line x1={m + i * colW - 10} y1={valueY - L.technical.valueStyle.size * W * 1.9} x2={m + i * colW - 10} y2={valueY + 8} stroke={L.accent} strokeWidth="0.8" opacity="0.5" />
            )}
          </g>
        );
      })}

      <PosterText text={L.branding.text} style={L.branding.style} canvasWidth={W} margin={L.margin} y={L.branding.y * H} />

      {L.decorations.map((id) => {
        const draw = overlay[id];
        return draw ? <g key={id}>{draw(ctx)}</g> : null;
      })}
    </svg>
  );
}
