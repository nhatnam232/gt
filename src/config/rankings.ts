import type { Category, RankingKey } from "@prisma/client"

export type RankingDefinition = {
  key: RankingKey
  slug: string
  title: string
  subtitle: string
  description: string
  category?: Category
  /** Weights fed into RankingService. They are normalised at scoring time. */
  weights: { expert: number; user: number; value: number; popularity: number }
  /** Hard constraints applied before scoring. */
  constraints?: {
    maxPrice?: number
    minPrice?: number
    minExpertScore?: number
    minUserReviews?: number
  }
}

export const RANKING_DEFINITIONS: RankingDefinition[] = [
  {
    key: "TOP_ACOUSTIC",
    slug: "top-acoustic-guitars",
    title: "Top Acoustic Guitars",
    subtitle: "Highest rated steel-string acoustics",
    description: "Ranked from expert scores, verified owner ratings and price-to-performance across every acoustic guitar in the database.",
    category: "ACOUSTIC",
    weights: { expert: 0.45, user: 0.3, value: 0.15, popularity: 0.1 },
  },
  {
    key: "TOP_ELECTRIC",
    slug: "top-electric-guitars",
    title: "Top Electric Guitars",
    subtitle: "The best solidbody, semi-hollow and hollowbody electrics",
    description: "A weighted ranking of every electric guitar we track, combining expert scores with owner feedback.",
    category: "ELECTRIC",
    weights: { expert: 0.45, user: 0.3, value: 0.15, popularity: 0.1 },
  },
  {
    key: "TOP_BASS",
    slug: "top-bass-guitars",
    title: "Top Bass Guitars",
    subtitle: "4, 5 and 6 string basses ranked",
    description: "Bass guitars ranked on tone, build quality, electronics and value.",
    category: "BASS",
    weights: { expert: 0.45, user: 0.3, value: 0.15, popularity: 0.1 },
  },
  {
    key: "TOP_CLASSICAL",
    slug: "top-classical-guitars",
    title: "Top Classical Guitars",
    subtitle: "Nylon-string instruments ranked",
    description: "Classical and flamenco guitars ranked on projection, build and value.",
    category: "CLASSICAL",
    weights: { expert: 0.5, user: 0.28, value: 0.14, popularity: 0.08 },
  },
  {
    key: "BEST_BEGINNER",
    slug: "best-beginner-guitars",
    title: "Best Beginner Guitars",
    subtitle: "Playable, forgiving and affordable",
    description: "Instruments that combine low action, forgiving setup and a low entry price.",
    weights: { expert: 0.3, user: 0.35, value: 0.3, popularity: 0.05 },
    constraints: { maxPrice: 600 },
  },
  {
    key: "BEST_INTERMEDIATE",
    slug: "best-intermediate-guitars",
    title: "Best Intermediate Guitars",
    subtitle: "The first serious upgrade",
    description: "Solid-wood tops, better hardware and real tonal character without a boutique price tag.",
    weights: { expert: 0.4, user: 0.3, value: 0.25, popularity: 0.05 },
    constraints: { minPrice: 600, maxPrice: 1800 },
  },
  {
    key: "BEST_PROFESSIONAL",
    slug: "best-professional-guitars",
    title: "Best Professional Guitars",
    subtitle: "Stage and studio workhorses",
    description: "Instruments that hold tuning, survive touring and record without compromise.",
    weights: { expert: 0.55, user: 0.3, value: 0.05, popularity: 0.1 },
    constraints: { minPrice: 1500, minExpertScore: 8 },
  },
  {
    key: "BEST_RECORDING",
    slug: "best-guitars-for-recording",
    title: "Best Guitars for Recording",
    subtitle: "Balanced, controlled, mix-ready",
    description: "Guitars with even response and low overtone clutter that sit in a mix with minimal EQ.",
    weights: { expert: 0.6, user: 0.25, value: 0.05, popularity: 0.1 },
    constraints: { minExpertScore: 7.5 },
  },
  {
    key: "BEST_LIVE",
    slug: "best-guitars-for-live",
    title: "Best Guitars for Live Performance",
    subtitle: "Feedback resistant and roadworthy",
    description: "Onboard electronics, feedback resistance and tuning stability under stage conditions.",
    weights: { expert: 0.5, user: 0.3, value: 0.1, popularity: 0.1 },
  },
  {
    key: "BEST_BUDGET",
    slug: "best-budget-guitars",
    title: "Best Budget Guitars",
    subtitle: "Maximum instrument per dollar",
    description: "The highest scoring instruments available under 400.",
    weights: { expert: 0.3, user: 0.3, value: 0.35, popularity: 0.05 },
    constraints: { maxPrice: 400 },
  },
  {
    key: "BEST_PREMIUM",
    slug: "best-premium-guitars",
    title: "Best Premium Guitars",
    subtitle: "No-compromise builds",
    description: "Boutique and flagship instruments ranked purely on measured quality.",
    weights: { expert: 0.7, user: 0.25, value: 0, popularity: 0.05 },
    constraints: { minPrice: 2500 },
  },
  {
    key: "BEST_VALUE",
    slug: "best-value-guitars",
    title: "Best Value Guitars",
    subtitle: "Score per dollar leaders",
    description: "Ranked strictly by our value index: normalised quality score divided by street price.",
    weights: { expert: 0.2, user: 0.2, value: 0.55, popularity: 0.05 },
  },
]

export const rankingBySlug = (slug: string) => RANKING_DEFINITIONS.find((r) => r.slug === slug)
