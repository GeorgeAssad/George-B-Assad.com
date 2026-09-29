import type { Metadata } from "next";
import { LegalPage, LegalSection } from "@/components/layout/LegalPage";
import { formatPrice } from "@/lib/format";
import { getRepositories } from "@/server/repositories";

export const metadata: Metadata = { title: "Shipping", alternates: { canonical: "/shipping" } };

export default async function ShippingPage() {
  const repos = getRepositories();
  const [rules, destinations] = await Promise.all([repos.products.getShippingRules(), repos.products.listShippingDestinations()]);
  return (
    <LegalPage eyebrow="SC / Customer service" title="Shipping." intro="Final shipping information will be confirmed with our fulfilment partner before launch. The figures below are the placeholder values used by the demo checkout.">
      <LegalSection title="Demo rates and timing">
        <ul className="list-disc space-y-1 pl-5">
          <li>Flat shipping: <strong>{formatPrice(rules.flatRate)}</strong>, free on orders over <strong>{formatPrice(rules.freeOver)}</strong></li>
          <li>Estimated total time including production: <strong>{rules.minBusinessDays}–{rules.maxBusinessDays} business days</strong></li>
          <li>Tracking details appear on your <a href="/track">order page</a> once shipped</li>
        </ul>
      </LegalSection>
      <LegalSection title="Demo shipping destinations">
        <p>{destinations.map((d) => d.name).join(", ")}.</p>
      </LegalSection>
    </LegalPage>
  );
}
