import { articleRepository } from "@/server/repositories/article.repository"
import { notFound } from "next/navigation"
import { formatDate } from "@/lib/utils"
import type { Metadata } from "next"

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await articleRepository.findBySlug(slug)
  if (!article) return {}
  return { title: article.title }
}

export async function generateStaticParams() {
  const slugs = await articleRepository.slugs()
  return slugs.filter((s) => s.type === "deal").map((s) => ({ slug: s.slug }))
}

export default async function DealPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await articleRepository.findBySlug(slug)
  if (!article || article.type !== "deal") notFound()
  return (
    <div className="container-page py-10 max-w-3xl">
      <p className="eyebrow mb-3">Deal</p>
      <h1 className="text-4xl font-bold">{article.title}</h1>
      <div className="mt-2 text-sm text-muted-foreground">
        {article.publishedAt && <span>{formatDate(article.publishedAt.toISOString())}</span>}
      </div>
      <div className="mt-8 prose-editorial" dangerouslySetInnerHTML={{ __html: article.body }} />
    </div>
  )
}
