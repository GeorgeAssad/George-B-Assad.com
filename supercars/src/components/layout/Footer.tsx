import Link from "next/link";
import { footerLinks } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { OpenChatLink } from "@/components/support/OpenChatLink";
import { ThemeToggle } from "./ThemeToggle";

const linkClass = "transition-colors hover:text-fg";

/** One line of small links. Company details, policies and contact live on /legal, not in a big footer. */
export function Footer() {
  return (
    <footer className="border-t border-line bg-surface text-xs text-subtle">
      <div className="container-x flex flex-col items-center gap-x-6 gap-y-1.5 py-3 sm:flex-row sm:justify-between">
        <nav aria-label="Footer">
          <ul className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            {footerLinks.map((l) => (
              <li key={l.href}><Link href={l.href} className={linkClass}>{l.label}</Link></li>
            ))}
            <li><OpenChatLink className={linkClass} /></li>
            <li><a href={`mailto:${siteConfig.contactEmail}`} className={linkClass}>{siteConfig.contactEmail}</a></li>
          </ul>
        </nav>
        <div className="flex items-center gap-3">
          <p className="text-center sm:text-right"><span className="sm:hidden">Prototype store · no real payments</span><span className="max-sm:hidden">Prototype store: no real payments. Not affiliated with any vehicle manufacturer.</span></p>
          <ThemeToggle className="size-8" />
        </div>
      </div>
    </footer>
  );
}
