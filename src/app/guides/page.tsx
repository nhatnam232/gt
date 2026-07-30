import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import { articleRepository } from "@/server/repositories/article.repository"
import { ArticleCard } from "@/components/article/article-card"

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: "Buying guides",
  description: "Expert buying guides for every guitar category and budget.",
  path: "/guides",
})

export default async function GuidesPage() {
  const { items } = await articleRepository.listByType("GUIDE", 24)
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Buying guides</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </div>
    </div>
  )
}
