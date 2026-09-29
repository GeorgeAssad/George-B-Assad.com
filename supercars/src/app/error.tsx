"use client";

import { useEffect } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import { IconHelp } from "@/components/ui/icons";

/** Route error boundary. Never renders error.message or stack: customers see a calm, generic state. */
export default function RouteError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    // Developer-facing breadcrumb only: the digest lets us find the server log without exposing internals.
    console.error("route_error", { digest: error.digest });
  }, [error]);

  return (
    <div className="container-x py-16 sm:py-24">
      <EmptyState icon={<IconHelp size={24} />} title="Something slipped." message="We hit a problem loading this page. Nothing has been charged. Please try again." onReset={reset} resetLabel="Try again" action={{ label: "Back to home", href: "/" }} />
      {error.digest && <p className="spec mt-6 text-center">Reference: {error.digest}</p>}
    </div>
  );
}
