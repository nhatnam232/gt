import type { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { categoryMeta } from "@/config/navigation"
import { decimalToNumber } from "@/lib/utils"
import type {
  GuitarCardDto,
  GuitarDetailDto,
  GuitarQuery,
  Paginated,
} from "@/domain/guitar/types"

const cardSelect = {
  id: true,
  slug: true,
  name: true,
  category: true,
  bodyShape: true,
  topWood: true,
  pickupConfig: true,
  scaleLengthIn: true,
  frets: true,
  strings: true,
  madeIn: true,
  year: true,
  msrp: true,
  currentBest: true,
  currency: true,
  expertScore: true,
  userScore: true,
  userScoreCount: true,
  valueScore: true,
  availability: true,
  brand: { select: { slug: true, name: true } },
  series: { select: { name: true } },
  images: {
    where: { isPrimary: true },
    take: 1,
    select: { url: true, alt: true, width: true, height: true },
  },
} satisfies Prisma.GuitarSelect

type CardRow = Prisma.GuitarGetPayload<{ select: typeof cardSelect }>

export function toCardDto(row: CardRow): GuitarCardDto {
  const image = row.images[0]
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    brand: row.brand,
    series: row.series?.name ?? null,
    category: row.category,
    categorySlug: categoryMeta(row.category).slug,
    bodyShape: row.bodyShape,
    topWood: row.topWood,
    pickupConfig: row.pickupConfig,
    scaleLengthIn: decimalToNumber(row.scaleLengthIn),
    frets: row.frets,
    strings: row.strings,
    madeIn: row.madeIn,
    year: row.year,
    price: decimalToNumber(row.currentBest),
    msrp: decimalToNumber(row.msrp),
    currency: row.currency,
    expertScore: decimalToNumber(row.expertScore),
    userScore: decimalToNumber(row.userScore),
    userScoreCount: row.userScoreCount,
    valueScore: decimalToNumber(row.valueScore),
    availability: row.availability,
    image: image
      ? { url: image.url, alt: image.alt ?? row.name, width: image.width, height: image.height }
      : null,
  }
}

/** Translate a validated GuitarQuery into a Prisma where clause. */
export function buildWhere(query: GuitarQuery): Prisma.GuitarWhereInput {
  const and: Prisma.GuitarWhereInput[] = [{ isPublished: true }]

  if (query.category) and.push({ category: query.category })
  if (query.brands.length) and.push({ brand: { slug: { in: query.brands } } })
  if (query.series.length) and.push({ series: { slug: { in: query.series } } })
  if (query.bodyShapes.length) and.push({ bodyShape: { in: query.bodyShapes } })
  if (query.topWoods.length) and.push({ topWood: { in: query.topWoods } })
  if (query.backWoods.length) and.push({ backWood: { in: query.backWoods } })
  if (query.neckWoods.length) and.push({ neckWood: { in: query.neckWoods } })
  if (query.fingerboards.length) and.push({ fingerboard: { in: query.fingerboards } })
  if (query.pickups.length) and.push({ pickupConfig: { in: query.pickups } })
  if (query.finishes.length) and.push({ finish: { in: query.finishes } })
  if (query.colors.length) and.push({ color: { in: query.colors } })
  if (query.countries.length) and.push({ madeIn: { in: query.countries } })
  if (query.availability.length) and.push({ availability: { in: query.availability } })
  if (query.frets.length) and.push({ frets: { in: query.frets } })
  if (query.strings.length) and.push({ strings: { in: query.strings } })
  if (query.years.length) and.push({ year: { in: query.years } })
  if (query.leftHanded) and.push({ handedness: { in: ["LEFT", "BOTH"] } })
  if (query.cutaway !== undefined) and.push({ cutaway: query.cutaway })
  if (query.electroAcoustic !== undefined) and.push({ electroAcoustic: query.electroAcoustic })

  if (query.minPrice !== undefined || query.maxPrice !== undefined) {
    and.push({
      currentBest: {
        ...(query.minPrice !== undefined ? { gte: query.minPrice } : {}),
        ...(query.maxPrice !== undefined ? { lte: query.maxPrice } : {}),
      },
    })
  }
  if (query.minScore !== undefined) and.push({ expertScore: { gte: query.minScore } })
  if (query.minRating !== undefined) and.push({ userScore: { gte: query.minRating } })
  if (query.minWeight !== undefined || query.maxWeight !== undefined) {
    and.push({
      weightKg: {
        ...(query.minWeight !== undefined ? { gte: query.minWeight } : {}),
        ...(query.maxWeight !== undefined ? { lte: query.maxWeight } : {}),
      },
    })
  }
  if (query.minScale !== undefined || query.maxScale !== undefined) {
    and.push({
      scaleLengthIn: {
        ...(query.minScale !== undefined ? { gte: query.minScale } : {}),
        ...(query.maxScale !== undefined ? { lte: query.maxScale } : {}),
      },
    })
  }
  if (query.q) {
    and.push({
      OR: [
        { name: { contains: query.q, mode: "insensitive" } },
        { model: { contains: query.q, mode: "insensitive" } },
        { brand: { name: { contains: query.q, mode: "insensitive" } } },
        { series: { name: { contains: query.q, mode: "insensitive" } } },
      ],
    })
  }

  return { AND: and }
}

