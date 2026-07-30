import type { Metadata } from "next"
import { buildMetadata } from "@/lib/seo/metadata"
import { articleRepository } from "@/server/repositories/article.repository"
import { ArticleCard } from "@/components/article/article-card"

export const revalidate = 3600

export const metadata: Metadata = buildMetadata({
  title: "Guitar reviews",
  description: "In-depth reviews of acoustic, electric, bass and classical guitars.",
  path: "/reviews",
})

export default async function ReviewsPage() {
  const { items } = await articleRepository.listByType("REVIEW", 24)
  return (
    <div className="container-page py-12">
      <h1 className="text-3xl font-semibold">Reviews</h1>
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((article) => <ArticleCard key={article.slug} article={article} />)}
      </div>
      {items.length === 0 ? (
        <p className="mt-8 text-muted-foreground">No reviews published yet.</p>
      ) : null}
    </div>
  )
}
