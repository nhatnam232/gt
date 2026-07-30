import type { Category } from "@prisma/client"

export type RankingSeed = {
  slug: string
  name: string
  description: string
  category?: string
}

export const RANKING_SEED: RankingSeed[] = [
  {
    slug: "best-acoustic-guitars",
    name: "Best Acoustic Guitars",
    description: "The top-rated acoustic guitars across all price points, ranked by expert score and owner ratings.",
    category: "ACOUSTIC",
  },
  {
    slug: "best-electric-guitars",
    name: "Best Electric Guitars",
    description: "The highest-rated electric guitars for every style and budget.",
    category: "ELECTRIC",
  },
  {
    slug: "best-bass-guitars",
    name: "Best Bass Guitars",
    description: "Top-rated bass guitars from beginner to professional.",
    category: "BASS",
  },
  {
    slug: "best-classical-guitars",
    name: "Best Classical Guitars",
    description: "The finest nylon-string classical and flamenco guitars.",
    category: "CLASSICAL",
  },
  {
    slug: "best-guitars-under-500",
    name: "Best Guitars Under $500",
    description: "Outstanding instruments that won't break the bank.",
  },
  {
    slug: "best-guitars-for-beginners",
    name: "Best Guitars for Beginners",
    description: "The easiest guitars to learn on with great value.",
  },
  {
    slug: "best-value-guitars",
    name: "Best Value Guitars",
    description: "Maximum quality for the price \u2014 our value-score ranking.",
  },
  {
    slug: "best-acoustic-electric-guitars",
    name: "Best Acoustic-Electric Guitars",
    description: "Acoustic guitars with built-in electronics for live performance.",
    category: "ACOUSTIC",
  },
  {
    slug: "best-ukuleles",
    name: "Best Ukuleles",
    description: "Top-rated ukuleles for all ages and skill levels.",
    category: "UKULELE",
  },
]

/**
 * Weighting used to compute the composite score for each named ranking.
 * All four weights in a definition always sum to 1.
 */
export type RankingWeights = {
  expert: number
  user: number
  value: number
  popularity: number
}

/** Hard eligibility filters applied before scoring. */
export type RankingConstraints = {
  minExpertScore?: number
  minUserReviews?: number
  minPrice?: number
  maxPrice?: number
}

export type RankingDefinition = {
  /** Stable identifier, also used as the public URL slug. */
  key: string
  slug: string
  title: string
  subtitle?: string
  description: string
  category?: Category
  constraints?: RankingConstraints
  weights: RankingWeights
}

export const RANKING_DEFINITIONS: RankingDefinition[] = [
  {
    key: "best-acoustic-guitars",
    slug: "best-acoustic-guitars",
    title: "Best Acoustic Guitars",
    subtitle: "Ranked by expert score, owner ratings and value",
    description: "The top-rated acoustic guitars across all price points.",
    category: "ACOUSTIC",
    weights: { expert: 0.45, user: 0.3, value: 0.15, popularity: 0.1 },
  },
  {
    key: "best-electric-guitars",
    slug: "best-electric-guitars",
    title: "Best Electric Guitars",
    subtitle: "Ranked by expert score, owner ratings and value",
    description: "The highest-rated electric guitars for every style and budget.",
    category: "ELECTRIC",
    weights: { expert: 0.45, user: 0.3, value: 0.15, popularity: 0.1 },
  },
  {
    key: "best-bass-guitars",
    slug: "best-bass-guitars",
    title: "Best Bass Guitars",
    subtitle: "From first bass to studio workhorse",
    description: "Top-rated bass guitars from beginner to professional.",
    category: "BASS",
    weights: { expert: 0.45, user: 0.3, value: 0.15, popularity: 0.1 },
  },
  {
    key: "best-classical-guitars",
    slug: "best-classical-guitars",
    title: "Best Classical Guitars",
    subtitle: "Nylon-string classical and flamenco instruments",
    description: "The finest nylon-string classical and flamenco guitars.",
    category: "CLASSICAL",
    weights: { expert: 0.5, user: 0.25, value: 0.15, popularity: 0.1 },
  },
  {
    key: "best-guitars-under-500",
    slug: "best-guitars-under-500",
    title: "Best Guitars Under $500",
    subtitle: "Serious instruments on a starter budget",
    description: "Outstanding instruments that won't break the bank.",
    constraints: { maxPrice: 500 },
    weights: { expert: 0.3, user: 0.25, value: 0.35, popularity: 0.1 },
  },
  {
    key: "best-guitars-for-beginners",
    slug: "best-guitars-for-beginners",
    title: "Best Guitars for Beginners",
    subtitle: "Easy to play, easy to love",
    description: "The easiest guitars to learn on with great value.",
    constraints: { maxPrice: 800 },
    weights: { expert: 0.25, user: 0.35, value: 0.3, popularity: 0.1 },
  },
  {
    key: "best-value-guitars",
    slug: "best-value-guitars",
    title: "Best Value Guitars",
    subtitle: "Maximum instrument per dollar",
    description: "Maximum quality for the price \u2014 our value-score ranking.",
    weights: { expert: 0.2, user: 0.2, value: 0.5, popularity: 0.1 },
  },
  {
    key: "best-acoustic-electric-guitars",
    slug: "best-acoustic-electric-guitars",
    title: "Best Acoustic-Electric Guitars",
    subtitle: "Stage-ready acoustics with onboard electronics",
    description: "Acoustic guitars with built-in electronics for live performance.",
    category: "ACOUSTIC",
    weights: { expert: 0.45, user: 0.3, value: 0.15, popularity: 0.1 },
  },
  {
    key: "best-ukuleles",
    slug: "best-ukuleles",
    title: "Best Ukuleles",
    subtitle: "Soprano to baritone, ranked",
    description: "Top-rated ukuleles for all ages and skill levels.",
    category: "UKULELE",
    weights: { expert: 0.4, user: 0.3, value: 0.2, popularity: 0.1 },
  },
]

export function rankingDefinitionBySlug(slug: string): RankingDefinition | undefined {
  return RANKING_DEFINITIONS.find((d) => d.slug === slug)
}
