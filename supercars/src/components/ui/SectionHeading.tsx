import type { ReactNode } from "react";

interface SectionHeadingProps {
  /** Optional small label above the title. Use sparingly. */
  readonly eyebrow?: string;
  readonly title: ReactNode;
  readonly lead?: ReactNode;
  readonly id?: string;
  readonly align?: "start" | "center";
  readonly as?: "h1" | "h2";
}

export function SectionHeading({ eyebrow, title, lead, id, align = "start", as: Tag = "h2" }: SectionHeadingProps) {
  return (
    <div className={align === "center" ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <Tag id={id} className={`h-display ${Tag === "h1" ? "h-page" : "h-section"}`}>{title}</Tag>
      {lead && <p className="lead mt-4 max-w-2xl" style={align === "center" ? { marginInline: "auto" } : undefined}>{lead}</p>}
    </div>
  );
}
