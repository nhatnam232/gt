export const siteConfig = {
  name: "GuitarTribe",
  tagline: "Compare guitars, spec by spec",
  description:
    "Independent guitar comparison engine. Compare every acoustic, electric, bass, classical guitar and more — spec by spec.",
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://guitartribe.io",
  locale: "en_US",
  twitter: "@guitartribe",
  REVALIDATE: {
    home: 900,
    listing: 600,
    detail: 1800,
    ranking: 3600,
    article: 1800,
    brand: 21600,
  } as const,
}

export const MAX_COMPARE = 5
export const PAGE_SIZE = 24
export const COMPARE_COOKIE = "gt_compare"
