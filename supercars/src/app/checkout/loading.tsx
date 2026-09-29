import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Loading checkout" className="container-x py-10 sm:py-16">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-16 w-72" />
      <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_26rem]">
        <div className="space-y-4"><Skeleton className="h-56" /><Skeleton className="h-72" /></div>
        <Skeleton className="h-96" />
      </div>
    </LoadingRegion>
  );
}
