import { articleRepository } from "@/server/repositories/article.repository"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Guitar News" }

export default async function NewsPage() {
  const articles = await articleRepository.list("news")
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">News</h1>
      <div className="mt-8 space-y-4">
        {articles.length === 0 ? (
          <p className="text-muted-foreground">No news articles yet.</p>
        ) : articles.map((a) => (
          <Link key={a.slug} href={`/news/${a.slug}`} className="group flex gap-4 rounded-xl border bg-card p-5 hover:bg-secondary/50 transition-colors">
            <div className="flex-1">
              <h3 className="font-semibold group-hover:text-primary transition-colors">{a.title}</h3>
              <p className="text-xs text-muted-foreground mt-1">{a.publishedAt ? formatDate(a.publishedAt.toISOString()) : ""}</p>
              {a.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{a.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
