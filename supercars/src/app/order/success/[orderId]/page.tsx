import type { Metadata } from "next";
import { OrderSuccess } from "@/components/orders/OrderSuccess";
import { EmptyState } from "@/components/ui/EmptyState";
import { getRepositories } from "@/server/repositories";
import { orderIdSchema } from "@/lib/validation";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

export default async function OrderSuccessPage({ params }: { params: Promise<{ orderId: string }> }) {
  const { orderId: raw } = await params;
  const parsed = orderIdSchema.safeParse(decodeURIComponent(raw));

  if (!parsed.success) {
    return (
      <div className="container-x py-16">
        <EmptyState title="Unknown order." message="That doesn't look like a valid order number." action={{ label: "Track an order", href: "/track" }} />
      </div>
    );
  }

  const repos = getRepositories();
  const [cars, templates] = await Promise.all([repos.cars.listEntries(), repos.templates.list()]);
  return (
    <div className="container-x py-12 sm:py-20">
      <OrderSuccess orderId={parsed.data} cars={cars} templates={templates} />
    </div>
  );
}
