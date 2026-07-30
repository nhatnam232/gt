import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export function buildMetadata({
  title,
  description,
  image,
  path = "/",
}: {
  title: string
  description?: string
  image?: string
  path?: string
}): Metadata {
  const desc = description ?? siteConfig.description
  const url = `${siteConfig.url}${path}`

  return {
    title,
    description: desc,
    alternates: { canonical: url },
    openGraph: {
      title,
      description: desc,
      url,
      siteName: siteConfig.name,
      locale: siteConfig.locale,
      type: "website",
      ...(image ? { images: [{ url: image, width: 1200, height: 630 }] } : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: desc,
      creator: siteConfig.twitter,
      ...(image ? { images: [image] } : {}),
    },
  }
}

export function ogImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title })
  if (subtitle) params.set("subtitle", subtitle)
  return `${siteConfig.url}/api/og?${params.toString()}`
}
