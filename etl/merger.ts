/**
 * Merges normalized SourceRecords into the Guitar table.
 *
 * For each unique (brand, name) pair, the merger:
 *  1. Finds or creates the Brand.
 *  2. Upserts the Guitar row, preferring fields from higher-confidence sources.
 *  3. Marks source records as merged.
 *
 * Higher trust_weight sources win on every field conflict.
 */

import { prisma } from "../src/lib/prisma"
import type { NormalizedGuitar } from "./normalizer"
import { slugify } from "../src/lib/utils"

export async function mergeAll() {
  const records = await prisma.sourceRecord.findMany({
    where: {
      normalized: { not: null },
      mergedAt: null,
    },
    include: { source: true },
    take: 10_000,
    orderBy: { source: { trustWeight: "desc" } },
  })

  console.log(`[merger] Merging ${records.length} normalized records...`)
  let merged = 0

  const brandCache = new Map<string, string>()

  for (const record of records) {
    try {
      const n = record.normalized as unknown as NormalizedGuitar
      if (!n?.name) continue

      // Resolve brand
      const brandName = n.brand?.trim() || "Unknown"
      let brandId = brandCache.get(brandName)
      if (!brandId) {
        const brand = await prisma.brand.upsert({
          where: { slug: slugify(brandName) },
          create: { slug: slugify(brandName), name: brandName },
          update: {},
        })
        brandId = brand.id
        brandCache.set(brandName, brandId)
      }

      const guitarSlug = slugify(`${brandName}-${n.name}`)

      await prisma.guitar.upsert({
        where: { slug: guitarSlug },
        create: {
          slug: guitarSlug,
          name: n.name,
          brandId,
          model: n.model,
          category: (n.category as "ACOUSTIC" | "ELECTRIC" | "BASS" | "CLASSICAL" | "UKULELE" | "AMPLIFIER" | "PEDAL" | "ACCESSORY") ?? "ACOUSTIC",
          bodyShape: n.bodyShape,
          topWood: n.topWood,
          backWood: n.backWood,
          scaleLengthIn: n.scaleLengthIn,
          frets: n.frets,
          strings: n.strings,
          madeIn: n.madeIn,
          year: n.year,
          msrp: n.msrp,
          currency: n.currency || "USD",
          summary: n.description,
          isPublished: false, // requires editorial review before publishing
        },
        update: {
          // Only update non-null fields from higher-confidence sources
          ...(n.model ? { model: n.model } : {}),
          ...(n.bodyShape ? { bodyShape: n.bodyShape } : {}),
          ...(n.topWood ? { topWood: n.topWood } : {}),
          ...(n.madeIn ? { madeIn: n.madeIn } : {}),
          ...(n.year ? { year: n.year } : {}),
          ...(n.msrp ? { msrp: n.msrp } : {}),
          ...(n.description && !record.normalized ? { summary: n.description } : {}),
        },
      })

      await prisma.sourceRecord.update({
        where: { id: record.id },
        data: { mergedAt: new Date() },
      })
      merged++
    } catch (err) {
      console.error(`[merger] Error merging record ${record.id}:`, err)
    }
  }

  console.log(`[merger] Merged ${merged} records`)
}
