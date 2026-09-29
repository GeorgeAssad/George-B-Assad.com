import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex items-center gap-2.5 ${className}`} aria-label="SuperCars — home">
      <span className="logo-mark" aria-hidden="true"><span>SC</span></span>
      <span className="font-display text-[1.35rem] font-bold uppercase leading-none tracking-[0.14em]" style={{ fontFamily: "var(--font-display)" }}>
        Super<span className="text-red-text">Cars</span>
      </span>
    </Link>
  );
}
