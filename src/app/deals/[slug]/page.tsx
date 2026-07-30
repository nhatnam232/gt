import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { articleRepository } from "@/server/repositories/article.repository"
import { buildMetadata } from "@/lib/seo/metadata"
import { formatDate } from "@/lib/utils"

export const revalidate = 600

export async function generateStaticParams() {
  const slugs = await articleRepository.slugs()
  return slugs.filter((s) => s.type === "DEAL").map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article) return {}
  return buildMetadata({ title: article.title, description: article.excerpt ?? undefined, path: `/deals/${slug}`, type: "article" })
}

export default async function DealDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article || article.type !== "DEAL") notFound()
  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/deals" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All deals
      </Link>
      <header className="mt-8">
        <h1 className="text-3xl font-semibold leading-tight text-balance">{article.title}</h1>
        <time className="mt-4 block text-sm text-muted-foreground" dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
      </header>
      <div className="prose-editorial mt-8">
        {article.excerpt && <p className="text-lg text-muted-foreground">{article.excerpt}</p>}
        <p className="mt-6 text-muted-foreground">[Deal details load here]</p>
      </div>
    </article>
  )
}
