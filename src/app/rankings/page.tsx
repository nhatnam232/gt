import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, Trophy } from "lucide-react"
import { buildMetadata } from "@/lib/seo/metadata"
import { rankingService } from "@/server/services/ranking.service"
import { REVALIDATE } from "@/config/site"

export const revalidate = REVALIDATE.ranking

export const metadata: Metadata = buildMetadata({
  title: "Top rankings",
  description: "Curated best-of lists for acoustic, electric, bass, classical and more.",
  path: "/rankings",
})

export default async function RankingsPage() {
  const rankings = await rankingService.index()

  return (
    <div className="container-page py-12">
      <div className="mb-10 flex items-center gap-3">
        <Trophy className="size-7 text-primary" />
        <div>
          <h1 className="text-3xl font-semibold">Rankings</h1>
          <p className="mt-1 text-muted-foreground">
            Rebuilt hourly from live scores, prices and owner ratings.
          </p>
        </div>
      </div>

      {rankings.length === 0 ? (
        <p className="text-muted-foreground">
          Rankings are empty. Run{" "}
          <code className="rounded bg-muted px-1 text-sm">npm run etl:all</code> then rebuild:
          admin &rarr; Rebuild rankings.
        </p>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {rankings.map((ranking) => (
            <Link
              key={ranking.slug}
              href={`/rankings/${ranking.slug}`}
              className="card-hover hairline group flex items-center justify-between gap-4 rounded-2xl border bg-card p-5"
            >
              <div>
                <p className="font-semibold group-hover:text-primary">{ranking.title}</p>
                {ranking.subtitle ? (
                  <p className="mt-1 text-sm text-muted-foreground">{ranking.subtitle}</p>
                ) : null}
                <p className="mt-2 text-xs text-muted-foreground">{ranking.count} instruments</p>
              </div>
              <ArrowRight className="size-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
