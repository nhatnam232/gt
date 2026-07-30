import { GuitarGridSkeleton, Skeleton } from "@/components/ui/skeleton"

export default function Loading() {
  return (
    <div className="container-page py-12">
      <Skeleton className="h-8 w-64" />
      <Skeleton className="mt-3 h-4 w-96" />
      <div className="mt-10">
        <GuitarGridSkeleton count={8} />
      </div>
    </div>
  )
}
