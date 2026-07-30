export type SourceSeed = {
  slug: string
  name: string
  kind: "OFFICIAL_BRAND" | "RETAILER" | "AGGREGATOR" | "EXPERT_REVIEW" | "USER_COMMUNITY" | "WIKIDATA"
  baseUrl: string
  trustWeight: number
  rateLimitMs?: number
  enabled?: boolean
}

export const SOURCE_SEED: SourceSeed[] = [
  {
    slug: "wikidata",
    name: "Wikidata",
    kind: "WIKIDATA",
    baseUrl: "https://www.wikidata.org",
    trustWeight: 0.6,
    rateLimitMs: 1000,
  },
  {
    slug: "sweetwater",
    name: "Sweetwater",
    kind: "RETAILER",
    baseUrl: "https://www.sweetwater.com",
    trustWeight: 0.9,
    rateLimitMs: 2000,
  },
  {
    slug: "thomann",
    name: "Thomann",
    kind: "RETAILER",
    baseUrl: "https://www.thomann.de",
    trustWeight: 0.9,
    rateLimitMs: 2000,
  },
  {
    slug: "musicians-friend",
    name: "Musician's Friend",
    kind: "RETAILER",
    baseUrl: "https://www.musiciansfriend.com",
    trustWeight: 0.85,
    rateLimitMs: 2000,
  },
  {
    slug: "guitar-world",
    name: "Guitar World",
    kind: "EXPERT_REVIEW",
    baseUrl: "https://www.guitarworld.com",
    trustWeight: 0.85,
    rateLimitMs: 3000,
  },
  {
    slug: "guitar-player",
    name: "Guitar Player",
    kind: "EXPERT_REVIEW",
    baseUrl: "https://www.guitarplayer.com",
    trustWeight: 0.8,
    rateLimitMs: 3000,
  },
  {
    slug: "ultimate-guitar",
    name: "Ultimate Guitar",
    kind: "USER_COMMUNITY",
    baseUrl: "https://www.ultimate-guitar.com",
    trustWeight: 0.5,
    rateLimitMs: 2000,
  },
  {
    slug: "gear-rank",
    name: "Gearank",
    kind: "AGGREGATOR",
    baseUrl: "https://www.gearank.com",
    trustWeight: 0.7,
    rateLimitMs: 2000,
  },
]
