import type { Metadata } from "next"
import { Suspense } from "react"
import { buildMetadata } from "@/lib/seo/metadata"
import { searchService } from "@/server/services/search.service"
import { GuitarCard } from "@/components/guitar/guitar-card"
import { GuitarGridSkeleton } from "@/components/ui/skeleton"
import { SearchTrigger } from "@/components/search/search-trigger"
import type { GuitarCardDto } from "@/domain/guitar/types"

export const dynamic = "force-dynamic"

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}): Promise<Metadata> {
  const params = await searchParams
  const q = params.q ?? ""
  return buildMetadata({
    title: q ? `Search: ${q}` : "Search",
    description: "Search the GuitarTribe instrument database.",
    path: "/search",
    noIndex: !q,
  })
}

async function SearchResults({ q }: { q: string }) {
  if (!q.trim()) {
    return (
      <div className="py-20 text-center">
        <p className="text-muted-foreground">Enter a search term above to find instruments.</p>
      </div>
    )
  }

  const result = await searchService.query(q, { limit: 30 })

  if (result.hits.length === 0) {
    return (
      <div className="py-20 text-center">
        <p className="font-medium">No results for &ldquo;{q}&rdquo;</p>
        <p className="mt-2 text-sm text-muted-foreground">Try a different brand, model or spec.</p>
      </div>
    )
  }

  // Convert SearchHit to a GuitarCardDto-compatible shape for GuitarCard.
  const cards: GuitarCardDto[] = result.hits.map((hit) => ({
    id: hit.slug,
    slug: hit.slug,
    name: hit.name,
    brand: { slug: hit.slug.split("-")[0] ?? "", name: hit.brand },
    series: null,
    category: hit.category as GuitarCardDto["category"],
    categorySlug: hit.categorySlug,
    bodyShape: null,
    topWood: null,
    pickupConfig: null,
    scaleLengthIn: null,
    frets: null,
    strings: null,
    madeIn: null,
    year: null,
    price: hit.price,
    msrp: null,
    currency: hit.currency,
    expertScore: hit.expertScore,
    userScore: null,
    userScoreCount: 0,
    valueScore: null,
    availability: "UNKNOWN" as const,
    image: hit.image ? { url: hit.image, alt: hit.name, width: null, height: null, blurData: null } : null,
  }))

  return (
    <>
      <p className="mb-6 text-sm text-muted-foreground">
        {result.total} result{result.total !== 1 ? "s" : ""} for &ldquo;{q}&rdquo;
        <span className="ml-2 text-xs">(via {result.engine})</span>
      </p>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {cards.map((card, i) => (
          <GuitarCard key={card.slug} guitar={card} priority={i < 4} />
        ))}
      </div>
    </>
  )
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const params = await searchParams
  const q = params.q ?? ""

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Search</h1>
      <div className="mt-6 max-w-2xl">
        <SearchTrigger variant="full" />
      </div>
      <div className="mt-10">
        <Suspense fallback={<GuitarGridSkeleton count={8} />}>
          <SearchResults q={q} />
        </Suspense>
      </div>
    </div>
  )
}
