import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ExternalLink, Globe } from "lucide-react"
import { buildMetadata } from "@/lib/seo/metadata"
import { brandRepository } from "@/server/repositories/brand.repository"
import { guitarService } from "@/server/services/guitar.service"
import { parseGuitarQuery } from "@/domain/guitar/query"
import { GuitarGrid } from "@/components/guitar/guitar-grid"
import { guitarService as gs } from "@/server/services/guitar.service"
import { guitarService as guitarSvc } from "@/server/services/guitar.service"

export const revalidate = 3600

export async function generateStaticParams() {
  const slugs = await brandRepository.slugs()
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const brand = await brandRepository.detail(slug)
  if (!brand) return {}
  return buildMetadata({
    title: `${brand.name} guitars`,
    description: brand.description ?? `Browse all ${brand.name} instruments in the database.`,
    path: `/brands/${slug}`,
  })
}

export default async function BrandDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>
  searchParams: Promise<Record<string, string | string[]>>
}) {
  const { slug } = await params
  const brand = await brandRepository.detail(slug)
  if (!brand) notFound()

  const sp = await searchParams
  const query = parseGuitarQuery({ ...sp, brand: slug })
  const [result, facets] = await Promise.all([
    guitarService.list(query),
    guitarService.facets(query),
  ])

  return (
    <div>
      <div className="container-page pt-10">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="eyebrow">Brand</p>
            <h1 className="mt-2 text-3xl font-semibold">{brand.name}</h1>
            {brand.description ? (
              <p className="mt-3 max-w-2xl text-muted-foreground">{brand.description}</p>
            ) : null}
            <div className="mt-3 flex flex-wrap gap-4 text-sm text-muted-foreground">
              {brand.countryCode ? <span>Country: {brand.countryCode}</span> : null}
              {brand.foundedYear ? <span>Founded: {brand.foundedYear}</span> : null}
              {brand.priceTier ? <span>Tier: {brand.priceTier}</span> : null}
              {brand.guitarCount > 0 ? <span>{brand.guitarCount} instruments</span> : null}
            </div>
          </div>
          {brand.websiteUrl ? (
            <Link
              href={brand.websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-colors hover:bg-secondary"
            >
              <Globe className="size-4" /> Official website
              <ExternalLink className="size-3.5 text-muted-foreground" />
            </Link>
          ) : null}
        </div>
      </div>
      <GuitarGrid query={query} result={result} facets={facets} />
    </div>
  )
}
