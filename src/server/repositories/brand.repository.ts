import { prisma } from "@/lib/prisma"

export type BrandListItem = {
  slug: string
  name: string
  countryCode: string | null
  foundedYear: number | null
  priceTier: string
  logoUrl: string | null
  featured: boolean
  guitarCount: number
}

export type BrandDetail = BrandListItem & {
  id: string
  websiteUrl: string | null
  description: string | null
  series: { slug: string; name: string; guitarCount: number }[]
  updatedAt: string
}

export const brandRepository = {
  async list(): Promise<BrandListItem[]> {
    const rows = await prisma.brand.findMany({
      orderBy: [{ featured: "desc" }, { name: "asc" }],
      select: {
        slug: true,
        name: true,
        countryCode: true,
        foundedYear: true,
        priceTier: true,
        logoUrl: true,
        featured: true,
        _count: { select: { guitars: { where: { isPublished: true } } } },
      },
    })
    return rows.map(({ _count, ...brand }) => ({ ...brand, guitarCount: _count.guitars }))
  },

  async featured(take = 12): Promise<BrandListItem[]> {
    const all = await brandRepository.list()
    return all
      .filter((brand) => brand.featured)
      .sort((a, b) => b.guitarCount - a.guitarCount)
      .slice(0, take)
  },

  async detail(slug: string): Promise<BrandDetail | null> {
    const row = await prisma.brand.findUnique({
      where: { slug },
      include: {
        series: {
          orderBy: { name: "asc" },
          select: {
            slug: true,
            name: true,
            _count: { select: { guitars: { where: { isPublished: true } } } },
          },
        },
        _count: { select: { guitars: { where: { isPublished: true } } } },
      },
    })
    if (!row) return null
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      countryCode: row.countryCode,
      foundedYear: row.foundedYear,
      priceTier: row.priceTier,
      logoUrl: row.logoUrl,
      featured: row.featured,
      websiteUrl: row.websiteUrl,
      description: row.description,
      guitarCount: row._count.guitars,
      series: row.series.map((s) => ({
        slug: s.slug,
        name: s.name,
        guitarCount: s._count.guitars,
      })),
      updatedAt: row.updatedAt.toISOString(),
    }
  },

  async slugs(): Promise<{ slug: string; updatedAt: Date }[]> {
    return prisma.brand.findMany({ select: { slug: true, updatedAt: true } })
  },
}
