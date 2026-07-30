import type { Availability, Category } from "@prisma/client"
import { CATEGORIES } from "@/config/navigation"
import { PAGE_SIZE } from "@/config/site"
import type { GuitarQuery, SortKey } from "./types"
import { SORT_OPTIONS } from "./types"

const AVAILABILITIES: Availability[] = [
  "IN_STOCK",
  "OUT_OF_STOCK",
  "PREORDER",
  "BACKORDER",
  "DISCONTINUED",
  "UNKNOWN",
]

type Params = Record<string, string | string[] | undefined>

const list = (value: string | string[] | undefined): string[] => {
  if (!value) return []
  const raw = Array.isArray(value) ? value : value.split(",")
  return raw.map((v) => v.trim()).filter(Boolean).slice(0, 40)
}

const num = (value: string | string[] | undefined): number | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === undefined || raw === "") return undefined
  const parsed = Number(raw)
  return Number.isFinite(parsed) ? parsed : undefined
}

const bool = (value: string | string[] | undefined): boolean | undefined => {
  const raw = Array.isArray(value) ? value[0] : value
  if (raw === "1" || raw === "true") return true
  if (raw === "0" || raw === "false") return false
  return undefined
}

const numList = (value: string | string[] | undefined): number[] =>
  list(value)
    .map(Number)
    .filter((n) => Number.isFinite(n))

/**
 * Parse untrusted search params into a validated query object. Every downstream
 * repository trusts this shape, so unknown values are dropped here rather than
 * forwarded to the database.
 */
export function parseGuitarQuery(params: Params, defaults?: { category?: Category }): GuitarQuery {
  const categorySlug = Array.isArray(params.category) ? params.category[0] : params.category
  const category =
    defaults?.category ?? CATEGORIES.find((c) => c.slug === categorySlug)?.key ?? undefined

  const sortRaw = Array.isArray(params.sort) ? params.sort[0] : params.sort
  const sort: SortKey = SORT_OPTIONS.some((o) => o.value === sortRaw)
    ? (sortRaw as SortKey)
    : "relevance"

  const q = (Array.isArray(params.q) ? params.q[0] : params.q)?.trim().slice(0, 120) || undefined

  return {
    q,
    category,
    brands: list(params.brand),
    series: list(params.series),
    bodyShapes: list(params.body),
    topWoods: list(params.top),
    backWoods: list(params.back),
    neckWoods: list(params.neck),
    fingerboards: list(params.fingerboard),
    pickups: list(params.pickup),
    finishes: list(params.finish),
    colors: list(params.color),
    countries: list(params.country),
    availability: list(params.availability).filter((a): a is Availability =>
      (AVAILABILITIES as string[]).includes(a),
    ),
    minPrice: num(params.minPrice),
    maxPrice: num(params.maxPrice),
    minRating: num(params.minRating),
    minScore: num(params.minScore),
    minWeight: num(params.minWeight),
    maxWeight: num(params.maxWeight),
    minScale: num(params.minScale),
    maxScale: num(params.maxScale),
    frets: numList(params.frets),
    strings: numList(params.strings),
    years: numList(params.year),
    leftHanded: bool(params.left),
    cutaway: bool(params.cutaway),
    electroAcoustic: bool(params.electro),
    sort,
    page: Math.max(1, Math.trunc(num(params.page) ?? 1)),
    perPage: Math.min(60, Math.max(6, Math.trunc(num(params.perPage) ?? PAGE_SIZE))),
  }
}

/** Serialise a query back into a shareable querystring (omitting defaults). */
export function serializeGuitarQuery(query: Partial<GuitarQuery>): string {
  const sp = new URLSearchParams()
  const push = (key: string, value: string[] | undefined) => {
    if (value && value.length) sp.set(key, value.join(","))
  }
  if (query.q) sp.set("q", query.q)
  push("brand", query.brands)
  push("series", query.series)
  push("body", query.bodyShapes)
  push("top", query.topWoods)
  push("back", query.backWoods)
  push("neck", query.neckWoods)
  push("fingerboard", query.fingerboards)
  push("pickup", query.pickups)
  push("finish", query.finishes)
  push("color", query.colors)
  push("country", query.countries)
  push("availability", query.availability)
  push("frets", query.frets?.map(String))
  push("strings", query.strings?.map(String))
  push("year", query.years?.map(String))
  const scalars: [string, number | boolean | undefined][] = [
    ["minPrice", query.minPrice],
    ["maxPrice", query.maxPrice],
    ["minRating", query.minRating],
    ["minScore", query.minScore],
    ["minWeight", query.minWeight],
    ["maxWeight", query.maxWeight],
    ["minScale", query.minScale],
    ["maxScale", query.maxScale],
    ["left", query.leftHanded],
    ["cutaway", query.cutaway],
    ["electro", query.electroAcoustic],
  ]
  for (const [key, value] of scalars) {
    if (value !== undefined) sp.set(key, typeof value === "boolean" ? (value ? "1" : "0") : String(value))
  }
  if (query.sort && query.sort !== "relevance") sp.set("sort", query.sort)
  if (query.page && query.page > 1) sp.set("page", String(query.page))
  return sp.toString()
}

export function countActiveFilters(query: GuitarQuery): number {
  const arrays = [
    query.brands,
    query.series,
    query.bodyShapes,
    query.topWoods,
    query.backWoods,
    query.neckWoods,
    query.fingerboards,
    query.pickups,
    query.finishes,
    query.colors,
    query.countries,
    query.availability,
    query.frets,
    query.strings,
    query.years,
  ]
  const scalars = [
    query.minPrice,
    query.maxPrice,
    query.minRating,
    query.minScore,
    query.minWeight,
    query.maxWeight,
    query.minScale,
    query.maxScale,
    query.leftHanded,
    query.cutaway,
    query.electroAcoustic,
  ]
  return (
    arrays.reduce((sum, arr) => sum + arr.length, 0) +
    scalars.filter((v) => v !== undefined).length
  )
}
