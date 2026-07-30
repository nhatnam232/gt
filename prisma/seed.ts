/**
 * Prisma seed script.
 * Run with: npm run db:seed
 *
 * Seeds: Brands, Sources, Retailers, Ranking definitions.
 * Does NOT seed guitar products - those come from the ETL crawler.
 */

import { PrismaClient } from "@prisma/client"
import { SOURCE_SEED } from "../src/config/sources"
import { BRAND_SEED } from "../src/config/brands"

const prisma = new PrismaClient()

async function seedBrands() {
  console.log("Seeding brands...")
  let count = 0
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
      },
    })
    count++
  }
  console.log(`  Seeded ${count} brands.`)
}

async function seedSources() {
  console.log("Seeding sources...")
  let count = 0
  for (const source of SOURCE_SEED) {
    await prisma.source.upsert({
      where: { slug: source.slug },
      create: {
        slug: source.slug,
        name: source.name,
        kind: source.kind,
        baseUrl: source.baseUrl,
        trustWeight: source.trustWeight,
        rateLimitMs: source.rateLimitMs ?? 1000,
        enabled: source.enabled ?? true,
      },
      update: {
        trustWeight: source.trustWeight,
        enabled: source.enabled ?? true,
      },
    })
    count++
  }
  console.log(`  Seeded ${count} sources.`)
}

async function seedRankings() {
  console.log("Seeding ranking definitions...")
  const definitions = [
    { slug: "best-acoustic-guitars", name: "Best Acoustic Guitars", category: "ACOUSTIC" },
    { slug: "best-electric-guitars", name: "Best Electric Guitars", category: "ELECTRIC" },
    { slug: "best-bass-guitars", name: "Best Bass Guitars", category: "BASS" },
    { slug: "best-classical-guitars", name: "Best Classical Guitars", category: "CLASSICAL" },
    { slug: "best-guitars-under-500", name: "Best Guitars Under $500", category: null },
    { slug: "best-guitars-for-beginners", name: "Best Guitars for Beginners", category: null },
    { slug: "best-value-guitars", name: "Best Value Guitars", category: null },
    { slug: "best-acoustic-electric-guitars", name: "Best Acoustic-Electric Guitars", category: "ACOUSTIC" },
    { slug: "best-ukuleles", name: "Best Ukuleles", category: "UKULELE" },
  ] as const

  for (const def of definitions) {
    await prisma.ranking.upsert({
      where: { slug: def.slug },
      create: { slug: def.slug, name: def.name, category: def.category as string | null },
      update: { name: def.name },
    })
  }
  console.log(`  Seeded ${definitions.length} ranking definitions.`)
}

async function main() {
  try {
    await seedBrands()
    await seedSources()
    await seedRankings()
    console.log("\nSeed completed successfully.")
  } catch (err) {
    console.error("Seed failed:", err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
