"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import type { GuitarQuery, Paginated, GuitarCardDto } from "@/domain/guitar/types"
import type { FacetSet } from "@/server/repositories/facet.repository"
import { serializeGuitarQuery } from "@/domain/guitar/query"
import { cn, formatNumber } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { GuitarCard } from "@/components/guitar/guitar-card"
import { GuitarGridSkeleton } from "@/components/ui/skeleton"
import { FilterSidebar } from "@/components/guitar/filter-sidebar"
import { SortBar } from "@/components/guitar/sort-bar"

function pageUrl(query: GuitarQuery, page: number): string {
  const base = query.category
    ? `/c/${query.category.toLowerCase()}`
    : "/guitars"
  const qs = serializeGuitarQuery({ ...query, page })
  return qs ? `${base}?${qs}` : base
}

export function GuitarGrid({
  query,
  result,
  facets,
}: {
  query: GuitarQuery
  result: Paginated<GuitarCardDto>
  facets: FacetSet
}) {
  const [view, setView] = useState<"grid" | "list">("grid")

  return (
    <div className="container-page flex gap-8 py-10">
      <FilterSidebar query={query} facets={facets} />

      <div className="min-w-0 flex-1">
        <SortBar query={query} total={result.total} view={view} onViewChange={setView} />

        {result.items.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-base font-medium">No instruments match these filters</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Try removing a filter or{" "}
              <Link href="/guitars" className="text-primary hover:underline">
                clearing all filters
              </Link>.
            </p>
          </div>
        ) : view === "grid" ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {result.items.map((guitar, index) => (
              <GuitarCard key={guitar.id} guitar={guitar} priority={index < 8} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {result.items.map((guitar) => (
              <GuitarListRow key={guitar.id} guitar={guitar} />
            ))}
          </div>
        )}

        {/* Pagination */}
        {result.totalPages > 1 ? (
          <nav
            aria-label="Pagination"
            className="mt-10 flex items-center justify-center gap-2"
          >
            {query.page > 1 ? (
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href={pageUrl(query, query.page - 1)}>
                  <ChevronLeft className="size-4" /> Previous
                </Link>
              </Button>
            ) : null}
            <span className="text-sm text-muted-foreground">
              Page {formatNumber(query.page)} of {formatNumber(result.totalPages)}
            </span>
            {result.hasMore ? (
              <Button asChild variant="outline" size="sm" className="gap-1">
                <Link href={pageUrl(query, query.page + 1)}>
                  Next <ChevronRight className="size-4" />
                </Link>
              </Button>
            ) : null}
          </nav>
        ) : null}
      </div>
    </div>
  )
}

function GuitarListRow({ guitar }: { guitar: GuitarCardDto }) {
  return (
    <article className="hairline card-hover flex gap-4 rounded-2xl border bg-card p-4">
      <Link
        href={`/guitars/${guitar.slug}`}
        className="relative size-[5.5rem] shrink-0 overflow-hidden rounded-xl bg-muted"
      >
        {guitar.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={guitar.image.url}
            alt={guitar.image.alt}
            className="size-full object-contain p-2"
            loading="lazy"
          />
        ) : null}
      </Link>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {guitar.brand.name}
        </p>
        <h3 className="mt-0.5 text-[15px] font-semibold">
          <Link href={`/guitars/${guitar.slug}`} className="hover:text-primary">
            {guitar.name}
          </Link>
        </h3>
        <p className="mt-1 text-xs text-muted-foreground">
          {[guitar.bodyShape, guitar.topWood, guitar.madeIn].filter(Boolean).join(" · ")}
        </p>
      </div>
      <div className="flex shrink-0 flex-col items-end gap-1">
        {guitar.price ? (
          <span className="text-[15px] font-semibold tabular-nums">
            ${guitar.price.toLocaleString()}
          </span>
        ) : null}
        {guitar.expertScore ? (
          <span className="text-xs text-muted-foreground">
            Score: {guitar.expertScore.toFixed(1)}
          </span>
        ) : null}
      </div>
    </article>
  )
}
