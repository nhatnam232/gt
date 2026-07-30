export default function Loading() {
  return (
    <div className="container-page py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="rounded-xl border bg-card overflow-hidden animate-pulse">
            <div className="aspect-[4/3] bg-secondary" />
            <div className="p-4 space-y-2">
              <div className="h-4 w-3/4 rounded bg-secondary" />
              <div className="h-3 w-1/2 rounded bg-secondary" />
              <div className="h-3 w-1/3 rounded bg-secondary" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
