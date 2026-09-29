import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = { title: "Legal", alternates: { canonical: "/legal" } };

export default function LegalNoticePage() {
  return (
    <LegalPage eyebrow="SC / Legal" title="Legal." intro="Company and legal information will be added here before launch. We haven't invented any.">
      <LegalSection title="Company details">
        <dl className="grid grid-cols-1 gap-x-8 gap-y-3 sm:grid-cols-[12rem_1fr]">
          {[["Company name", "[to be added]"], ["Registration number", "[to be added]"], ["Registered address", "[to be added]"], ["VAT / tax ID", "[to be added]"], ["Contact email", siteConfig.contactEmail]].map(([k, v]) => (
            <div key={k} className="contents"><dt className="text-subtle">{k}</dt><dd className="text-fg">{v}</dd></div>
          ))}
        </dl>
      </LegalSection>
      <LegalSection title="Vehicle names and artwork">
        <p>Vehicle manufacturer and model names are used only to identify the car shown in an artwork. SuperCars is not affiliated with, or endorsed by, any vehicle manufacturer. All vehicle artwork in this prototype is original, generic and created for this project; no manufacturer logos or photographs are used.</p>
      </LegalSection>
    </LegalPage>
  );
}
