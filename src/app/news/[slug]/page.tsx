import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { articleRepository } from "@/server/repositories/article.repository"
import { buildMetadata } from "@/lib/seo/metadata"
import { formatDate } from "@/lib/utils"

export const revalidate = 1800

export async function generateStaticParams() {
  const slugs = await articleRepository.slugs()
  return slugs.filter((s) => s.type === "NEWS").map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article) return {}
  return buildMetadata({ title: article.title, description: article.excerpt ?? undefined, path: `/news/${slug}`, type: "article" })
}

export default async function NewsDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article || article.type !== "NEWS") notFound()
  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/news" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All news
      </Link>
      <header className="mt-8">
        <h1 className="text-3xl font-semibold leading-tight text-balance">{article.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {article.author && <span>By {article.author}</span>}
          <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{article.readMinutes} min read</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </div>
      </header>
      <div className="prose-editorial mt-8">
        {article.excerpt && <p className="text-lg text-muted-foreground">{article.excerpt}</p>}
        <p className="mt-6 text-muted-foreground">[Full article loads here]</p>
      </div>
    </article>
  )
}
