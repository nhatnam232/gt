import type { Availability, Category, Handedness } from "@prisma/client"

/** Plain, serialisable shape used by every client component. */
export type GuitarCardDto = {
  id: string
  slug: string
  name: string
  brand: { slug: string; name: string }
  series: string | null
  category: Category
  categorySlug: string
  bodyShape: string | null
  topWood: string | null
  pickupConfig: string | null
  scaleLengthIn: number | null
  frets: number | null
  strings: number | null
  madeIn: string | null
  year: number | null
  price: number | null
  msrp: number | null
  currency: string
  expertScore: number | null
  userScore: number | null
  userScoreCount: number
  valueScore: number | null
  availability: Availability
  image: { url: string; alt: string; width: number | null; height: number | null; blurData: string | null } | null
}

export type PriceOfferDto = {
  id: string
  retailer: { slug: string; name: string; websiteUrl: string }
  price: number
  currency: string
  url: string
  availability: Availability
  condition: string
  shippingNote: string | null
  checkedAt: string
}

export type GuitarDetailDto = GuitarCardDto & {
  model: string | null
  sku: string | null
  mpn: string | null
  gtin: string | null
  subtype: string | null
  backWood: string | null
  sideWood: string | null
  neckWood: string | null
  fingerboard: string | null
  bridge: string | null
  nutMaterial: string | null
  nutWidthIn: number | null
  electronics: string | null
  finish: string | null
  color: string | null
  weightKg: number | null
  handedness: Handedness
  cutaway: boolean | null
  electroAcoustic: boolean | null
  caseIncluded: boolean | null
  accessories: string[]
  warranty: string | null
  specs: Record<string, string | number | boolean | null>
  summary: string | null
  pros: string[]
  cons: string[]
  images: {
    url: string
    alt: string
    width: number | null
    height: number | null
    blurData: string | null
    is360: boolean
  }[]
  videos: { videoId: string; provider: string; title: string | null; channel: string | null }[]
  documents: { url: string; title: string; kind: string }[]
  faqs: { question: string; answer: string }[]
  offers: PriceOfferDto[]
  priceHistory: { date: string; price: number }[]
  reviews: {
    id: string
    author: string
    rating: number
    title: string | null
    body: string
    createdAt: string
  }[]
  sources: { name: string; url: string; fetchedAt: string }[]
  updatedAt: string
}

export type SortKey =
  | "relevance"
  | "price-asc"
  | "price-desc"
  | "score-desc"
  | "rating-desc"
  | "value-desc"
  | "newest"
  | "popular"

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "relevance", label: "Best match" },
  { value: "score-desc", label: "Highest expert score" },
  { value: "rating-desc", label: "Highest owner rating" },
  { value: "value-desc", label: "Best value" },
  { value: "price-asc", label: "Price: low to high" },
  { value: "price-desc", label: "Price: high to low" },
  { value: "newest", label: "Newest" },
  { value: "popular", label: "Most viewed" },
]

/** Normalised, validated query for listing pages. */
export type GuitarQuery = {
  q?: string
  category?: Category
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
  availability: Availability[]
  minPrice?: number
  maxPrice?: number
  minRating?: number
  minScore?: number
  minWeight?: number
  maxWeight?: number
  minScale?: number
  maxScale?: number
  frets: number[]
  strings: number[]
  years: number[]
  leftHanded?: boolean
  cutaway?: boolean
  electroAcoustic?: boolean
  sort: SortKey
  page: number
  perPage: number
}

export type Paginated<T> = {
  items: T[]
  total: number
  page: number
  perPage: number
  totalPages: number
  hasMore: boolean
}
