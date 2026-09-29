import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";

export const metadata: Metadata = { title: "Returns", alternates: { canonical: "/returns" } };

export default function ReturnsPage() {
  return (
    <LegalPage eyebrow="SC / Customer service" title="Returns." intro="Our returns and refunds policy for personalized products will be published before launch. Nothing here is a binding policy.">
      <LegalSection title="What the final policy will cover">
        <ul className="list-disc space-y-1 pl-5">
          <li>Damaged or defective items, and how to report them</li>
          <li>Print or personalization errors</li>
          <li>How personalized, made-to-order products are treated</li>
          <li>Timelines, refunds and who pays for return shipping</li>
        </ul>
      </LegalSection>
      <LegalSection title="Questions now?">
        <p>Use the support chat (demo assistant) or see <a href="/legal">Legal</a> for contact placeholders.</p>
      </LegalSection>
    </LegalPage>
  );
}
