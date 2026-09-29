import type { CarSpecs } from "@/domain/catalog";

export function SpecGrid({ specs }: { specs: CarSpecs }) {
  const rows: [string, string][] = [
    ["Years", specs.years],
    ["Power", `${specs.powerKw} kW`],
    ["Torque", `${specs.torqueNm} Nm`],
    ["Seats", `${specs.seats}-seater`],
    ["Drivetrain", specs.drivetrain],
    ["Engine", specs.engine],
  ];
  return (
    <div>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line">
        {rows.map(([label, value]) => (
          <div key={label} className="bg-surface p-4 sm:p-5">
            <dt className="spec">{label}</dt>
            <dd className="h-display mt-1.5 text-[1.7rem] leading-none">{value}</dd>
          </div>
        ))}
      </dl>
      <p className="mt-3 text-xs text-subtle">Catalog data (prototype) — illustrative values, not live-researched or verified.</p>
    </div>
  );
}
