import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Blocks, LineChart, ShieldCheck } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { REVALIDATE, siteConfig } from "@/config/site"
import { CATEGORIES } from "@/config/navigation"
import { SPEC_FIELDS } from "@/config/spec-schema"
import { buildMetadata } from "@/lib/seo/metadata"
import { faqSchema, graph, itemListSchema } from "@/lib/seo/jsonld"
import { guitarService } from "@/server/services/guitar.service"
import { brandRepository } from "@/server/repositories/brand.repository"
import { articleRepository } from "@/server/repositories/article.repository"
import { Hero, type HeroStats } from "@/components/home/hero"
import { SectionHeader } from "@/components/layout/section"
import { GuitarRail } from "@/components/guitar/guitar-rail"
import { QuickCompare } from "@/components/home/quick-compare"
import { BrandCard } from "@/components/brand/brand-card"
import { ArticleCard } from "@/components/article/article-card"
import { YoutubeCard } from "@/components/home/youtube-card"
import { HomeFaq, HOME_FAQ } from "@/components/home/home-faq"
import { Button } from "@/components/ui/button"

export const revalidate = REVALIDATE.home

export const metadata: Metadata = buildMetadata({
  title: `${siteConfig.name} - ${siteConfig.tagline}`,
  description: siteConfig.description,
  path: "/",
})

/** Never let a single cold datasource break the landing page. */
async function safe<T>(promise: Promise<T>, fallback: T): Promise<T> {
  try {
    return await promise
  } catch (error) {
    console.error("Homepage data source failed", error)
    return fallback
  }
}

async function loadStats(): Promise<HeroStats> {
  const [guitars, brands, offers] = await Promise.all([
    prisma.guitar.count({ where: { isPublished: true } }),
    prisma.brand.count(),
    prisma.priceOffer.count(),
  ])
  return { guitars, brands, offers, specs: SPEC_FIELDS.length }
}

async function loadVideos() {
  return prisma.guitarVideo.findMany({
    where: { guitar: { isPublished: true } },
    orderBy: [{ position: "asc" }],
    take: 3,
    select: {
      videoId: true,
      title: true,
      channel: true,
      guitar: { select: { name: true, brand: { select: { name: true } } } },
    },
  })
}

