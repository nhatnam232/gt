import { categoryFromSlug, categoryMeta } from "@/config/navigation"
import { guitarService } from "@/server/services/guitar.service"
import { GuitarCard } from "@/components/guitar-card"
import { notFound } from "next/navigation"
import type { Metadata } from "next"

// Next.js requires a literal number (siteConfig.REVALIDATE.listing = 600)
export const revalidate = 600

export async function generateMetadata({ params }: { params: Promise<{ category: string }> }): Promise<Metadata> {
  const { category } = await params
  const cat = categoryFromSlug(category)
  if (!cat) return {}
  const meta = categoryMeta(cat)
  return { title: meta.plural, description: meta.description }
}

export default async function CategoryPage({ params }: { params: Promise<{ category: string }> }) {
  const { category } = await params
  const cat = categoryFromSlug(category)
  if (!cat) notFound()
  const meta = categoryMeta(cat)

  const result = await guitarService.list({ category, perPage: 48 })

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">{meta.plural}</h1>
      <p className="mt-1 text-muted-foreground">{result.total.toLocaleString()} instruments</p>
      {result.items.length === 0 ? (
        <div className="mt-16 text-center text-muted-foreground">No {meta.label.toLowerCase()} guitars yet. Check back soon.</div>
      ) : (
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {result.items.map((g) => <GuitarCard key={g.id} guitar={g} />)}
        </div>
      )}
    </div>
  )
}
