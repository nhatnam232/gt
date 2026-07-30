import { brandRepository } from "@/server/repositories/brand.repository"
import Link from "next/link"
import type { Metadata } from "next"

// Next.js requires a literal number (siteConfig.REVALIDATE.brand = 21600)
export const revalidate = 21600
export const metadata: Metadata = { title: "Guitar Brands" }

export default async function BrandsPage() {
  const brands = await brandRepository.list()
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Guitar Brands</h1>
      <p className="mt-1 text-muted-foreground">{brands.length} brands</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {brands.map((b) => (
          <Link key={b.slug} href={`/brands/${b.slug}`} className="rounded-xl border bg-card p-5 hover:bg-secondary/60 transition-colors">
            <p className="font-semibold">{b.name}</p>
            {b.countryCode && <p className="text-xs text-muted-foreground mt-1">{b.countryCode}</p>}
            <p className="text-xs text-muted-foreground mt-3">{b._count.guitars} instruments</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
