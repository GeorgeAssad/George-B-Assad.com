import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export function CarGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <LoadingRegion label="Loading cars">
      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="card overflow-hidden">
            <Skeleton className="aspect-[16/10] rounded-none" />
            <div className="space-y-3 p-5">
              <Skeleton className="h-3 w-16" />
              <Skeleton className="h-8 w-40" />
              <Skeleton className="h-4 w-56" />
            </div>
          </li>
        ))}
      </ul>
    </LoadingRegion>
  );
}
