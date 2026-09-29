import type { ReactNode } from "react";

/** Physical presentation of a poster: bare print with a paper margin, or a slim black frame with a mat. */
export function ProductFrame({ variant, children, className = "" }: { variant: "poster" | "framed-poster"; children: ReactNode; className?: string }) {
  if (variant === "framed-poster") {
    return (
      <div className={`bg-[#0b0b0c] p-[3.5%] shadow-[0_30px_60px_-24px_rgba(0,0,0,0.85),0_2px_0_rgba(255,255,255,0.06)_inset] ${className}`}>
        <div className="bg-[#f2efe8] p-[5%] shadow-[inset_0_2px_8px_rgba(0,0,0,0.25)]">{children}</div>
      </div>
    );
  }
  return (
    <div className={`bg-[#f4f2ec] p-[2.5%] shadow-[0_26px_50px_-22px_rgba(0,0,0,0.8)] ${className}`}>{children}</div>
  );
}
