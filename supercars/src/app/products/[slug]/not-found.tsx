import { EmptyState } from "@/components/ui/EmptyState";
import { IconPackage } from "@/components/ui/icons";

export default function ProductNotFound() {
  return (
    <div className="container-x py-16 sm:py-24">
      <EmptyState icon={<IconPackage size={24} />} title="Product unavailable." message="That product isn't available right now. Browse the shop or start designing your poster." action={{ label: "Shop posters", href: "/shop" }} secondary={{ label: "Create a poster", href: "/create" }} />
    </div>
  );
}
