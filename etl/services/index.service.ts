/**
 * Meilisearch indexing service — converts Prisma Guitar rows to search documents.
 */

import { prisma } from "@/lib/prisma"
import { ensureIndex, indexDocuments, GUITAR_INDEX } from "@/lib/search"
import type { GuitarDocument } from "@/lib/search"
import { decimalToNumber } from "@/lib/utils"
import { categoryMeta } from "@/config/navigation"
import type { Category } from "@prisma/client"

export async function indexAllGuitars() {
  console.log("[index] Ensuring Meilisearch index exists...")
  await ensureIndex()

  const PAGE_SIZE = 100
  let offset = 0
  let total = 0

  for (;;) {
    const guitars = await prisma.guitar.findMany({
      where: { isPublished: true },
      skip: offset,
      take: PAGE_SIZE,
      include: {
        brand: { select: { name: true, slug: true } },
        images: { where: { isPrimary: true }, take: 1 },
        prices: { orderBy: { price: "asc" }, take: 1 },
      },
    })

    if (guitars.length === 0) break

    const docs: GuitarDocument[] = guitars.map((g) => ({
      id: g.id,
      slug: g.slug,
      name: g.name,
      brand: g.brand.name,
      brandSlug: g.brand.slug,
      series: g.series,
      model: g.model,
      category: g.category,
      categorySlug: categoryMeta(g.category as Category).slug,
      subtype: g.subtype,
      bodyShape: g.bodyShape,
      topWood: g.topWood,
      backWood: g.backWood,
      neckWood: g.neckWood,
      fingerboard: g.fingerboard,
      pickupConfig: g.pickupConfig,
      finish: g.finish,
      color: g.color,
      madeIn: g.madeIn,
      year: g.year,
      frets: g.frets,
      strings: g.strings,
      scaleLengthIn: decimalToNumber(g.scaleLengthIn),
      weightKg: decimalToNumber(g.weightKg),
      price: decimalToNumber(g.prices[0]?.price ?? null),
      msrp: decimalToNumber(g.msrp),
      expertScore: decimalToNumber(g.expertScore),
      userScore: decimalToNumber(g.userScore),
      valueScore: decimalToNumber(g.valueScore),
      popularity: g.popularityRank ?? 9999,
      availability: g.availability,
      handedness: g.handedness,
      cutaway: g.cutaway,
      electroAcoustic: g.electroAcoustic,
      image: g.images[0]?.url ?? null,
      summary: g.summary,
    }))

    await indexDocuments(docs)
    total += docs.length
    offset += PAGE_SIZE
    console.log(`[index] Indexed ${total} guitars...`)
  }

  console.log(`[index] Done. Total indexed: ${total}`)
}
