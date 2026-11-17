import Link from "next/link";
import { footerLinks } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { OpenChatLink } from "@/components/support/OpenChatLink";

const linkClass = "inline-flex min-h-11 items-center rounded text-muted no-underline transition-colors hover:text-fg";

/** Small print only: policies and contact. Navigation and the light/dark switch live in the bar at the top. */
export function Footer() {
  return (
    <footer className="mt-auto pt-[clamp(3rem,7vw,5rem)] text-[0.8125rem] text-muted">
      <div className="container-x">
        <div className="flex flex-col items-center border-t-[0.5px] border-line pb-3 pt-3">
          <nav aria-label="Footer">
            <ul className="flex flex-wrap items-center justify-center gap-x-5">
              {footerLinks.map((l) => (
                <li key={l.href}><Link href={l.href} prefetch={false} className={linkClass}>{l.label}</Link></li>
              ))}
              <li><OpenChatLink className={`${linkClass} cursor-pointer`} /></li>
              <li><a href={`mailto:${siteConfig.contactEmail}`} className={linkClass}>{siteConfig.contactEmail}</a></li>
            </ul>
          </nav>
          <p className="flex min-h-11 items-center text-center"><span className="sm:hidden">Prototype store · no real payments</span><span className="max-sm:hidden">Prototype store: no real payments. Not affiliated with any vehicle manufacturer.</span></p>
        </div>
      </div>
    </footer>
  );
}
