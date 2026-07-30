export type SortOption = {
  value: string
  label: string
  orderBy: Record<string, "asc" | "desc">
}

export const SORT_OPTIONS: SortOption[] = [
  { value: "relevance", label: "Relevance", orderBy: { popularityRank: "asc" } },
  { value: "price-asc", label: "Price ↑", orderBy: { msrp: "asc" } },
  { value: "price-desc", label: "Price ↓", orderBy: { msrp: "desc" } },
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