export default async function HomePage() {
  const [stats, topRated, trending, bestValue, brands, reviews, news, videos] = await Promise.all([
    safe(loadStats(), { guitars: 0, brands: 0, offers: 0, specs: SPEC_FIELDS.length }),
    safe(guitarService.topRated(8), []),
    safe(guitarService.trending(8), []),
    safe(guitarService.bestValue(4), []),
    safe(brandRepository.featured(12), []),
    safe(articleRepository.latest(["REVIEW"], 3), []),
    safe(articleRepository.latest(["NEWS", "GUIDE"], 4), []),
    safe(loadVideos(), []),
  ])

  const compareOptions = [...topRated, ...trending]
    .filter((guitar, index, all) => all.findIndex((g) => g.slug === guitar.slug) === index)
    .slice(0, 12)

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: graph(
            faqSchema(HOME_FAQ),
            topRated.length > 0
              ? itemListSchema({
                  name: "Top rated guitars",
                  description: "Highest expert-scored instruments in the database",
                  path: "/rankings",
                  items: topRated.map((guitar) => ({
                    name: `${guitar.brand.name} ${guitar.name}`,
                    path: `/guitars/${guitar.slug}`,
                    image: guitar.image?.url ?? null,
                  })),
                })
              : null,
          ),
        }}
      />

      <Hero stats={stats} />

      {/* Categories */}
      <section className="section container-page">
        <SectionHeader
          eyebrow="Catalogue"
          title="Browse by category"
          description="Each category has its own spec sheet, filters and ranking methodology."
          href="/guitars"
          hrefLabel="All instruments"
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/c/${category.slug}`}
              className="card-hover hairline group rounded-2xl border bg-card p-5"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">{category.label}</h3>
                <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
              </div>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{category.blurb}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured brands */}
      {brands.length > 0 ? (
        <section className="section container-page">
          <SectionHeader
            eyebrow="Manufacturers"
            title="Featured brands"
            description="Official specifications imported directly from manufacturer catalogues."
            href="/brands"
            hrefLabel="All brands"
          />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {brands.map((brand) => (
              <BrandCard key={brand.slug} brand={brand} />
            ))}
          </div>
        </section>
      ) : null}

      {/* Top guitars */}
      <section className="section container-page">
        <SectionHeader
          eyebrow="Top guitars"
          title="Highest expert scores"
          description="Ranked on build quality, tonewoods, electronics, playability and value."
          href="/rankings"
          hrefLabel="All rankings"
        />
        <GuitarRail guitars={topRated} priority />
      </section>

      {/* Quick compare */}
      {compareOptions.length >= 2 ? (
        <section className="section container-page">
          <SectionHeader
            eyebrow="Compare"
            title="Put two instruments head to head"
            description="Differences are highlighted automatically and identical rows can be hidden."
            href="/compare"
            hrefLabel="Full comparison"
          />
          <QuickCompare options={compareOptions} />
        </section>
      ) : null}

      {/* Banner */}
      <section className="section container-page">
        <div className="relative overflow-hidden rounded-3xl border bg-gradient-to-br from-primary/12 via-card to-card p-8 sm:p-12">
          <div className="grid-lines pointer-events-none absolute inset-0 opacity-50" aria-hidden />
          <div className="relative grid gap-8 lg:grid-cols-[1.2fr_1fr] lg:items-center">
            <div>
              <p className="eyebrow">Methodology</p>
              <h2 className="text-balance mt-3 text-2xl sm:text-3xl">
                No sponsored placements, no invented data
              </h2>
              <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-muted-foreground">
                Specifications are imported from primary sources and deduplicated against a
                canonical spec schema. Every merged field records where it came from and when it was
                last verified.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/how-we-score">How we score</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/data-sources">Our data sources</Link>
                </Button>
              </div>
            </div>
            <ul className="grid gap-4">
              {[
                { icon: ShieldCheck, title: "Source-weighted merging", body: "Official manufacturer data outranks retailer listings on every field." },
                { icon: Blocks, title: `${SPEC_FIELDS.length} normalised spec fields`, body: "Units, woods and pickup configurations are normalised before storage." },
                { icon: LineChart, title: "Tracked price history", body: "Offers from multiple retailers with the full price timeline per instrument." },
              ].map((item) => (
                <li key={item.title} className="glass flex gap-3 rounded-2xl border p-4">
                  <item.icon className="mt-0.5 size-5 shrink-0 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{item.body}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Trending */}
      <section className="section container-page">
        <SectionHeader
          eyebrow="Trending"
          title="What people are researching now"
          description="Ranked by page views over the last 30 days."
          href="/guitars?sort=popular"
          hrefLabel="See more"
        />
        <GuitarRail guitars={trending} />
      </section>

      {/* Best value */}
      {bestValue.length > 0 ? (
        <section className="section container-page">
          <SectionHeader
            eyebrow="Value picks"
            title="Best score per dollar"
            href="/rankings/best-value"
            hrefLabel="Best value ranking"
          />
          <GuitarRail guitars={bestValue} />
        </section>
      ) : null}

      {/* Editorial */}
      {reviews.length > 0 || news.length > 0 ? (
        <section className="section container-page grid gap-12 lg:grid-cols-[1.4fr_1fr]">
          {reviews.length > 0 ? (
            <div>
              <SectionHeader eyebrow="Editorial" title="Latest reviews" href="/reviews" />
              <div className="grid gap-4 sm:grid-cols-2">
                {reviews.map((article) => (
                  <ArticleCard key={article.slug} article={article} />
                ))}
              </div>
            </div>
          ) : null}
          {news.length > 0 ? (
            <div>
              <SectionHeader eyebrow="Newsroom" title="News and guides" href="/news" />
              <div className="grid gap-3">
                {news.map((article) => (
                  <ArticleCard key={article.slug} article={article} compact />
                ))}
              </div>
            </div>
          ) : null}
        </section>
      ) : null}

      {/* Videos */}
      {videos.length > 0 ? (
        <section className="section container-page">
          <SectionHeader
            eyebrow="Video"
            title="Demos and sound tests"
            description="Loaded on demand - no third-party scripts until you press play."
          />
          <div className="grid gap-4 md:grid-cols-3">
            {videos.map((video) => (
              <YoutubeCard
                key={video.videoId}
                videoId={video.videoId}
                title={video.title ?? `${video.guitar.brand.name} ${video.guitar.name}`}
                channel={video.channel}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* FAQ */}
      <section className="section container-page grid gap-8 lg:grid-cols-[1fr_1.4fr]">
        <SectionHeader
          eyebrow="FAQ"
          title="Frequently asked questions"
          description="How the database is built, scored and kept up to date."
          className="mb-0"
        />
        <HomeFaq />
      </section>
    </>
  )
}
