import { EmptyState } from "@/components/ui/EmptyState";
import { IconSearch } from "@/components/ui/icons";

export default function CarNotFound() {
  return (
    <div className="container-x py-16 sm:py-24">
      <EmptyState
        icon={<IconSearch size={24} />}
        title="That car isn't in the catalog yet."
        message="We couldn't find the car you were looking for. Browse the catalog or search by brand, model or generation."
        action={{ label: "Browse cars", href: "/cars" }}
        secondary={{ label: "Create a poster", href: "/create" }}
      />
    </div>
  );
}
