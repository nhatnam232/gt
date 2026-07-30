/**
 * Reference-data seed.
 *
 * IMPORTANT: this seed intentionally contains **no invented products**. It only
 * creates verifiable taxonomy that the ETL pipeline needs to attach real data
 * to: brands (with their official sites), retailers, data sources and the
 * ranking definitions. Products come exclusively from `npm run etl:all`.
 */
import { PrismaClient, Category, RankingKey, SourceKind } from "@prisma/client"
import { BRAND_SEED } from "../src/config/brands"
import { RETAILER_SEED } from "../src/config/retailers"
import { SOURCE_SEED } from "../src/config/sources"
import { RANKING_DEFINITIONS } from "../src/config/rankings"

const prisma = new PrismaClient()

async function seedBrands() {
  for (const brand of BRAND_SEED) {
    await prisma.brand.upsert({
      where: { slug: brand.slug },
      update: {
        name: brand.name,
        websiteUrl: brand.websiteUrl,
        countryCode: brand.countryCode,
        foundedYear: brand.foundedYear ?? null,
        priceTier: brand.priceTier,
        isFeatured: brand.featured ?? false,
        wikidataId: brand.wikidataId ?? null,
      },
      create: {
        slug: brand.slug,
        name: brand.name,
        websiteUrl: brand.websiteUrl,
        countryCode: brand.countryCode,
        foundedYear: brand.foundedYear ?? null,
        priceTier: brand.priceTier,
        isFeatured: brand.featured ?? false,
        wikidataId: brand.wikidataId ?? null,
      },
    })
  }
  console.log(`  brands: ${BRAND_SEED.length}`)
}

async function seedRetailers() {
  for (const r of RETAILER_SEED) {
    await prisma.retailer.upsert({
      where: { slug: r.slug },
      update: { name: r.name, websiteUrl: r.websiteUrl, countryCode: r.countryCode },
      create: {
        slug: r.slug,
        name: r.name,
        websiteUrl: r.websiteUrl,
        countryCode: r.countryCode,
      },
    })
  }
  console.log(`  retailers: ${RETAILER_SEED.length}`)
}

async function seedSources() {
  for (const s of SOURCE_SEED) {
    await prisma.source.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        kind: s.kind as SourceKind,
        baseUrl: s.baseUrl,
        robotsUrl: s.robotsUrl ?? null,
        trustWeight: s.trustWeight,
        rateLimitMs: s.rateLimitMs ?? 1200,
        enabled: s.enabled ?? true,
      },
      create: {
        slug: s.slug,
        name: s.name,
        kind: s.kind as SourceKind,
        baseUrl: s.baseUrl,
        robotsUrl: s.robotsUrl ?? null,
        trustWeight: s.trustWeight,
        rateLimitMs: s.rateLimitMs ?? 1200,
        enabled: s.enabled ?? true,
      },
    })
  }
  console.log(`  sources: ${SOURCE_SEED.length}`)
}

async function seedRankings() {
  for (const def of RANKING_DEFINITIONS) {
    await prisma.ranking.upsert({
      where: { key: def.key as RankingKey },
      update: {
        slug: def.slug,
        title: def.title,
        subtitle: def.subtitle,
        description: def.description,
        category: (def.category ?? null) as Category | null,
      },
      create: {
        key: def.key as RankingKey,
        slug: def.slug,
        title: def.title,
        subtitle: def.subtitle,
        description: def.description,
        category: (def.category ?? null) as Category | null,
      },
    })
  }
  console.log(`  rankings: ${RANKING_DEFINITIONS.length}`)
}

async function main() {
  console.log("seeding reference data...")
  await seedBrands()
  await seedRetailers()
  await seedSources()
  await seedRankings()
  console.log("done. next: npm run etl:all")
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
