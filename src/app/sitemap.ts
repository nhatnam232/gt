import type { MetadataRoute } from "next"
import { prisma } from "@/lib/prisma"
import { siteConfig } from "@/config/site"
import { CATEGORIES } from "@/config/navigation"

export const revalidate = 3600

const abs = (path: string) => new URL(path, siteConfig.url).toString()

/**
 * Full sitemap generated from the database. Wrapped in try/catch so a build
 * without a reachable database still produces the static routes.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: abs("/"), changeFrequency: "daily", priority: 1 },
    { url: abs("/guitars"), changeFrequency: "daily", priority: 0.9 },
    { url: abs("/brands"), changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/compare"), changeFrequency: "monthly", priority: 0.6 },
    { url: abs("/rankings"), changeFrequency: "weekly", priority: 0.9 },
    { url: abs("/reviews"), changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/guides"), changeFrequency: "weekly", priority: 0.8 },
    { url: abs("/news"), changeFrequency: "daily", priority: 0.7 },
    { url: abs("/deals"), changeFrequency: "daily", priority: 0.7 },
    { url: abs("/how-we-score"), changeFrequency: "yearly", priority: 0.4 },
    { url: abs("/data-sources"), changeFrequency: "monthly", priority: 0.4 },
    ...CATEGORIES.map((category) => ({
      url: abs(`/c/${category.slug}`),
      changeFrequency: "daily" as const,
      priority: 0.85,
    })),
  ]

  try {
    const [guitars, brands, articles, rankings] = await Promise.all([
      prisma.guitar.findMany({
        where: { isPublished: true },
        select: { slug: true, updatedAt: true },
        orderBy: { popularity: "desc" },
        take: 40000,
      }),
      prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
      prisma.article.findMany({
        where: { state: "PUBLISHED" },
        select: { slug: true, type: true, updatedAt: true },
      }),
      prisma.ranking.findMany({ select: { slug: true, updatedAt: true } }),
    ])

    const typePath: Record<string, string> = {
      REVIEW: "reviews",
      GUIDE: "guides",
      NEWS: "news",
      DEAL: "deals",
    }

    return [
      ...staticRoutes,
      ...guitars.map((guitar) => ({
        url: abs(`/guitars/${guitar.slug}`),
        lastModified: guitar.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
      ...brands.map((brand) => ({
        url: abs(`/brands/${brand.slug}`),
        lastModified: brand.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
      ...articles.map((article) => ({
        url: abs(`/${typePath[article.type] ?? "reviews"}/${article.slug}`),
        lastModified: article.updatedAt,
        changeFrequency: "monthly" as const,
        priority: 0.7,
      })),
      ...rankings.map((ranking) => ({
        url: abs(`/rankings/${ranking.slug}`),
        lastModified: ranking.updatedAt,
        changeFrequency: "weekly" as const,
        priority: 0.85,
      })),
    ]
  } catch {
    return staticRoutes
  }
}
