import { articleRepository } from "@/server/repositories/article.repository"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Guitar Buyer's Guides" }

export default async function GuidesPage() {
  const guides = await articleRepository.list("guide")
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Buyer's Guides</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {guides.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No guides yet. Check back soon.</p>
        ) : guides.map((g) => (
          <Link key={g.slug} href={`/guides/${g.slug}`} className="group rounded-xl border bg-card overflow-hidden card-hover">
            {g.coverUrl && <div className="aspect-video bg-secondary/40" />}
            <div className="p-5">
              <p className="text-xs text-muted-foreground">{g.publishedAt ? formatDate(g.publishedAt.toISOString()) : ""}</p>
              <h3 className="mt-1 font-semibold group-hover:text-primary transition-colors">{g.title}</h3>
              {g.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{g.excerpt}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
