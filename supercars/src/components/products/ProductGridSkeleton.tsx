import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export function ProductGridSkeleton({ count = 2 }: { count?: number }) {
  return (
    <LoadingRegion label="Loading products">
      <ul className="grid gap-5 md:grid-cols-2">
        {Array.from({ length: count }, (_, i) => (
          <li key={i} className="card overflow-hidden"><Skeleton className="h-96 rounded-none" /><div className="space-y-3 p-6"><Skeleton className="h-3 w-16" /><Skeleton className="h-9 w-56" /><Skeleton className="h-4 w-64" /></div></li>
        ))}
      </ul>
    </LoadingRegion>
  );
}
