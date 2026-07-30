import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink } from "lucide-react"
import { buildMetadata } from "@/lib/seo/metadata"
import { SOURCE_SEED } from "@/config/sources"

export const metadata: Metadata = buildMetadata({
  title: "Data sources",
  description: "Where GuitarTribe gets its specifications, prices and editorial content.",
  path: "/data-sources",
})

export default function DataSourcesPage() {
  const grouped = SOURCE_SEED.reduce<Record<string, typeof SOURCE_SEED>>((acc, source) => {
    ;(acc[source.kind] ??= []).push(source)
    return acc
  }, {})

  return (
    <div className="container-page max-w-3xl py-14">
      <h1 className="text-3xl font-semibold">Data sources</h1>
      <p className="mt-3 text-muted-foreground">
        All specifications, images and prices are imported from public sources. Official
        manufacturer websites take the highest trust weight and override data from secondary
        sources on any conflicting field.
      </p>

      {Object.entries(grouped).map(([kind, sources]) => (
        <section key={kind} className="mt-10">
          <h2 className="text-lg font-semibold capitalize">{kind.replace(/_/g, " ").toLowerCase()}</h2>
          <ul className="mt-4 grid gap-2 sm:grid-cols-2">
            {sources.map((source) => (
              <li key={source.slug} className="hairline flex items-center gap-3 rounded-xl border bg-card p-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{source.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{source.baseUrl}</p>
                </div>
                <Link
                  href={source.baseUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="shrink-0 text-muted-foreground hover:text-foreground"
                >
                  <ExternalLink className="size-4" />
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
