import { prisma } from "@/lib/prisma"
import { decimalToNumber } from "@/lib/utils"
import { categoryMeta } from "@/config/navigation"
import type { GuitarCardDto } from "@/domain/guitar/types"

export type RankingEntryDto = {
  position: number
  score: number
  note: string | null
  guitar: GuitarCardDto
}

export type RankingDto = {
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  updatedAt: string
  entries: RankingEntryDto[]
}

export const rankingRepository = {
  async bySlug(slug: string, take = 30): Promise<RankingDto | null> {
    const row = await prisma.ranking.findUnique({
      where: { slug },
      include: {
        entries: {
          orderBy: { position: "asc" },
          take,
          include: {
            guitar: {
              include: {
                brand: { select: { slug: true, name: true } },
                series: { select: { name: true } },
                images: { orderBy: { position: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    })
    if (!row) return null

    return {
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      description: row.description,
      updatedAt: row.updatedAt.toISOString(),
      entries: row.entries.map((entry) => {
        const g = entry.guitar
        const image = g.images[0]
        return {
          position: entry.position,
          score: decimalToNumber(entry.score) ?? 0,
          note: entry.note,
          guitar: {
            id: g.id,
            slug: g.slug,
            name: g.name,
            brand: g.brand,
            series: g.series?.name ?? null,
            category: g.category,
            categorySlug: categoryMeta(g.category).slug,
            bodyShape: g.bodyShape,
            topWood: g.topWood,
            pickupConfig: g.pickupConfig,
            scaleLengthIn: decimalToNumber(g.scaleLengthIn),
            frets: g.frets,
            strings: g.strings,
            madeIn: g.madeIn,
            year: g.year,
            price: decimalToNumber(g.currentBest),
            msrp: decimalToNumber(g.msrp),
            currency: g.currency,
            expertScore: decimalToNumber(g.expertScore),
            userScore: decimalToNumber(g.userScore),
            userScoreCount: g.userScoreCount,
            valueScore: decimalToNumber(g.valueScore),
            availability: g.availability,
            image: image
              ? {
                  url: image.url,
                  alt: image.alt ?? g.name,
                  width: image.width,
                  height: image.height,
                  blurData: image.blurData,
                }
              : null,
          },
        }
      }),
    }
  },

  async index(): Promise<
    { slug: string; title: string; subtitle: string | null; count: number; updatedAt: string }[]
  > {
    const rows = await prisma.ranking.findMany({
      orderBy: { title: "asc" },
      select: {
        slug: true,
        title: true,
        subtitle: true,
        updatedAt: true,
        _count: { select: { entries: true } },
      },
    })
    return rows.map((row) => ({
      slug: row.slug,
      title: row.title,
      subtitle: row.subtitle,
      count: row._count.entries,
      updatedAt: row.updatedAt.toISOString(),
    }))
  },
}
