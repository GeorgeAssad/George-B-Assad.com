import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export function ConfiguratorSkeleton() {
  return (
    <LoadingRegion label="Loading the poster designer" className="container-x py-8 sm:py-12">
      <Skeleton className="h-3 w-40" />
      <div className="mt-6 grid gap-12 lg:grid-cols-[minmax(0,1fr)_28rem]">
        <div>
          <Skeleton className="hidden h-9 w-full lg:block" />
          <Skeleton className="mt-10 h-12 w-72" />
          <Skeleton className="mt-3 h-4 w-96 max-w-full" />
          <Skeleton className="mt-8 h-14 w-full rounded-full" />
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
        <Skeleton className="hidden aspect-[5/7] lg:block" />
      </div>
    </LoadingRegion>
  );
}
