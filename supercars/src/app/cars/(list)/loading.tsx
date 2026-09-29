import { CarGridSkeleton } from "@/components/cars/CarGridSkeleton";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="container-x py-12 sm:py-16">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-16 w-full max-w-md" />
      <Skeleton className="mt-10 h-16 w-full rounded-full" />
      <div className="mt-8 flex gap-2 overflow-hidden">
        {Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-10 w-24 flex-none rounded-full" />)}
      </div>
      <div className="mt-12"><CarGridSkeleton /></div>
    </div>
  );
}
