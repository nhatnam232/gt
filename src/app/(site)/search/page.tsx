import type { Metadata } from "next"

export const metadata: Metadata = { title: "Search Guitars" }

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const sp = await searchParams
  const q = sp.q ?? ""

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Search</h1>
      <form method="get" className="mt-6 flex gap-3">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search guitars, brands, features..."
          className="flex-1 h-11 rounded-xl border border-input bg-background px-4 text-base focus:outline-none focus:ring-2 focus:ring-ring"
          autoFocus
        />
        <button
          type="submit"
          className="h-11 px-6 rounded-xl bg-primary text-primary-foreground font-medium hover:bg-primary/90"
        >
          Search
        </button>
      </form>
      {q && (
        <p className="mt-6 text-muted-foreground text-sm">
          Showing results for <strong>"{q}"</strong>. Full faceted search powered by Meilisearch is available once indexed.
        </p>
      )}
    </div>
  )
}
