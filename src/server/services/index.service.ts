import { prisma } from "@/lib/prisma"
import { categoryMeta } from "@/config/navigation"
import { decimalToNumber } from "@/lib/utils"
import { ensureIndex, indexDocuments, type GuitarDocument } from "@/lib/search"

const BATCH = 500

/**
 * Full search reindex. Streams the catalog in batches so memory stays flat even
 * with a six-figure catalog. Safe to run repeatedly (documents are upserted by
 * primary key).
 */
export async function reindexSearch(): Promise<number> {
  await ensureIndex()

  let cursor: string | undefined
  let indexed = 0

  for (;;) {
    const rows = await prisma.guitar.findMany({
      where: { isPublished: true },
      take: BATCH,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      orderBy: { id: "asc" },
      include: {
        brand: { select: { slug: true, name: true } },
        series: { select: { name: true } },
        images: { orderBy: { position: "asc" }, take: 1, select: { url: true } },
      },
    })
    if (rows.length === 0) break

    const docs: GuitarDocument[] = rows.map((row) => ({
      id: row.id,
      slug: row.slug,
      name: row.name,
      brand: row.brand.name,
      brandSlug: row.brand.slug,
      series: row.series?.name ?? null,
      model: row.model,
      category: row.category,
      categorySlug: categoryMeta(row.category).slug,
      subtype: row.subtype,
      bodyShape: row.bodyShape,
      topWood: row.topWood,
      backWood: row.backWood,
      neckWood: row.neckWood,
      fingerboard: row.fingerboard,
      pickupConfig: row.pickupConfig,
      finish: row.finish,
      color: row.color,
      madeIn: row.madeIn,
      year: row.year,
      frets: row.frets,
      strings: row.strings,
      scaleLengthIn: decimalToNumber(row.scaleLengthIn),
      weightKg: decimalToNumber(row.weightKg),
      price: decimalToNumber(row.currentBest),
      msrp: decimalToNumber(row.msrp),
      expertScore: decimalToNumber(row.expertScore),
      userScore: decimalToNumber(row.userScore),
      valueScore: decimalToNumber(row.valueScore),
      popularity: row.popularity,
      availability: row.availability,
      handedness: row.handedness,
      cutaway: row.cutaway ?? false,
      electroAcoustic: row.electroAcoustic ?? false,
      image: row.images[0]?.url ?? null,
      summary: row.summary,
    }))

    indexed += await indexDocuments(docs)
    cursor = rows[rows.length - 1]!.id
    if (rows.length < BATCH) break
  }

  return indexed
}
