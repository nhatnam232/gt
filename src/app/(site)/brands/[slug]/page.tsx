import { brandRepository } from "@/server/repositories/brand.repository"
import { GuitarCard } from "@/components/guitar-card"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

// Next.js requires a literal number (siteConfig.REVALIDATE.brand = 21600)
export const revalidate = 21600

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const brand = await brandRepository.findBySlug(slug)
  if (!brand) return {}
  return { title: brand.name, description: `Compare all ${brand.name} guitars.` }
}

export default async function BrandPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const brand = await brandRepository.findBySlug(slug)
  if (!brand) notFound()

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">{brand.name}</h1>
      <div className="flex flex-wrap gap-4 mt-2 text-sm text-muted-foreground">
        {brand.countryCode && <span>Country: {brand.countryCode}</span>}
        {brand.foundedYear && <span>Founded: {brand.foundedYear}</span>}
        {brand.priceTier && <span>Tier: {brand.priceTier}</span>}
        <span>{brand._count.guitars} instruments</span>
      </div>
      {brand.description && <p className="mt-4 max-w-2xl text-muted-foreground">{brand.description}</p>}
      {brand.guitars.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {brand.guitars.map((g) => <GuitarCard key={g.id} guitar={g} />)}
        </div>
      ) : (
        <p className="mt-8 text-muted-foreground">No instruments listed yet.</p>
      )}
    </div>
  )
}
