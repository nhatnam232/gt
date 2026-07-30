import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { guitarRepository } from "@/server/repositories/guitar.repository"
import { brandRepository } from "@/server/repositories/brand.repository"
import { articleRepository } from "@/server/repositories/article.repository"

export const revalidate = 3600

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url

  const [guitarSlugs, brandSlugs, articleSlugs] = await Promise.all([
    guitarRepository.publishedSlugs(),
    brandRepository.slugs(),
    articleRepository.slugs(),
  ])

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: base, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${base}/guitars`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/compare`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/rankings`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/brands`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/reviews`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/guides`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/deals`, lastModified: new Date(), changeFrequency: "daily", priority: 0.6 },
    { url: `${base}/search`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
  ]

  const guitars: MetadataRoute.Sitemap = guitarSlugs.map(({ slug, updatedAt }) => ({
    url: `${base}/guitars/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "weekly",
    priority: 0.8,
  }))

  const brands: MetadataRoute.Sitemap = brandSlugs.map(({ slug, updatedAt }) => ({
    url: `${base}/brands/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "weekly",
    priority: 0.6,
  }))

  const articles: MetadataRoute.Sitemap = articleSlugs.map(({ slug, type, updatedAt }) => ({
    url: `${base}/${type.toLowerCase()}s/${slug}`,
    lastModified: updatedAt,
    changeFrequency: "monthly",
    priority: 0.5,
  }))

  return [...staticRoutes, ...guitars, ...brands, ...articles]
}
