import { prisma } from "@/lib/prisma"
import { Prisma } from "@prisma/client"

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

/**
 * Read paths run during `next build` (generateStaticParams, static page data)
 * against whatever database DATABASE_URL points at. If that database has not
 * been migrated yet, Prisma throws P2021 ("table does not exist") and the whole
 * build aborts. Treat a missing table as "no articles yet" so the site can be
 * built and deployed before content exists; every other error still propagates.
 */
async function readOrEmpty<T>(read: () => Promise<T[]>): Promise<T[]> {
  try {
    return await read()
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2021") {
      console.warn("[article.repository] articles table is missing; returning no rows")
      return []
    }
    throw error
  }
}

export const articleRepository = {
  async list(type?: string, limit = 20) {
    return readOrEmpty(() =>
      prisma.article.findMany({
        where: { isPublished: true, ...(type ? { type } : {}) },
        orderBy: { publishedAt: "desc" },
        take: limit,
        select: {
          slug: true, type: true, title: true, excerpt: true,
          coverUrl: true, coverAlt: true, authorName: true,
          readMinutes: true, publishedAt: true, tags: true,
        },
      }),
    )
  },

  async findBySlug(slug: string) {
    return prisma.article.findUnique({ where: { slug } })
  },

  async slugs() {
    const rows = await readOrEmpty(() =>
      prisma.article.findMany({
        where: { isPublished: true },
        select: { slug: true, type: true, updatedAt: true },
      }),
    )
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
