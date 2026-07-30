import { rankingRepository } from "@/server/repositories/ranking.repository"
import { GuitarCard } from "@/components/guitar-card"
import { notFound } from "next/navigation"
import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

export const revalidate = siteConfig.REVALIDATE.ranking

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const ranking = await rankingRepository.findBySlug(slug)
  if (!ranking) return {}
  return { title: ranking.name }
}

export default async function RankingPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const ranking = await rankingRepository.findBySlug(slug)
  if (!ranking) notFound()

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">{ranking.name}</h1>
      <p className="mt-1 text-muted-foreground">{ranking.entries.length} instruments ranked</p>
      {ranking.entries.length === 0 ? (
        <p className="mt-16 text-center text-muted-foreground">Rankings are being built. Check back soon.</p>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {ranking.entries.map((entry) => (
            <div key={entry.id} className="relative">
              <div className="absolute -top-2 -left-2 z-10 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow">
                #{entry.position}
              </div>
              <GuitarCard guitar={entry.guitar} />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
