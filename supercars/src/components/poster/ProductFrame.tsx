import type { ReactNode } from "react";

/** Physical presentation of a poster: bare print with a paper margin, or a slim black frame with a mat. */
export function ProductFrame({ variant, children, className = "" }: { variant: "poster" | "framed-poster"; children: ReactNode; className?: string }) {
  if (variant === "framed-poster") {
    return (
      <div className={`bg-[#0b0b0c] p-[3.5%] shadow-[0_22px_44px_-18px_rgba(0,0,0,0.55),0_2px_0_rgba(255,255,255,0.06)_inset] ${className}`}>
        <div className="bg-[#f2efe8] p-[5%] shadow-[inset_0_2px_8px_rgba(0,0,0,0.25)]">{children}</div>
      </div>
    );
  }
  return (
    <div className={`bg-[#f4f2ec] p-[2.5%] shadow-[0_18px_36px_-16px_rgba(0,0,0,0.5),0_0_0_0.5px_rgba(0,0,0,0.08)] ${className}`}>{children}</div>
  );
}
