import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export function ConfiguratorSkeleton() {
  return (
    <LoadingRegion label="Loading the poster designer" className="container-x pb-32 pt-6 sm:pt-8 lg:pb-12">
      <Skeleton className="h-7 w-full max-w-3xl rounded-full" />
      <div className="mt-7 grid grid-cols-1 gap-10 lg:mt-10 lg:grid-cols-[minmax(0,1fr)_26rem] lg:gap-14 xl:grid-cols-[minmax(0,1fr)_29rem]">
        <div>
          <Skeleton className="h-12 w-72" />
          <Skeleton className="mt-3 h-6 w-96 max-w-full" />
          <Skeleton className="mt-7 h-13 w-full rounded-full" />
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {Array.from({ length: 4 }, (_, i) => <Skeleton key={i} className="h-24" />)}
          </div>
        </div>
        <Skeleton className="hidden aspect-[5/7] rounded-[var(--lg-radius-xl)] lg:block" />
      </div>
    </LoadingRegion>
  );
}
