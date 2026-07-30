import { articleRepository } from "@/server/repositories/article.repository"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Guitar Deals" }

export default async function DealsPage() {
  const deals = await articleRepository.list("deal")
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Deals</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {deals.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No deals listed yet.</p>
        ) : deals.map((d) => (
          <Link key={d.slug} href={`/deals/${d.slug}`} className="group rounded-xl border bg-card p-5 card-hover">
            <h3 className="font-semibold group-hover:text-primary transition-colors">{d.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{d.publishedAt ? formatDate(d.publishedAt.toISOString()) : ""}</p>
            {d.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{d.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
