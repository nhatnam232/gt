import { prisma } from "@/lib/prisma"
import type { Prisma } from "@prisma/client"

export type BrandListItem = {
  slug: string
  name: string
  logoUrl: string | null
  countryCode: string | null
  foundedYear: number | null
  priceTier: string | null
  isFeatured: boolean
  _count: { guitars: number }
}

export const brandRepository = {
  async list(opts?: { featured?: boolean }) {
    return prisma.brand.findMany({
      where: opts?.featured ? { isFeatured: true } : undefined,
      orderBy: { name: "asc" },
      include: { _count: { select: { guitars: { where: { isPublished: true } } } } },
    })
  },

  async findBySlug(slug: string) {
    return prisma.brand.findUnique({
      where: { slug },
      include: {
        _count: { select: { guitars: { where: { isPublished: true } } } },
        guitars: {
          where: { isPublished: true },
          orderBy: { expertScore: "desc" },
          take: 12,
          include: {
            brand: { select: { name: true, slug: true } },
            images: { where: { isPrimary: true }, take: 1 },
            prices: { orderBy: { price: "asc" }, take: 1 },
          },
        },
      },
    })
  },

  async create(data: Prisma.BrandCreateInput) {
    return prisma.brand.create({ data })
  },

  async update(slug: string, data: Prisma.BrandUpdateInput) {
    return prisma.brand.update({ where: { slug }, data })
  },
}
