import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { REVALIDATE } from "@/config/site"
import { buildMetadata } from "@/lib/seo/metadata"
import { graph, itemListSchema } from "@/lib/seo/jsonld"
import { rankingService } from "@/server/services/ranking.service"
import { formatPrice } from "@/lib/utils"
import { ScoreBadge, StarRating } from "@/components/guitar/score-badge"
import { CompareToggle } from "@/components/guitar/compare-toggle"

export const revalidate = REVALIDATE.ranking

export async function generateStaticParams() {
  const rankings = await rankingService.index()
  return rankings.map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const ranking = await rankingService.bySlug(slug)
  if (!ranking) return {}
  return buildMetadata({
    title: ranking.title,
    description: ranking.description ?? ranking.subtitle ?? ranking.title,
    path: `/rankings/${slug}`,
  })
}

export default async function RankingDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const ranking = await rankingService.bySlug(slug)
  if (!ranking) notFound()

  const jsonld = graph(
    itemListSchema({
      name: ranking.title,
      description: ranking.description ?? ranking.title,
      path: `/rankings/${slug}`,
      items: ranking.entries.map((entry) => ({
        name: `${entry.guitar.brand.name} ${entry.guitar.name}`,
        path: `/guitars/${entry.guitar.slug}`,
        image: entry.guitar.image?.url ?? null,
      })),
    }),
  )

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonld }} />
      <div className="container-page py-12">
        <div className="mb-8">
          <p className="eyebrow">Ranking</p>
          <h1 className="mt-2 text-3xl font-semibold">{ranking.title}</h1>
          {ranking.subtitle ? (
            <p className="mt-2 text-lg text-muted-foreground">{ranking.subtitle}</p>
          ) : null}
          {ranking.description ? (
            <p className="mt-3 max-w-2xl text-muted-foreground">{ranking.description}</p>
          ) : null}
        </div>

        <div className="space-y-3">
          {ranking.entries.map((entry) => (
            <article
              key={entry.guitar.slug}
              className="hairline card-hover flex items-center gap-5 rounded-2xl border bg-card p-4"
            >
              <span className="w-10 shrink-0 text-center text-2xl font-bold tabular-nums text-muted-foreground/50">
                {entry.position}
              </span>

              <Link
                href={`/guitars/${entry.guitar.slug}`}
                className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-muted"
              >
                {entry.guitar.image ? (
                  <Image
                    src={entry.guitar.image.url}
                    alt={entry.guitar.name}
                    fill
                    sizes="80px"
                    className="object-contain p-2"
                  />
                ) : null}
              </Link>

              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  {entry.guitar.brand.name}
                </p>
                <h3 className="mt-0.5">
                  <Link
                    href={`/guitars/${entry.guitar.slug}`}
                    className="font-semibold hover:text-primary"
                  >
                    {entry.guitar.name}
                  </Link>
                </h3>
                <StarRating
                  value={entry.guitar.userScore}
                  count={entry.guitar.userScoreCount}
                  className="mt-1"
                />
              </div>

              <div className="flex shrink-0 flex-col items-end gap-2">
                <ScoreBadge score={entry.guitar.expertScore} label="Expert" />
                {entry.guitar.price ? (
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(entry.guitar.price, entry.guitar.currency)}
                  </span>
                ) : null}
                <CompareToggle slug={entry.guitar.slug} />
              </div>
            </article>
          ))}
        </div>
      </div>
    </>
  )
}
