import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Loading order tracking" className="container-x py-12 sm:py-16">
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-16 w-96 max-w-full" />
      <Skeleton className="mt-10 h-14 max-w-2xl" />
    </LoadingRegion>
  );
}
