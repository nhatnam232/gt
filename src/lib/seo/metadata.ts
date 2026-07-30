import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export type SeoInput = {
  title: string
  description?: string
  path?: string
  type?: "website" | "article" | "product"
  images?: string[]
  noIndex?: boolean
}

export function buildMetadata(input: SeoInput): Metadata {
  const url = input.path ? `${siteConfig.url}${input.path}` : siteConfig.url
  const images = input.images?.length
    ? input.images.map((src) => ({ url: src }))
    : [{ url: `${siteConfig.url}/api/og?title=${encodeURIComponent(input.title)}` }]

  return {
    title: input.title,
    description: input.description,
    metadataBase: new URL(siteConfig.url),
    alternates: { canonical: url },
    openGraph: {
      title: input.title,
      description: input.description,
      url,
      siteName: siteConfig.name,
      images,
      type: input.type === "article" ? "article" : input.type === "product" ? "website" : "website",
      locale: siteConfig.locale,
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description: input.description,
      site: siteConfig.twitter,
      images,
    },
    robots: input.noIndex
      ? { index: false, follow: false }
      : { index: true, follow: true, googleBot: { index: true, follow: true } },
  }
}

export function pageTitle(title: string): string {
  return `${title} | ${siteConfig.name}`
}
