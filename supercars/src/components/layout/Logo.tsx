import Link from "next/link";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`inline-flex min-h-11 items-center gap-2 rounded-lg text-fg no-underline ${className}`} aria-label="SuperCars — home">
      <span className="logo-mark" aria-hidden="true">SC</span>
      {/* Below 390px the bar has no room for the word next to the switch, cart, Create and menu; the mark stays. */}
      <span className="text-[1.0625rem] font-semibold leading-none tracking-[-0.02em] max-[389px]:hidden">SuperCars</span>
    </Link>
  );
}
