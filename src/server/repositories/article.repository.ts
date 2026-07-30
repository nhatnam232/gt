import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export type ArticleCard = {
  slug: string
  type: string
  title: string
  excerpt: string | null
  coverUrl: string | null
  coverAlt: string | null
  authorName: string
  readMinutes: number
  publishedAt: Date | null
  tags: string[]
}

export const articleRepository = {
  async list(type?: string, limit = 20) {
    return prisma.article.findMany({
      where: { isPublished: true, ...(type ? { type } : {}) },
      orderBy: { publishedAt: "desc" },
      take: limit,
      select: {
        slug: true, type: true, title: true, excerpt: true,
        coverUrl: true, coverAlt: true, authorName: true,
        readMinutes: true, publishedAt: true, tags: true,
      },
    })
  },

  async findBySlug(slug: string) {
    return prisma.article.findUnique({ where: { slug } })
  },

  async slugs() {
    const rows = await prisma.article.findMany({
      where: { isPublished: true },
      select: { slug: true, type: true, updatedAt: true },
    })
    return rows.map((r) => ({ slug: r.slug, type: r.type, updatedAt: r.updatedAt }))
  },

  async create(data: Prisma.ArticleCreateInput) {
    return prisma.article.create({ data })
  },

  async update(slug: string, data: Prisma.ArticleUpdateInput) {
    return prisma.article.update({ where: { slug }, data })
  },

  async delete(slug: string) {
    return prisma.article.delete({ where: { slug } })
  },
}
