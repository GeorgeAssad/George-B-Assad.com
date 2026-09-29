import Link from "next/link";
import { IconInstagram, IconTikTok } from "@/components/ui/icons";
import { footerNav } from "@/config/nav";
import { siteConfig } from "@/config/site";
import { Logo } from "./Logo";

function Column({ title, links }: { title: string; links: readonly { label: string; href: string }[] }) {
  return (
    <div>
      <h2 className="spec">{title}</h2>
      <ul className="mt-4 space-y-2.5">
        {links.map((l) => (
          <li key={l.href}><Link href={l.href} className="text-sm text-muted transition-colors hover:text-fg">{l.label}</Link></li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-24 border-t border-line bg-surface">
      <div className="container-x py-14">
        <div className="grid gap-12 lg:grid-cols-[1.3fr_2.2fr]">
          <div>
            <Logo />
            <p className="mt-5 max-w-xs text-sm text-muted">Premium personalized automotive artwork, made for your car.</p>
            <div className="mt-6 flex items-center gap-2">
              <a href={siteConfig.social.instagram} target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full border border-line-strong text-muted transition-colors hover:border-fg hover:text-fg" aria-label="SuperCars on Instagram (opens in a new tab)"><IconInstagram size={19} /></a>
              <a href={siteConfig.social.tiktok} target="_blank" rel="noopener noreferrer" className="flex size-10 items-center justify-center rounded-full border border-line-strong text-muted transition-colors hover:border-fg hover:text-fg" aria-label="SuperCars on TikTok (opens in a new tab)"><IconTikTok size={19} /></a>
            </div>
            <p className="mt-6 text-sm text-muted">Contact: <a className="underline underline-offset-4 hover:text-fg" href={`mailto:${siteConfig.contactEmail}`}>{siteConfig.contactEmail}</a></p>
          </div>

          <nav aria-label="Footer" className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            <Column title="Shop" links={footerNav.shop} />
            <Column title="Company" links={footerNav.company} />
            <Column title="Customer service" links={footerNav.service} />
            <Column title="Legal" links={footerNav.legal} />
          </nav>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-line pt-6 text-xs text-subtle">
          <p>© {new Date().getFullYear()} SuperCars. Company name, registration and address: <span className="text-muted">[to be added before launch]</span>.</p>
          <p>Prototype store: no real payments are taken and no orders are fulfilled. Vehicle names are used for identification only; SuperCars is not affiliated with, or endorsed by, any vehicle manufacturer.</p>
        </div>
      </div>
    </footer>
  );
}
