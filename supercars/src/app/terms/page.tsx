import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Terms", alternates: { canonical: "/terms" } };

export default function TermsPage() {
  return (
    <LegalPage eyebrow="SC / Legal" title="Terms." intro="Final terms of sale and use will be added before launch. Nothing on this page is a binding agreement.">
      <LegalSection title="This is a prototype">
        <p>This site demonstrates how ordering will work. No payments are taken, no orders are fulfilled, and prices, delivery times and specifications shown are placeholders.</p>
      </LegalSection>
      <LegalSection title="What the final terms will cover">
        <ul className="list-disc space-y-1 pl-5">
          <li>Ordering, pricing and payment</li>
          <li>Personalized products and content you provide</li>
          <li>Production, delivery and risk of loss</li>
          <li>Cancellations, returns and consumer rights</li>
          <li>Intellectual property and use of vehicle names</li>
          <li>Liability, governing law and contact details</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
