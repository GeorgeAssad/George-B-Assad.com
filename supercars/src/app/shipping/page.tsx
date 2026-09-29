import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { formatPrice } from "@/lib/format";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = { title: "Shipping & returns", alternates: { canonical: "/shipping" } };

export default async function ShippingPage() {
  const repos = getRepositories();
  const [rules, destinations] = await Promise.all([repos.products.getShippingRules(), repos.products.listShippingDestinations()]);
  return (
    <LegalPage eyebrow="SC / Customer service" title="Shipping & returns." intro="Final shipping and returns information will be confirmed with our fulfilment partner before launch. Nothing here is a binding policy; the figures are the placeholder values used by the demo checkout.">
      <LegalSection title="Demo rates and timing">
        <ul className="list-disc space-y-1 pl-5">
          <li>Flat shipping: <strong>{formatPrice(rules.flatRate)}</strong>, free on orders over <strong>{formatPrice(rules.freeOver)}</strong></li>
          <li>Estimated total time including production: <strong>{rules.minBusinessDays}–{rules.maxBusinessDays} business days</strong></li>
          <li>Tracking details appear on your order page (Track order, at the top of every page) once shipped</li>
        </ul>
      </LegalSection>
      <LegalSection title="Demo shipping destinations">
        <p>{destinations.map((d) => d.name).join(", ")}.</p>
      </LegalSection>
      <LegalSection title="Returns and refunds">
        <p>The final policy for personalized, made-to-order products will be published before launch. It will cover:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Damaged or defective items, and how to report them</li>
          <li>Print or personalization errors</li>
          <li>How personalized, made-to-order products are treated</li>
          <li>Timelines, refunds and who pays for return shipping</li>
        </ul>
        <p>Questions now? Use the support chat (demo assistant) or see <a href="/legal">Legal</a> for contact placeholders.</p>
      </LegalSection>
    </LegalPage>
  );
}
