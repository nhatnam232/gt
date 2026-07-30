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
    description: "Maximum quality for the price — our value-score ranking.",
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
