import { rankingRepository } from "@/server/repositories/ranking.repository"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import type { Metadata } from "next"

// Next.js requires a literal number (siteConfig.REVALIDATE.ranking = 3600)
export const revalidate = 3600
export const metadata: Metadata = { title: "Guitar Rankings" }

export default async function RankingsPage() {
  const rankings = await rankingRepository.list()
  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Guitar Rankings</h1>
      <p className="mt-2 text-muted-foreground">Expert-curated lists for every style and budget.</p>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {rankings.map((r) => (
          <Link key={r.slug} href={`/rankings/${r.slug}`} className="group flex flex-col gap-2 rounded-xl border bg-card p-6 transition-colors hover:bg-secondary/60">
            <p className="font-semibold group-hover:text-primary transition-colors">{r.name}</p>
            <p className="text-sm text-muted-foreground">{r._count.entries} instruments ranked</p>
            <ArrowRight className="mt-auto size-4 text-muted-foreground group-hover:text-primary transition-colors" />
          </Link>
        ))}
      </div>
    </div>
  )
}
