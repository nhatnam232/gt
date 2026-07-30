import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { Suspense } from "react"
import { CATEGORIES, categoryBySlug } from "@/config/navigation"
import { REVALIDATE } from "@/config/site"
import { buildMetadata } from "@/lib/seo/metadata"
import { parseGuitarQuery } from "@/domain/guitar/query"
import { guitarService } from "@/server/services/guitar.service"
import { GuitarGrid } from "@/components/guitar/guitar-grid"

export const revalidate = REVALIDATE.listing

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ category: c.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>
}): Promise<Metadata> {
  const { category: slug } = await params
  const meta = categoryBySlug(slug)
  if (!meta) return {}
  return buildMetadata({
    title: `${meta.label} guitars`,
    description: meta.blurb,
    path: `/c/${slug}`,
  })
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  const { category: slug } = await params
  const meta = categoryBySlug(slug)
  if (!meta) notFound()

  const sp = await searchParams
  const query = parseGuitarQuery(sp, { category: meta.key })

  const [result, facets] = await Promise.all([
    guitarService.list(query),
    guitarService.facets(query),
  ])

  return (
    <Suspense>
      <div className="container-page pt-10">
        <h1 className="text-3xl font-semibold">{meta.label}</h1>
        <p className="mt-2 text-muted-foreground">{meta.blurb}</p>
      </div>
      <GuitarGrid query={query} result={result} facets={facets} />
    </Suspense>
  )
}
