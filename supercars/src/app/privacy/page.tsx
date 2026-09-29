import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Privacy", alternates: { canonical: "/privacy" } };

export default function PrivacyPage() {
  return (
    <LegalPage eyebrow="SC / Legal" title="Privacy." intro="A full privacy policy will be published before this store takes real orders. Until then, this page describes how the prototype itself behaves.">
      <LegalSection title="What this prototype does">
        <p>Your cart, your last few demo orders and your theme preference are kept in <strong>your browser&apos;s local storage</strong> on this device. They are not used to identify you.</p>
        <p>The prototype does not run advertising or analytics trackers, and does not collect card details. The checkout is a demonstration.</p>
        <p>Details you type into the demo checkout are sent to this site&apos;s server to create the demo order. Server logs are designed to leave out personal data.</p>
      </LegalSection>
      <LegalSection title="What the final policy will cover">
        <ul className="list-disc space-y-1 pl-5">
          <li>Who is responsible for your data (company details to be added)</li>
          <li>What we collect, why, and the legal basis</li>
          <li>Payment, fulfilment and email providers we share data with</li>
          <li>Retention, security, and your rights</li>
          <li>Cookies and analytics consent</li>
        </ul>
      </LegalSection>
    </LegalPage>
  );
}
