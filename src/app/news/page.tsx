import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import { articleRepository } from "@/server/repositories/article.repository"
import { ArticleCard } from "@/components/article/article-card"

export const revalidate = 1800

export const metadata: Metadata = buildMetadata({
  title: "Guitar news",
  description: "The latest news from the guitar world.",
  path: "/news",
})

export default async function NewsPage() {
  const { items } = await articleRepository.listByType("NEWS", 24)
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">News</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </div>
    </div>
  )
}
