export const siteConfig = {
  name: process.env.NEXT_PUBLIC_SITE_NAME ?? "GuitarTribe",
  tagline: "Compare every guitar, spec by spec",
  description:
    "Independent guitar database and comparison engine. Full specifications, expert scores, price tracking across retailers, and side-by-side comparison for acoustic, electric, bass, classical guitars and ukuleles.",
  url: (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  locale: "en_US",
  twitter: "@guitartribe",
  keywords: [
    "guitar comparison",
    "guitar specs",
    "guitar database",
    "acoustic guitar",
    "electric guitar",
    "bass guitar",
    "classical guitar",
    "guitar reviews",
    "guitar prices",
  ],
} as const

export const PAGE_SIZE = 24
export const MAX_COMPARE = 5

export const REVALIDATE = {
  home: 60 * 15,
  listing: 60 * 10,
  detail: 60 * 30,
  ranking: 60 * 60,
  article: 60 * 30,
  brand: 60 * 60 * 6,
} as const
