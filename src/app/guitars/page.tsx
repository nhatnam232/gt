import type { Metadata } from "next"
import { Suspense } from "react"
import { REVALIDATE } from "@/config/site"
import { buildMetadata } from "@/lib/seo/metadata"
import { parseGuitarQuery } from "@/domain/guitar/query"
import { guitarService } from "@/server/services/guitar.service"
import { GuitarGrid } from "@/components/guitar/guitar-grid"

export const revalidate = REVALIDATE.listing

export function generateMetadata(): Metadata {
  return buildMetadata({
    title: "All instruments",
    description: "Browse and filter every acoustic, electric, bass, classical guitar and more.",
    path: "/guitars",
  })
}

export default async function GuitarsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[]>>
}) {
  const params = await searchParams
  const query = parseGuitarQuery(params)

  const [result, facets] = await Promise.all([
    guitarService.list(query),
    guitarService.facets(query),
  ])

  return (
    <Suspense>
      <GuitarGrid query={query} result={result} facets={facets} />
    </Suspense>
  )
}
