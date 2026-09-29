import { EmptyState } from "@/components/ui/EmptyState";
import { IconSearch } from "@/components/ui/icons";

export default function NotFound() {
  return (
    <div className="container-x py-16 sm:py-24">
      <EmptyState icon={<IconSearch size={24} />} title="Off the map." message="We couldn't find that page. It may have moved, or the link may be wrong." action={{ label: "Back to home", href: "/" }} />
    </div>
  );
}
