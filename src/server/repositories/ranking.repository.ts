import { prisma } from "@/lib/prisma"

export const rankingRepository = {
  async list() {
    return prisma.ranking.findMany({
      orderBy: { name: "asc" },
      include: { _count: { select: { entries: true } } },
    })
  },

  /** Alias of `list`, used by the ranking index page. */
  async index() {
    return rankingRepository.list()
  },

  async findBySlug(slug: string) {
    return prisma.ranking.findUnique({
      where: { slug },
      include: {
        entries: {
          orderBy: { position: "asc" },
          include: {
            guitar: {
              include: {
                brand: { select: { name: true, slug: true } },
                images: { where: { isPrimary: true }, take: 1 },
                prices: { orderBy: { price: "asc" }, take: 1 },
              },
            },
          },
        },
      },
    })
  },

  /** Alias of `findBySlug`. */
  async bySlug(slug: string) {
    return rankingRepository.findBySlug(slug)
  },
}
