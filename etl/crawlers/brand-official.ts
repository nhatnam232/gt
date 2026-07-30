/**
 * Brand official site crawler — upserts brand metadata from seed config.
 * For now this is a lightweight operation that syncs BRAND_SEED into the DB.
 */

import { prisma } from "@/lib/prisma"
import { BRAND_SEED } from "@/config/brands"

export async function crawlBrands() {
  console.log(`[brands] Syncing ${BRAND_SEED.length} brands...`)
  let upserted = 0

  for (const brand of BRAND_SEED) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      create: {
        slug: brand.slug,
        name: brand.name,
        countryCode: brand.countryCode ?? null,
        foundedYear: brand.foundedYear ?? null,
        priceTier: brand.priceTier ?? null,
        websiteUrl: brand.websiteUrl ?? null,
        isFeatured: brand.isFeatured ?? false,
        logoUrl: brand.logoUrl ?? null,
      },
      update: {
        name: brand.name,
        isFeatured: brand.isFeatured ?? false,
        countryCode: brand.countryCode ?? null,
      },
    })
    upserted++
  }

  console.log(`[brands] Done. Upserted ${upserted} brands.`)
}
