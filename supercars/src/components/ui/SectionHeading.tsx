import type { ReactNode } from "react";

interface SectionHeadingProps {
  readonly eyebrow: string;
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  readonly id?: string;
  readonly align?: "start" | "center";
  readonly as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, lead, id, align = "start", as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      <p className="eyebrow">{eyebrow}</p>
      <Tag id={id} className="h-display mt-4 text-[clamp(2.4rem,7vw,4.75rem)]">{title}</Tag>
      {lead && <p className="mt-5 max-w-2xl text-base text-muted sm:text-lg" style={align === "center" ? { marginInline: "auto" } : undefined}>{lead}</p>}
    </div>
  );
}
