import type { Brand, Guitar, GuitarImage, PricePoint, Source, UserReview } from "@prisma/client"

export type SortOption = {
  value: string
  label: string
  orderBy: Record<string, "asc" | "desc">
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "relevance", label: "Relevance", orderBy: { popularityRank: "asc" } },
  { value: "price-asc", label: "Price \u2191", orderBy: { msrp: "asc" } },
  { value: "price-desc", label: "Price \u2193", orderBy: { msrp: "desc" } },
  { value: "score-desc", label: "Expert score", orderBy: { expertScore: "desc" } },
  { value: "rating-desc", label: "User rating", orderBy: { userScore: "desc" } },
  { value: "value-desc", label: "Best value", orderBy: { valueScore: "desc" } },
  { value: "newest", label: "Newest", orderBy: { year: "desc" } },
  { value: "popular", label: "Popular", orderBy: { popularityRank: "asc" } },
]

export type SortKey = SortOption["value"]

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
  /** True when there is at least one more page after the current one. */
  hasMore?: boolean
}

export type GuitarQuery = {
  /** Pagination and sorting. Always populated by parseGuitarQuery. */
  page: number
  perPage: number
  sort?: SortKey
  q?: string

  /** Single-value filters. */
  category?: string
  brandSlug?: string
  handedness?: string
  minPrice?: number
  maxPrice?: number
  minRating?: number
  minScore?: number
  minWeight?: number
  maxWeight?: number
  minScale?: number
  maxScale?: number
  leftHanded?: boolean
  cutaway?: boolean
  electroAcoustic?: boolean

  /**
   * Multi-value facet filters. These are always arrays (possibly empty) so that
   * UI components can consume them without null checks.
   */
  brands: string[]
  series: string[]
  bodyShapes: string[]
  topWoods: string[]
  backWoods: string[]
  neckWoods: string[]
  fingerboards: string[]
  pickups: string[]
  finishes: string[]
  colors: string[]
  countries: string[]
  availability: string[]
  frets: number[]
  strings: number[]
  years: number[]
}

/**
 * Loose shape accepted by callers that only care about a couple of filters.
 * Run it through `normalizeGuitarQuery` to obtain a complete `GuitarQuery`.
 */
export type GuitarQueryInput = Partial<GuitarQuery>

export const EMPTY_GUITAR_QUERY: GuitarQuery = {
  page: 1,
  perPage: 24,
  brands: [],
  series: [],
  bodyShapes: [],
  topWoods: [],
  backWoods: [],
  neckWoods: [],
  fingerboards: [],
  pickups: [],
  finishes: [],
  colors: [],
  countries: [],
  availability: [],
  frets: [],
  strings: [],
  years: [],
}

/** Fill in every required field so partial inputs can be used as a full query. */
export function normalizeGuitarQuery(input: GuitarQueryInput = {}): GuitarQuery {
  return {
    ...EMPTY_GUITAR_QUERY,
    ...input,
    page: input.page ?? EMPTY_GUITAR_QUERY.page,
    perPage: input.perPage ?? EMPTY_GUITAR_QUERY.perPage,
  }
}

/** A single retailer price offer, optionally joined with its source. */
export type PriceOfferDto = PricePoint & {
  source?: Pick<Source, "name" | "baseUrl"> | null
}

/** Minimal guitar payload used by cards, grids and rails. */
export type GuitarCardDto = Guitar & {
  brand: Pick<Brand, "name" | "slug">
  images: GuitarImage[]
  prices: PricePoint[]
}

/** Full guitar payload used by the detail page, spec table and comparisons. */
export type GuitarDetailDto = Guitar & {
  brand: Brand
  images: GuitarImage[]
  prices: PriceOfferDto[]
  reviews?: UserReview[]
}
