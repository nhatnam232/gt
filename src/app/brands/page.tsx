import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import { brandRepository } from "@/server/repositories/brand.repository"
import { BrandCard } from "@/components/brand/brand-card"

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: "Guitar brands",
  description: "Browse all manufacturers in the GuitarTribe database.",
  path: "/brands",
})

export default async function BrandsPage() {
  const brands = await brandRepository.list()
  const featured = brands.filter((b) => b.isFeatured)
  const others = brands.filter((b) => !b.isFeatured)

  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">All brands</h1>
      <p className="mt-2 text-muted-foreground">{brands.length} manufacturers in the database.</p>

      {featured.length > 0 ? (
        <>
          <h2 className="mt-10 text-xl font-semibold">Featured</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {featured.map((brand) => <BrandCard key={brand.slug} brand={brand} />)}
          </div>
        </>
      ) : null}

      {others.length > 0 ? (
        <>
          <h2 className="mt-10 text-xl font-semibold">All manufacturers</h2>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {others.map((brand) => <BrandCard key={brand.slug} brand={brand} />)}
          </div>
        </>
      ) : null}
    </div>
  )
}
