import { siteConfig } from "@/config/site"

type Json = Record<string, unknown>

export type BreadcrumbSegment = { name: string; path: string }

const abs = (path: string) => new URL(path, siteConfig.url).toString()

export function organizationSchema(): Json {
  return {
    "@type": "Organization",
    "@id": `${siteConfig.url}#organization`,
    name: siteConfig.name,
    url: siteConfig.url,
    description: siteConfig.description,
    logo: { "@type": "ImageObject", url: abs("/logo.png"), width: 512, height: 512 },
  }
}

export function websiteSchema(): Json {
  return {
    "@type": "WebSite",
    "@id": `${siteConfig.url}#website`,
    url: siteConfig.url,
    name: siteConfig.name,
    description: siteConfig.description,
    publisher: { "@id": `${siteConfig.url}#organization` },
    potentialAction: {
      "@type": "SearchAction",
      target: { "@type": "EntryPoint", urlTemplate: `${siteConfig.url}/search?q={search_term_string}` },
      "query-input": "required name=search_term_string",
    },
  }
}

export function breadcrumbSchema(segments: BreadcrumbSegment[]): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: segments.map((segment, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: segment.name,
      item: abs(segment.path),
    })),
  }
}

export type ProductSchemaInput = {
  name: string
  slug: string
  description: string
  brand: string
  sku?: string | null
  mpn?: string | null
  gtin?: string | null
  category: string
  images: string[]
  currency: string
  offers: { price: number; currency: string; url: string; seller: string; availability: string }[]
  expertScore?: number | null
  userScore?: number | null
  userScoreCount?: number
  reviews?: { author: string; rating: number; title?: string | null; body: string; date: string }[]
}

const AVAILABILITY_MAP: Record<string, string> = {
  IN_STOCK: "https://schema.org/InStock",
  OUT_OF_STOCK: "https://schema.org/OutOfStock",
  PREORDER: "https://schema.org/PreOrder",
  BACKORDER: "https://schema.org/BackOrder",
  DISCONTINUED: "https://schema.org/Discontinued",
  UNKNOWN: "https://schema.org/InStock",
}

export function productSchema(input: ProductSchemaInput): Json {
  const prices = input.offers.map((o) => o.price).filter((p) => Number.isFinite(p) && p > 0)
  const schema: Json = {
    "@type": "Product",
    "@id": abs(`/guitars/${input.slug}#product`),
    name: input.name,
    description: input.description,
    category: input.category,
    url: abs(`/guitars/${input.slug}`),
    brand: { "@type": "Brand", name: input.brand },
    image: input.images.slice(0, 8),
    ...(input.sku ? { sku: input.sku } : {}),
    ...(input.mpn ? { mpn: input.mpn } : {}),
    ...(input.gtin ? { gtin13: input.gtin } : {}),
  }

  if (prices.length > 1) {
    schema.offers = {
      "@type": "AggregateOffer",
      priceCurrency: input.currency,
      lowPrice: Math.min(...prices),
      highPrice: Math.max(...prices),
      offerCount: input.offers.length,
      offers: input.offers.map((offer) => ({
        "@type": "Offer",
        price: offer.price,
        priceCurrency: offer.currency,
        url: offer.url,
        availability: AVAILABILITY_MAP[offer.availability] ?? AVAILABILITY_MAP.UNKNOWN,
        seller: { "@type": "Organization", name: offer.seller },
      })),
    }
  } else if (input.offers.length === 1) {
    const offer = input.offers[0]!
    schema.offers = {
      "@type": "Offer",
      price: offer.price,
      priceCurrency: offer.currency,
      url: offer.url,
      availability: AVAILABILITY_MAP[offer.availability] ?? AVAILABILITY_MAP.UNKNOWN,
      seller: { "@type": "Organization", name: offer.seller },
    }
  }

  // Only emit ratings that are backed by real data - Google penalises invented
  // aggregate ratings, and we never fabricate review counts.
  if (input.userScore && input.userScoreCount && input.userScoreCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: Number(input.userScore.toFixed(2)),
      bestRating: 5,
      worstRating: 1,
      ratingCount: input.userScoreCount,
    }
  }

  if (input.reviews && input.reviews.length > 0) {
    schema.review = input.reviews.slice(0, 10).map((review) => ({
      "@type": "Review",
      author: { "@type": "Person", name: review.author },
      datePublished: review.date,
      ...(review.title ? { name: review.title } : {}),
      reviewBody: review.body,
      reviewRating: {
        "@type": "Rating",
        ratingValue: review.rating,
        bestRating: 5,
        worstRating: 1,
      },
    }))
  }

  return schema
}

export function faqSchema(items: { question: string; answer: string }[]): Json | null {
  if (items.length === 0) return null
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  }
}

export function articleSchema(input: {
  title: string
  description: string
  path: string
  image?: string | null
  publishedAt: string
  updatedAt: string
  author: string
}): Json {
  return {
    "@type": "Article",
    headline: input.title,
    description: input.description,
    url: abs(input.path),
    mainEntityOfPage: { "@type": "WebPage", "@id": abs(input.path) },
    datePublished: input.publishedAt,
    dateModified: input.updatedAt,
    author: { "@type": "Person", name: input.author },
    publisher: { "@id": `${siteConfig.url}#organization` },
    ...(input.image ? { image: [input.image] } : {}),
  }
}

export function itemListSchema(input: {
  name: string
  description: string
  path: string
  items: { name: string; path: string; image?: string | null }[]
}): Json {
  return {
    "@type": "ItemList",
    name: input.name,
    description: input.description,
    url: abs(input.path),
    numberOfItems: input.items.length,
    itemListElement: input.items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      url: abs(item.path),
      ...(item.image ? { image: item.image } : {}),
    })),
  }
}

/** Wrap one or more node schemas into a single @graph document. */
export function graph(...nodes: (Json | null | undefined)[]): string {
  return JSON.stringify({
    "@context": "https://schema.org",
    "@graph": nodes.filter(Boolean),
  })
}
