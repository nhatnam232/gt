import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import type { GuitarQuery } from "@/domain/guitar/types"
import { buildWhere } from "./guitar.repository"

export type FacetBucket = { value: string; label: string; count: number }

export type FacetSet = {
  brands: FacetBucket[]
  series: FacetBucket[]
  bodyShapes: FacetBucket[]
  topWoods: FacetBucket[]
  backWoods: FacetBucket[]
  neckWoods: FacetBucket[]
  fingerboards: FacetBucket[]
  pickups: FacetBucket[]
  finishes: FacetBucket[]
  colors: FacetBucket[]
  countries: FacetBucket[]
  availability: FacetBucket[]
  frets: FacetBucket[]
  strings: FacetBucket[]
  years: FacetBucket[]
  priceRange: { min: number; max: number }
  weightRange: { min: number; max: number }
  scaleRange: { min: number; max: number }
}

const SCALAR_COLUMNS = {
  bodyShapes: "bodyShape",
  topWoods: "topWood",
  backWoods: "backWood",
  neckWoods: "neckWood",
  fingerboards: "fingerboard",
  pickups: "pickupConfig",
  finishes: "finish",
  colors: "color",
  countries: "madeIn",
} as const

type ScalarFacetKey = keyof typeof SCALAR_COLUMNS

async function groupScalar(
  column: string,
  where: Prisma.GuitarWhereInput,
): Promise<FacetBucket[]> {
  // groupBy is typed per-field, so we drive it dynamically but always with a
  // column name from the closed SCALAR_COLUMNS map (never user input).
  const rows = (await prisma.guitar.groupBy({
    by: [column as "bodyShape"],
    where: { ...where, [column]: { not: null } },
    _count: { _all: true },
    orderBy: { _count: { [column]: "desc" } as never },
    take: 60,
  })) as unknown as Array<Record<string, unknown> & { _count: { _all: number } }>

  return rows
    .map((row) => ({
      value: String(row[column] ?? ""),
      label: String(row[column] ?? ""),
      count: row._count._all,
    }))
    .filter((bucket) => bucket.value !== "")
}

export const facetRepository = {
  /**
   * Facet counts for the current result set. Each facet is computed against the
   * query with its own dimension removed, so selecting one brand does not zero
   * out the other brand counts (standard faceted-search behaviour).
   */
  async forQuery(query: GuitarQuery): Promise<FacetSet> {
    const scalarEntries = Object.entries(SCALAR_COLUMNS) as [ScalarFacetKey, string][]

    const [
      brandRows,
      seriesRows,
      availabilityRows,
      fretRows,
      stringRows,
      yearRows,
      ranges,
      ...scalarResults
    ] = await Promise.all([
      prisma.guitar.groupBy({
        by: ["brandId"],
        where: buildWhere({ ...query, brands: [] }),
        _count: { _all: true },
        orderBy: { _count: { brandId: "desc" } },
        take: 80,
      }),
      prisma.guitar.groupBy({
        by: ["seriesId"],
        where: buildWhere({ ...query, series: [] }),
        _count: { _all: true },
        orderBy: { _count: { seriesId: "desc" } },
        take: 60,
      }),
      prisma.guitar.groupBy({
        by: ["availability"],
        where: buildWhere({ ...query, availability: [] }),
        _count: { _all: true },
      }),
      prisma.guitar.groupBy({
        by: ["frets"],
        where: { ...buildWhere({ ...query, frets: [] }), frets: { not: null } },
        _count: { _all: true },
        orderBy: { frets: "asc" },
      }),
      prisma.guitar.groupBy({
        by: ["strings"],
        where: { ...buildWhere({ ...query, strings: [] }), strings: { not: null } },
        _count: { _all: true },
        orderBy: { strings: "asc" },
      }),
      prisma.guitar.groupBy({
        by: ["year"],
        where: { ...buildWhere({ ...query, years: [] }), year: { not: null } },
        _count: { _all: true },
        orderBy: { year: "desc" },
        take: 30,
      }),
      prisma.guitar.aggregate({
        where: buildWhere({ ...query, minPrice: undefined, maxPrice: undefined }),
        _min: { currentBest: true, weightKg: true, scaleLengthIn: true },
        _max: { currentBest: true, weightKg: true, scaleLengthIn: true },
      }),
      ...scalarEntries.map(([key, column]) =>
        groupScalar(column, buildWhere({ ...query, [key]: [] } as GuitarQuery)),
      ),
    ])

    const brandIds = brandRows.map((r) => r.brandId)
    const seriesIds = seriesRows.map((r) => r.seriesId).filter((id): id is string => Boolean(id))
    const [brands, series] = await Promise.all([
      prisma.brand.findMany({
        where: { id: { in: brandIds } },
        select: { id: true, slug: true, name: true },
      }),
      prisma.series.findMany({
        where: { id: { in: seriesIds } },
        select: { id: true, slug: true, name: true },
      }),
    ])
    const brandById = new Map(brands.map((b) => [b.id, b]))
    const seriesById = new Map(series.map((s) => [s.id, s]))

    const scalars = Object.fromEntries(
      scalarEntries.map(([key], i) => [key, scalarResults[i] ?? []]),
    ) as Record<ScalarFacetKey, FacetBucket[]>

    const number = (value: unknown, fallback: number) => {
      const n = Number(value)
      return Number.isFinite(n) ? n : fallback
    }

    return {
      brands: brandRows
        .map((row) => {
          const brand = brandById.get(row.brandId)
          return brand
            ? { value: brand.slug, label: brand.name, count: row._count._all }
            : null
        })
        .filter((b): b is FacetBucket => Boolean(b))
        .sort((a, b) => b.count - a.count),
      series: seriesRows
        .map((row) => {
          const item = row.seriesId ? seriesById.get(row.seriesId) : undefined
          return item ? { value: item.slug, label: item.name, count: row._count._all } : null
        })
        .filter((s): s is FacetBucket => Boolean(s)),
      ...scalars,
      availability: availabilityRows.map((row) => ({
        value: row.availability,
        label: row.availability.replace(/_/g, " ").toLowerCase(),
        count: row._count._all,
      })),
      frets: fretRows.map((row) => ({
        value: String(row.frets),
        label: `${row.frets} frets`,
        count: row._count._all,
      })),
      strings: stringRows.map((row) => ({
        value: String(row.strings),
        label: `${row.strings} strings`,
        count: row._count._all,
      })),
      years: yearRows.map((row) => ({
        value: String(row.year),
        label: String(row.year),
        count: row._count._all,
      })),
      priceRange: {
        min: Math.floor(number(ranges._min.currentBest, 0)),
        max: Math.ceil(number(ranges._max.currentBest, 10_000)),
      },
      weightRange: {
        min: number(ranges._min.weightKg, 0),
        max: number(ranges._max.weightKg, 8),
      },
      scaleRange: {
        min: number(ranges._min.scaleLengthIn, 20),
        max: number(ranges._max.scaleLengthIn, 35),
      },
    }
  },
}
