import type { GuitarCardDto } from "@/domain/guitar/types"
import { GuitarCard } from "@/components/guitar/guitar-card"
import { EmptyState } from "@/components/layout/section"

/**
 * Responsive rail: a scroll-snapping carousel on small screens and a plain grid
 * from `md` up, so we never ship carousel JS.
 */
export function GuitarRail({
  guitars,
  priority = false,
  emptyTitle = "Nothing indexed yet",
  emptyDescription = "Run the importer (npm run etl:all) to populate the catalogue from official manufacturer sources.",
}: {
  guitars: GuitarCardDto[]
  priority?: boolean
  emptyTitle?: string
  emptyDescription?: string
}) {
  if (guitars.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />
  }

  return (
    <div className="no-scrollbar -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0 lg:grid-cols-4">
      {guitars.map((guitar, index) => (
        <GuitarCard
          key={guitar.id}
          guitar={guitar}
          priority={priority && index < 4}
          className="w-[16rem] shrink-0 snap-start md:w-auto"
        />
      ))}
    </div>
  )
}