function buildOrderBy(query: GuitarQuery): Prisma.GuitarOrderByWithRelationInput[] {
  switch (query.sort) {
    case "price-asc":
      return [{ currentBest: "asc" }, { popularity: "desc" }]
    case "price-desc":
      return [{ currentBest: "desc" }, { popularity: "desc" }]
    case "score-desc":
      return [{ expertScore: "desc" }, { userScore: "desc" }]
    case "rating-desc":
      return [{ userScore: "desc" }, { userScoreCount: "desc" }]
    case "value-desc":
      return [{ valueScore: "desc" }, { expertScore: "desc" }]
    case "newest":
      return [{ publishedAt: "desc" }, { year: "desc" }]
    case "popular":
      return [{ popularity: "desc" }, { expertScore: "desc" }]
    default:
      return [{ popularity: "desc" }, { expertScore: "desc" }, { name: "asc" }]
  }
}

export const guitarRepository = {
  async list(query: GuitarQuery): Promise<Paginated<GuitarCardDto>> {
    const where = buildWhere(query)
    const skip = (query.page - 1) * query.perPage
    const [rows, total] = await Promise.all([
      prisma.guitar.findMany({
        where,
        select: cardSelect,
        orderBy: buildOrderBy(query),
        skip,
        take: query.perPage,
      }),
      prisma.guitar.count({ where }),
    ])
    const totalPages = Math.max(1, Math.ceil(total / query.perPage))
    return {
      items: rows.map(toCardDto),
      total,
      page: query.page,
      perPage: query.perPage,
      totalPages,
      hasMore: query.page < totalPages,
    }
  },

  async bySlugs(slugs: string[]): Promise<GuitarCardDto[]> {
    if (slugs.length === 0) return []
    const rows = await prisma.guitar.findMany({
      where: { slug: { in: slugs }, isPublished: true },
      select: cardSelect,
    })
    const bySlug = new Map(rows.map((row) => [row.slug, toCardDto(row)]))
    return slugs.map((slug) => bySlug.get(slug)).filter((v): v is GuitarCardDto => Boolean(v))
  },

  async topBy(
    field: "expertScore" | "userScore" | "valueScore" | "popularity",
    take: number,
    where?: Prisma.GuitarWhereInput,
  ): Promise<GuitarCardDto[]> {
    const rows = await prisma.guitar.findMany({
      where: { isPublished: true, [field]: { not: null }, ...where },
      select: cardSelect,
      orderBy: [{ [field]: "desc" }, { userScoreCount: "desc" }],
      take,
    })
    return rows.map(toCardDto)
  },

  async detail(slug: string): Promise<GuitarDetailDto | null> {
    const row = await prisma.guitar.findFirst({
      where: { slug, isPublished: true },
      include: {
        brand: { select: { slug: true, name: true } },
        series: { select: { name: true } },
        images: { orderBy: [{ isPrimary: "desc" }, { position: "asc" }] },
        videos: { orderBy: { position: "asc" } },
        documents: true,
        faqs: { orderBy: { position: "asc" } },
        offers: {
          where: { isActive: true },
          orderBy: { price: "asc" },
          include: { retailer: { select: { slug: true, name: true, websiteUrl: true } } },
        },
        priceHistory: { orderBy: { recordedAt: "asc" }, take: 180 },
        reviews: {
          where: { isApproved: true },
          orderBy: { createdAt: "desc" },
          take: 30,
          include: { user: { select: { name: true } } },
        },
        sourceRecords: {
          orderBy: { fetchedAt: "desc" },
          take: 12,
          include: { source: { select: { name: true } } },
        },
      },
    })
    if (!row) return null

    const card = toCardDto({ ...row, images: row.images.slice(0, 1) } as CardRow)

    return {
      ...card,
      model: row.model,
      sku: row.sku,
      mpn: row.mpn,
      gtin: row.gtin,
      subtype: row.subtype,
      backWood: row.backWood,
      sideWood: row.sideWood,
      neckWood: row.neckWood,
      fingerboard: row.fingerboard,
      bridge: row.bridge,
      nutMaterial: row.nutMaterial,
      nutWidthIn: decimalToNumber(row.nutWidthIn),
      electronics: row.electronics,
      finish: row.finish,
      color: row.color,
      weightKg: decimalToNumber(row.weightKg),
      handedness: row.handedness,
      cutaway: row.cutaway,
      electroAcoustic: row.electroAcoustic,
      caseIncluded: row.caseIncluded,
      accessories: row.accessories,
      warranty: row.warranty,
      specs: (row.specs ?? {}) as GuitarDetailDto["specs"],
      summary: row.summary,
      pros: row.pros,
      cons: row.cons,
      images: row.images.map((img) => ({
        url: img.url,
        alt: img.alt ?? row.name,
        width: img.width,
        height: img.height,
        isPrimary: img.isPrimary,
      })),
      videos: row.videos.map((v) => ({ youtubeId: v.youtubeId, title: v.title })),
      documents: row.documents.map((d) => ({ url: d.url, title: d.title, kind: d.kind })),
      faqs: row.faqs.map((f) => ({ question: f.question, answer: f.answer })),
      offers: row.offers.map((offer) => ({
        id: offer.id,
        retailer: offer.retailer,
        price: decimalToNumber(offer.price) ?? 0,
        currency: offer.currency,
        url: offer.url,
        availability: offer.availability,
        shipping: decimalToNumber(offer.shipping),
        checkedAt: offer.checkedAt.toISOString(),
      })),
      priceHistory: row.priceHistory.map((point) => ({
        date: point.recordedAt.toISOString(),
        price: decimalToNumber(point.price) ?? 0,
      })),
      reviews: row.reviews.map((review) => ({
        id: review.id,
        author: review.authorName ?? review.user?.name ?? "Verified owner",
        rating: decimalToNumber(review.rating) ?? 0,
        title: review.title,
        body: review.body,
        createdAt: review.createdAt.toISOString(),
      })),
      sources: row.sourceRecords.map((record) => ({
        name: record.source.name,
        url: record.sourceUrl,
        fetchedAt: record.fetchedAt.toISOString(),
      })),
      updatedAt: row.updatedAt.toISOString(),
    }
  },

  async related(guitar: GuitarCardDto, take = 8): Promise<GuitarCardDto[]> {
    const price = guitar.price ?? guitar.msrp
    const rows = await prisma.guitar.findMany({
      where: {
        isPublished: true,
        slug: { not: guitar.slug },
        category: guitar.category,
        ...(price
          ? { currentBest: { gte: price * 0.55, lte: price * 1.65 } }
          : {}),
      },
      select: cardSelect,
      orderBy: [{ expertScore: "desc" }, { popularity: "desc" }],
      take,
    })
    return rows.map(toCardDto)
  },

  async publishedSlugs(take = 20_000): Promise<{ slug: string; updatedAt: Date }[]> {
    return prisma.guitar.findMany({
      where: { isPublished: true },
      select: { slug: true, updatedAt: true },
      orderBy: { popularity: "desc" },
      take,
    })
  },

  async incrementPopularity(slug: string): Promise<void> {
    await prisma.guitar.updateMany({ where: { slug }, data: { popularity: { increment: 1 } } })
  },
}
