import { prisma } from "@/lib/prisma"

export type ArticleCard = {
  slug: string
  type: string
  title: string
  excerpt: string | null
  coverUrl: string | null
  coverAlt: string | null
  author: string | null
  readMinutes: number
  publishedAt: string
  tags: string[]
}

export type ArticleDetail = ArticleCard & {
  id: string
  body: string | null
  updatedAt: string
}

export const articleRepository = {
  async listByType(type: string, take = 12, skip = 0): Promise<ArticleCard[]> {
    const rows = await prisma.article.findMany({
      where: { type: type as "REVIEW" | "GUIDE" | "NEWS" | "DEAL", isPublished: true },
      orderBy: { publishedAt: "desc" },
      take,
      skip,
      select: {
        slug: true,
        type: true,
        title: true,
        excerpt: true,
        coverUrl: true,
        coverAlt: true,
        author: true,
        readMinutes: true,
        publishedAt: true,
        tags: true,
      },
    })
    return rows.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() }))
  },

  async latest(
    types: string[] = ["REVIEW", "GUIDE", "NEWS", "DEAL"],
    take = 6,
  ): Promise<ArticleCard[]> {
    const rows = await prisma.article.findMany({
      where: { type: { in: types as ("REVIEW" | "GUIDE" | "NEWS" | "DEAL")[] }, isPublished: true },
      orderBy: { publishedAt: "desc" },
      take,
      select: {
        slug: true,
        type: true,
        title: true,
        excerpt: true,
        coverUrl: true,
        coverAlt: true,
        author: true,
        readMinutes: true,
        publishedAt: true,
        tags: true,
      },
    })
    return rows.map((r) => ({ ...r, publishedAt: r.publishedAt.toISOString() }))
  },

  async detail(slug: string): Promise<ArticleDetail | null> {
    const row = await prisma.article.findUnique({
      where: { slug },
    })
    if (!row) return null
    return {
      id: row.id,
      slug: row.slug,
      type: row.type,
      title: row.title,
      excerpt: row.excerpt,
      coverUrl: row.coverUrl,
      coverAlt: row.coverAlt,
      author: row.author,
      readMinutes: row.readMinutes,
      publishedAt: row.publishedAt.toISOString(),
      tags: row.tags,
      body: row.body,
      updatedAt: row.updatedAt.toISOString(),
    }
  },

  async slugs(): Promise<{ slug: string; type: string; updatedAt: Date }[]> {
    return prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, type: true, updatedAt: true },
    })
  },
}
