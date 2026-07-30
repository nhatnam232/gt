import Link from "next/link"
import { CATEGORIES } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, BarChart3, SlidersHorizontal, Zap } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { GuitarCard } from "@/components/guitar-card"
import type { Metadata } from "next"
import { siteConfig } from "@/config/site"

// NOTE: Next.js requires a literal number here (siteConfig.REVALIDATE.home)
export const revalidate = 900

export const metadata: Metadata = {
  title: "Compare Every Guitar — GuitarTribe",
  description: siteConfig.description,
}

async function getFeaturedGuitars() {
  return prisma.guitar.findMany({
    where: { isPublished: true },
    orderBy: { expertScore: "desc" },
    take: 8,
    include: {
      brand: { select: { name: true, slug: true } },
      images: { where: { isPrimary: true }, take: 1 },
      prices: { orderBy: { price: "asc" }, take: 1 },
    },
  })
}

async function getFeaturedBrands() {
  return prisma.brand.findMany({
    where: { isFeatured: true },
    orderBy: { name: "asc" },
    take: 10,
  })
}

const FEATURES = [
  { icon: SlidersHorizontal, title: "Side-by-side compare", desc: "Compare up to 5 instruments spec by spec" },
  { icon: BarChart3, title: "Expert rankings", desc: "Curated lists for every budget and style" },
  { icon: Star, title: "Verified reviews", desc: "Real owner ratings aggregated from the web" },
  { icon: Zap, title: "Live prices", desc: "Prices from Sweetwater, Thomann, Amazon & more" },
]

const FAQ = [
  { q: "How often are prices updated?", a: "Prices are updated every 6 hours from our retailer partners." },
  { q: "How are expert scores calculated?", a: "We aggregate reviews from Sweetwater, Thomann, Guitar World, and other trusted sources, weighted by editorial authority." },
  { q: "Can I compare different types of guitars?", a: "Yes. You can compare any combination of acoustic, electric, bass, classical, or ukulele instruments." },
  { q: "Is GuitarTribe free?", a: "Completely free. We earn a small affiliate commission when you buy through our links, at no extra cost to you." },
]

export default async function HomePage() {
  const [guitars, brands] = await Promise.all([getFeaturedGuitars(), getFeaturedBrands()])

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden mesh py-20 lg:py-32">
        <div className="grid-lines absolute inset-0 opacity-[0.035]" />
        <div className="container-page relative text-center">
          <p className="eyebrow mb-4">Guitar comparison engine</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance">
            Find your perfect guitar.
          </h1>
          <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
            Compare every acoustic, electric, bass, and classical guitar — spec by spec, price by price. Real data, no fluff.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Button size="lg" asChild>
              <Link href="/guitars">Browse instruments <ArrowRight className="ml-2 size-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/compare">Compare now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section border-b">
        <div className="container-page">
          <h2 className="text-2xl font-bold">Browse by type</h2>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-8">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.slug}
                href={`/c/${cat.slug}`}
                className="flex flex-col items-center gap-2 rounded-xl border bg-card p-4 text-center transition-colors hover:bg-secondary"
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="text-sm font-medium">{cat.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {guitars.length > 0 && (
        <section className="section border-b">
          <div className="container-page">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Top rated</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/guitars">View all <ArrowRight className="ml-1 size-3" /></Link>
              </Button>
            </div>
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {guitars.slice(0, 8).map((g) => (
                <GuitarCard key={g.id} guitar={g as Parameters<typeof GuitarCard>[0]["guitar"]} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      <section className="section border-b bg-secondary/30">
        <div className="container-page">
          <h2 className="text-2xl font-bold text-center">Why GuitarTribe?</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f) => (
              <div key={f.title} className="flex flex-col gap-3">
                <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="size-5 text-primary" />
                </div>
                <h3 className="font-semibold">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Brands */}
      {brands.length > 0 && (
        <section className="section border-b">
          <div className="container-page">
            <h2 className="text-2xl font-bold">Top brands</h2>
            <div className="mt-6 flex flex-wrap gap-3">
              {brands.map((b) => (
                <Link
                  key={b.slug}
                  href={`/brands/${b.slug}`}
                  className="rounded-xl border bg-card px-5 py-2.5 text-sm font-medium transition-colors hover:bg-secondary"
                >
                  {b.name}
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="section">
        <div className="container-page max-w-2xl">
          <h2 className="text-2xl font-bold">Frequently asked questions</h2>
          <dl className="mt-6 divide-y">
            {FAQ.map((item) => (
              <div key={item.q} className="py-5">
                <dt className="font-semibold">{item.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>
    </>
  )
}
