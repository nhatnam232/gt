import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import { articleRepository } from "@/server/repositories/article.repository"
import { ArticleCard } from "@/components/article/article-card"

export const revalidate = 900

export const metadata: Metadata = buildMetadata({
  title: "Guitar deals",
  description: "The best current deals and price drops on guitars.",
  path: "/deals",
})

export default async function DealsPage() {
  const { items } = await articleRepository.listByType("DEAL", 24)
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Deals</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </div>
    </div>
  )
}
