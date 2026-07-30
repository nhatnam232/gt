import type { MetadataRoute } from "next"
import { siteConfig } from "@/config/site"
import { prisma } from "@/lib/prisma"
import { CATEGORIES } from "@/config/navigation"

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = siteConfig.url

  const [guitars, brands, rankings, articles] = await Promise.all([
    prisma.guitar.findMany({ where: { isPublished: true }, select: { slug: true, updatedAt: true } }),
    prisma.brand.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.ranking.findMany({ select: { slug: true, updatedAt: true } }),
    prisma.article.findMany({ where: { isPublished: true }, select: { slug: true, type: true, updatedAt: true } }),
  ])

  return [
    { url: base, changeFrequency: "daily", priority: 1 },
    { url: `${base}/guitars`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/brands`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/rankings`, changeFrequency: "daily", priority: 0.9 },
    { url: `${base}/compare`, changeFrequency: "weekly", priority: 0.7 },
    { url: `${base}/guides`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/reviews`, changeFrequency: "weekly", priority: 0.7 },
    ...CATEGORIES.map((cat) => ({ url: `${base}/c/${cat.slug}`, changeFrequency: "daily" as const, priority: 0.85 })),
    ...guitars.map((g) => ({ url: `${base}/guitars/${g.slug}`, lastModified: g.updatedAt, changeFrequency: "weekly" as const, priority: 0.8 })),
    ...brands.map((b) => ({ url: `${base}/brands/${b.slug}`, lastModified: b.updatedAt, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...rankings.map((r) => ({ url: `${base}/rankings/${r.slug}`, lastModified: r.updatedAt, changeFrequency: "daily" as const, priority: 0.85 })),
    ...articles.map((a) => ({ url: `${base}/${a.type === "guide" ? "guides" : a.type === "review" ? "reviews" : a.type}/${a.slug}`, lastModified: a.updatedAt, changeFrequency: "monthly" as const, priority: 0.7 })),
  ]
}
