import { LoadingRegion, Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <LoadingRegion label="Loading order tracking" className="container-x pb-12 pt-[clamp(2.25rem,6vw,4.5rem)]">
      <Skeleton className="h-12 w-96 max-w-full" />
      <Skeleton className="mt-4 h-6 w-80 max-w-full" />
      <Skeleton className="mt-8 h-14 max-w-2xl rounded-full" />
    </LoadingRegion>
  );
}
