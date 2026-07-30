import { prisma } from "@/lib/prisma"
import type { Prisma, Category, Availability, Handedness } from "@prisma/client"
import type { GuitarQuery } from "@/domain/guitar/types"
import { SORT_OPTIONS } from "@/domain/guitar/types"

const GUITAR_INCLUDE = {
  brand: { select: { name: true, slug: true } },
  images: { where: { isPrimary: true }, take: 1 },
  prices: { orderBy: { price: "asc" as const }, take: 1 },
} satisfies Prisma.GuitarInclude

export type GuitarListItem = Prisma.GuitarGetPayload<{ include: typeof GUITAR_INCLUDE }>

export function buildWhere(q: GuitarQuery): Prisma.GuitarWhereInput {
  const where: Prisma.GuitarWhereInput = { isPublished: true }

  if (q.category) where.category = q.category.toUpperCase() as Category
  if (q.brandSlug) where.brand = { slug: q.brandSlug }
  if (q.handedness) where.handedness = q.handedness.toUpperCase() as Handedness

  if (q.availability?.length) {
    where.availability = { in: q.availability.map((a) => a.toUpperCase() as Availability) }
  }
  if (q.frets?.length) where.frets = { in: q.frets }
  if (q.strings?.length) where.strings = { in: q.strings }
  if (q.years?.length) where.year = { in: q.years }
  if (q.brands?.length) where.brand = { slug: { in: q.brands } }

  if (q.minPrice || q.maxPrice) {
    where.msrp = {
      ...(q.minPrice ? { gte: q.minPrice } : {}),
      ...(q.maxPrice ? { lte: q.maxPrice } : {}),
    }
  }

  if (q.q?.trim()) {
    where.OR = [
      { name: { contains: q.q, mode: "insensitive" } },
      { brand: { name: { contains: q.q, mode: "insensitive" } } },
      { model: { contains: q.q, mode: "insensitive" } },
      { series: { contains: q.q, mode: "insensitive" } },
    ]
  }

  return where
}

function buildOrderBy(sort?: string): Prisma.GuitarOrderByWithRelationInput[] {
  const option = SORT_OPTIONS.find((s) => s.value === sort) ?? SORT_OPTIONS[0]
  return Object.entries(option.orderBy).map(([k, v]) => ({ [k]: v })) as Prisma.GuitarOrderByWithRelationInput[]
}

/** Maps a friendly "top by" key onto a concrete Prisma ordering. */
const TOP_BY_ORDER: Record<string, Prisma.GuitarOrderByWithRelationInput> = {
  popularity: { popularityRank: "asc" },
  expert: { expertScore: "desc" },
  rating: { userScore: "desc" },
  value: { valueScore: "desc" },
  newest: { year: "desc" },
}

export const guitarRepository = {
  async list(query: GuitarQuery) {
    const { page = 1, perPage = 24 } = query
    const where = buildWhere(query)
    const orderBy = buildOrderBy(query.sort)

    const [items, total] = await Promise.all([
      prisma.guitar.findMany({
        where,
        orderBy,
        take: perPage,
        skip: (page - 1) * perPage,
        include: GUITAR_INCLUDE,
      }),
      prisma.guitar.count({ where }),
    ])

    const totalPages = Math.ceil(total / perPage)
    return { items, total, page, perPage, totalPages, hasMore: page < totalPages }
  },

  async findBySlug(slug: string) {
    return prisma.guitar.findUnique({
      where: { slug },
      include: {
        brand: true,
        images: { orderBy: { order: "asc" } },
        prices: {
          orderBy: { price: "asc" },
          include: { source: { select: { name: true, baseUrl: true } } },
        },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 10,
          include: { user: { select: { name: true, image: true } } },
        },
        rankEntries: {
          include: { ranking: { select: { name: true, slug: true } } },
          orderBy: { position: "asc" },
        },
      },
    })
  },

  /** Alias of `findBySlug`, used by the comparison service. */
  async detail(slug: string) {
    return guitarRepository.findBySlug(slug)
  },

  /** Returns the highest-ranked guitars for a given ordering key. */
  async topBy(key: string, take = 8) {
    return prisma.guitar.findMany({
      where: { isPublished: true },
      orderBy: TOP_BY_ORDER[key] ?? TOP_BY_ORDER.popularity,
      take,
      include: GUITAR_INCLUDE,
    })
  },

  async findRelated(guitar: { brandId: string; category: Category; id: string }, limit = 4) {
    return prisma.guitar.findMany({
      where: {
        isPublished: true,
        OR: [{ brandId: guitar.brandId }, { category: guitar.category }],
        NOT: { id: guitar.id },
      },
      orderBy: { expertScore: "desc" },
      take: limit,
      include: GUITAR_INCLUDE,
    })
  },

  async findBySlugMany(slugs: string[]) {
    return prisma.guitar.findMany({
      where: { slug: { in: slugs }, isPublished: true },
      include: {
        brand: true,
        images: { where: { isPrimary: true }, take: 1 },
        prices: { orderBy: { price: "asc" }, take: 1 },
      },
    })
  },

  async create(data: Prisma.GuitarCreateInput) {
    return prisma.guitar.create({ data, include: GUITAR_INCLUDE })
  },

  async update(slug: string, data: Prisma.GuitarUpdateInput) {
    return prisma.guitar.update({ where: { slug }, data, include: GUITAR_INCLUDE })
  },

  async delete(slug: string) {
    return prisma.guitar.delete({ where: { slug } })
  },
}
