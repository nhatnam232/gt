import type { Metadata } from "next"
import { siteConfig } from "@/config/site"
import { truncate } from "@/lib/utils"

export type SeoInput = {
  title: string
  description: string
  path: string
  images?: { url: string; width?: number; height?: number; alt?: string }[]
  type?: "website" | "article" | "product"
  publishedTime?: string
  modifiedTime?: string
  authors?: string[]
  noIndex?: boolean
  keywords?: string[]
}

const ogFallback = (title: string, subtitle?: string) =>
  `/api/og?title=${encodeURIComponent(title)}${subtitle ? `&subtitle=${encodeURIComponent(subtitle)}` : ""}`

/**
 * Single builder used by every route's generateMetadata, so canonical URLs,
 * OpenGraph and Twitter cards can never drift between pages.
 */
export function buildMetadata(input: SeoInput): Metadata {
  const canonical = new URL(input.path, siteConfig.url).toString()
  const description = truncate(input.description.replace(/\s+/g, " ").trim(), 300)
  const images =
    input.images && input.images.length > 0
      ? input.images
      : [{ url: ogFallback(input.title), width: 1200, height: 630, alt: input.title }]

  return {
    title: input.title,
    description,
    keywords: [...(input.keywords ?? []), ...siteConfig.keywords],
    alternates: { canonical },
    robots: input.noIndex
      ? { index: false, follow: false }
      : {
          index: true,
          follow: true,
          googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
        },
    openGraph: {
      type: input.type === "product" ? "website" : (input.type ?? "website"),
      url: canonical,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      title: input.title,
      description,
      images,
      ...(input.publishedTime ? { publishedTime: input.publishedTime } : {}),
      ...(input.modifiedTime ? { modifiedTime: input.modifiedTime } : {}),
    },
    twitter: {
      card: "summary_large_image",
      site: siteConfig.twitter,
      creator: siteConfig.twitter,
      title: input.title,
      description,
      images: images.map((i) => i.url),
    },
    ...(input.authors ? { authors: input.authors.map((name) => ({ name })) } : {}),
  }
}

export function pageTitle(...parts: string[]): string {
  return parts.filter(Boolean).join(" - ")
}
