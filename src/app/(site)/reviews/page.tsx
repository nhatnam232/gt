import { articleRepository } from "@/server/repositories/article.repository"
import { formatDate } from "@/lib/utils"
import Link from "next/link"
import type { Metadata } from "next"

export const metadata: Metadata = { title: "Guitar Reviews" }

export default async function ReviewsPage() {
  const reviews = await articleRepository.list("review")
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Reviews</h1>
      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground col-span-full">No reviews yet.</p>
        ) : reviews.map((r) => (
          <Link key={r.slug} href={`/reviews/${r.slug}`} className="group rounded-xl border bg-card p-5 card-hover">
            <h3 className="font-semibold group-hover:text-primary transition-colors">{r.title}</h3>
            <p className="text-xs text-muted-foreground mt-1">{r.publishedAt ? formatDate(r.publishedAt.toISOString()) : ""}</p>
            {r.excerpt && <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{r.excerpt}</p>}
          </Link>
        ))}
      </div>
    </div>
  )
}
