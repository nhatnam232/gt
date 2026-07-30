import { Suspense } from "react"
import { guitarService } from "@/server/services/guitar.service"
import { GuitarCard } from "@/components/guitar-card"
import { SortBar } from "@/components/sort-bar"
import { CompareBar } from "@/components/compare-bar"
import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export const revalidate = siteConfig.REVALIDATE.listing

export const metadata: Metadata = {
  title: "Browse All Guitars",
  description: "Compare every acoustic, electric, bass, and classical guitar.",
}

export default async function GuitarsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>
}) {
  const sp = await searchParams
  const page = Math.max(1, Number(sp.page ?? 1))

  const result = await guitarService.list({
    category: sp.category,
    brandSlug: sp.brand,
    sort: sp.sort,
    q: sp.q,
    minPrice: sp.minPrice ? Number(sp.minPrice) : undefined,
    maxPrice: sp.maxPrice ? Number(sp.maxPrice) : undefined,
    page,
    perPage: 24,
  })

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Browse Guitars</h1>
      <p className="mt-1 text-muted-foreground">{result.total.toLocaleString()} instruments</p>

      <div className="mt-6">
        <Suspense fallback={null}>
          <SortBar />
        </Suspense>
      </div>

      {result.items.length === 0 ? (
        <div className="mt-16 text-center">
          <p className="text-lg font-medium">No guitars found.</p>
          <p className="text-muted-foreground mt-2">Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((g) => (
            <GuitarCard key={g.id} guitar={g} />
          ))}
        </div>
      )}

      {result.totalPages > 1 && (
        <div className="mt-8 flex justify-center gap-2">
          {Array.from({ length: result.totalPages }, (_, i) => i + 1).map((p) => (
            <form key={p} method="get">
              {Object.entries(sp).filter(([k]) => k !== "page").map(([k, v]) => (
                <input key={k} type="hidden" name={k} value={v as string} />
              ))}
              <input type="hidden" name="page" value={p} />
              <button
                type="submit"
                className={`size-9 rounded-lg border text-sm ${
                  p === page ? "bg-primary text-primary-foreground" : "bg-background hover:bg-secondary"
                }`}
              >
                {p}
              </button>
            </form>
          ))}
        </div>
      )}

      <CompareBar />
    </div>
  )
}
