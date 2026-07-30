import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Image from "next/image"
import Link from "next/link"
import { ArrowLeft, Clock } from "lucide-react"
import { articleRepository } from "@/server/repositories/article.repository"
import { buildMetadata } from "@/lib/seo/metadata"
import { formatDate } from "@/lib/utils"

export const revalidate = 1800

export async function generateStaticParams() {
  const slugs = await articleRepository.slugs()
  return slugs.filter((s) => s.type === "GUIDE").map(({ slug }) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article) return {}
  return buildMetadata({ title: article.title, description: article.excerpt ?? undefined, path: `/guides/${slug}`, type: "article" })
}

export default async function GuideDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const article = await articleRepository.detail(slug)
  if (!article || article.type !== "GUIDE") notFound()
  return (
    <article className="container-page max-w-3xl py-12">
      <Link href="/guides" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="size-4" /> All buying guides
      </Link>
      <header className="mt-8">
        <h1 className="text-3xl font-semibold leading-tight text-balance">{article.title}</h1>
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
      <div className="prose-editorial mt-8">
        {article.excerpt && <p className="text-lg text-muted-foreground">{article.excerpt}</p>}
        <p className="mt-6 text-muted-foreground">[Full guide content loads here]</p>
      </div>
    </article>
  )
}
