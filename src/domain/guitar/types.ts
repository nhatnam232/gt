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

export type GuitarQuery = {
  category?: string
  brandSlug?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  q?: string
  page?: number
  perPage?: number
  handedness?: string
  availability?: string
  frets?: number
  strings?: number
}
