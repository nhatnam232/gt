import type { ArticleType } from "@prisma/client"
import { prisma } from "@/lib/prisma"

export type ArticleCard = {
  slug: string
  type: ArticleType
  title: string
  excerpt: string | null
  coverUrl: string | null
  author: string
  readingMinutes: number | null
  publishedAt: string | null
  tags: string[]
}

export type ArticleDetail = ArticleCard & {
  body: string
  sourceUrl: string | null
  updatedAt: string
  guitars: { slug: string; name: string; brand: string }[]
}

const cardSelect = {
  slug: true,
  type: true,
  title: true,
  excerpt: true,
  coverUrl: true,
  authorName: true,
  readingMinutes: true,
  publishedAt: true,
  tags: true,
}

export const articleRepository = {
  async listByType(type: ArticleType, take = 24, skip = 0) {
    const where = { type, state: "PUBLISHED" as const }
    const [rows, total] = await Promise.all([
      prisma.article.findMany({
        where,
        select: cardSelect,
        orderBy: { publishedAt: "desc" },
        take,
        skip,
      }),
      prisma.article.count({ where }),
    ])
    return {
      items: rows.map((row) => ({
        slug: row.slug,
        type: row.type,
        title: row.title,
        excerpt: row.excerpt,
        coverUrl: row.coverUrl,
        author: row.authorName ?? "Editorial team",
        readingMinutes: row.readingMinutes,
        publishedAt: row.publishedAt?.toISOString() ?? null,
        tags: row.tags,
      })) satisfies ArticleCard[],
      total,
    }
  },

  async latest(types: ArticleType[], take = 6): Promise<ArticleCard[]> {
    const rows = await prisma.article.findMany({
      where: { type: { in: types }, state: "PUBLISHED" },
      select: cardSelect,
      orderBy: { publishedAt: "desc" },
      take,
    })
    return rows.map((row) => ({
      slug: row.slug,
      type: row.type,
      title: row.title,
      excerpt: row.excerpt,
      coverUrl: row.coverUrl,
      author: row.authorName ?? "Editorial team",
      readingMinutes: row.readingMinutes,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      tags: row.tags,
    }))
  },

  async detail(slug: string): Promise<ArticleDetail | null> {
    const row = await prisma.article.findFirst({
      where: { slug, state: "PUBLISHED" },
      include: {
        guitars: {
          include: { guitar: { select: { slug: true, name: true, brand: { select: { name: true } } } } },
        },
      },
    })
    if (!row) return null
    return {
      slug: row.slug,
      type: row.type,
      title: row.title,
      excerpt: row.excerpt,
      coverUrl: row.coverUrl,
      author: row.authorName ?? "Editorial team",
      readingMinutes: row.readingMinutes,
      publishedAt: row.publishedAt?.toISOString() ?? null,
      tags: row.tags,
      body: row.body,
      sourceUrl: row.sourceUrl,
      updatedAt: row.updatedAt.toISOString(),
      guitars: row.guitars.map((link) => ({
        slug: link.guitar.slug,
        name: link.guitar.name,
        brand: link.guitar.brand.name,
      })),
    }
  },

  async slugs(): Promise<{ slug: string; type: ArticleType; updatedAt: Date }[]> {
    return prisma.article.findMany({
      where: { state: "PUBLISHED" },
      select: { slug: true, type: true, updatedAt: true },
    })
  },
}
