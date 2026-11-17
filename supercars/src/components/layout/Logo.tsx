import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex min-h-11 items-center gap-2 rounded-lg text-fg no-underline ${className}`} aria-label="SuperCars — home">
      <span className="logo-mark" aria-hidden="true">SC</span>
      <span className="text-[1.0625rem] font-semibold leading-none tracking-[-0.02em]">SuperCars</span>
    </Link>
  );
}
