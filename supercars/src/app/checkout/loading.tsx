import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Loading checkout" className="container-x pb-16 pt-[clamp(2.25rem,6vw,4.5rem)]">
      <Skeleton className="h-12 w-64" />
      <Skeleton className="mt-4 h-6 w-80 max-w-full" />
      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_24rem] lg:gap-8">
        <div className="space-y-4"><Skeleton className="h-56" /><Skeleton className="h-72" /></div>
        <Skeleton className="h-96" />
      </div>
    </LoadingRegion>
  );
}
