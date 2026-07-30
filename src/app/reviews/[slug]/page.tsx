import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock, Tag } from "lucide-react"
import { articleRepository } from "@/server/repositories/article.repository"
import { buildMetadata } from "@/lib/seo/metadata"
import { formatDate } from "@/lib/utils"

export const revalidate = 1800

export async function generateStaticParams() {
  const slugs = await articleRepository.slugs()
  return slugs.filter((s) => s.type === "REVIEW").map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article) return {}
  return buildMetadata({
    title: article.title,
    description: article.excerpt ?? undefined,
    path: `/reviews/${slug}`,
    type: "article",
    images: article.coverUrl ? [article.coverUrl] : undefined,
  })
}

export default async function ReviewDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article || article.type !== "REVIEW") notFound()

  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/reviews" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All reviews
      </Link>
      <header className="mt-8">
        {article.tags?.[0] && (
          <span className="eyebrow flex items-center gap-1.5"><Tag className="size-3.5" />{article.tags[0]}</span>
        )}
        <h1 className="mt-3 text-3xl font-semibold leading-tight text-balance">{article.title}</h1>
        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
          {article.author && <span>By {article.author}</span>}
          <span className="flex items-center gap-1.5"><Clock className="size-3.5" />{article.readMinutes} min read</span>
          <time dateTime={article.publishedAt}>{formatDate(article.publishedAt)}</time>
        </div>
      </header>
      {article.coverUrl && (
        <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-2xl">
          <Image src={article.coverUrl} alt={article.coverAlt ?? article.title} fill className="object-cover" />
        </div>
      )}
      {article.excerpt && (
        <p className="mt-8 text-lg leading-relaxed text-muted-foreground">{article.excerpt}</p>
      )}
      <div className="prose-editorial mt-8">
        <p className="text-muted-foreground">[Full review content loads here]</p>
      </div>
    </article>
  )
}
