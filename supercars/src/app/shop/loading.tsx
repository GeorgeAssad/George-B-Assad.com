import { ProductGridSkeleton } from "@/components/products/ProductGridSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-x py-12 sm:py-16">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-16 w-96 max-w-full" />
      <div className="mt-12"><ProductGridSkeleton /></div>
    </div>
  );
}
