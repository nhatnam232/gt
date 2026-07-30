import { notFound } from "next/navigation"
import type { Metadata } from "next"
import Link from "next/link"
import { ChevronRight } from "lucide-react"
import { REVALIDATE } from "@/config/site"
import { buildMetadata } from "@/lib/seo/metadata"
import { graph, productSchema, faqSchema, breadcrumbSchema } from "@/lib/seo/jsonld"
import { JsonLd } from "@/components/seo/json-ld"
import { guitarService } from "@/server/services/guitar.service"
import { guitarRepository } from "@/server/repositories/guitar.repository"
import { ImageGallery } from "@/components/guitar/image-gallery"
import { SpecTable } from "@/components/guitar/spec-table"
import { PriceOffers } from "@/components/guitar/price-offers"
import { ScoreBadge, StarRating } from "@/components/guitar/score-badge"
import { CompareToggle } from "@/components/guitar/compare-toggle"
import { ReviewForm } from "@/components/guitar/review-form"
import { GuitarRail } from "@/components/guitar/guitar-rail"
import { SectionHeader } from "@/components/layout/section"
import { Badge } from "@/components/ui/badge"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export const revalidate = REVALIDATE.detail

export async function generateStaticParams() {
  const slugs = await guitarRepository.publishedSlugs(200)
  return slugs.map(({ slug }) => ({ slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const guitar = await guitarService.detail(slug)
  if (!guitar) return {}
  return buildMetadata({
    title: guitar.name,
    description:
      guitar.summary ??
      `${guitar.brand.name} ${guitar.name} - specs, scores, prices and reviews.`,
    path: `/guitars/${slug}`,
    type: "product",
    images: guitar.images.slice(0, 3).map((img) => img.url),
  })
}

export default async function GuitarDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const [guitar, related] = await Promise.all([
    guitarService.detail(slug),
    guitarService.related(slug),
  ])
  if (!guitar) notFound()

  void guitarService.recordView(slug)

  const breadcrumbs = [
    { name: "Home", path: "/" },
    { name: guitar.category, path: `/c/${guitar.categorySlug}` },
    { name: guitar.brand.name, path: `/brands/${guitar.brand.slug}` },
    { name: guitar.name, path: `/guitars/${slug}` },
  ]

  const jsonld = graph(
    productSchema({
      name: guitar.name,
      slug,
      description:
        guitar.summary ??
        `${guitar.brand.name} ${guitar.name} guitar. Category: ${guitar.category}`,
      brand: guitar.brand.name,
      sku: guitar.sku,
      mpn: guitar.mpn,
      gtin: guitar.gtin,
      category: guitar.category,
      images: guitar.images.map((img) => img.url),
      currency: guitar.currency,
      offers: guitar.offers.map((offer) => ({
        price: offer.price,
        currency: offer.currency,
        url: offer.url,
        seller: offer.retailer.name,
        availability: offer.availability,
      })),
      expertScore: guitar.expertScore,
      userScore: guitar.userScore,
      userScoreCount: guitar.userScoreCount,
      reviews: guitar.reviews.slice(0, 5).map((review) => ({
        author: review.author,
        rating: review.rating,
        title: review.title,
        body: review.body,
        date: review.createdAt,
      })),
    }),
    guitar.faqs.length > 0 ? faqSchema(guitar.faqs) : null,
    breadcrumbSchema(breadcrumbs),
  )

  return (
    <>
      <JsonLd data={jsonld} />

      <div className="container-page py-8">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
            {breadcrumbs.map((crumb, i) => (
              <li key={crumb.path} className="flex items-center gap-1">
                {i < breadcrumbs.length - 1 ? (
                  <>
                    <Link href={crumb.path} className="hover:text-foreground">
                      {crumb.name}
                    </Link>
                    <ChevronRight className="size-3" />
                  </>
                ) : (
                  <span className="text-foreground">{crumb.name}</span>
                )}
              </li>
            ))}
          </ol>
        </nav>

        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          {/* Left: gallery */}
          <ImageGallery images={guitar.images} name={guitar.name} />

          {/* Right: header + scores + prices */}
          <div className="space-y-6">
            <div>
              <Link
                href={`/brands/${guitar.brand.slug}`}
                className="text-sm font-medium uppercase tracking-wide text-muted-foreground hover:text-primary"
              >
                {guitar.brand.name}
              </Link>
              <h1 className="mt-1 text-3xl font-semibold leading-tight">{guitar.name}</h1>
              {guitar.summary ? (
                <p className="mt-3 leading-relaxed text-muted-foreground">{guitar.summary}</p>
              ) : null}

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <ScoreBadge score={guitar.expertScore} label="Expert score" size="lg" />
                <StarRating value={guitar.userScore} count={guitar.userScoreCount} />
                <Badge variant="outline" className="capitalize">
                  {guitar.availability.replace(/_/g, " ").toLowerCase()}
                </Badge>
                <CompareToggle slug={slug} labelled />
              </div>
            </div>

            {/* Pros / cons */}
            {(guitar.pros.length > 0 || guitar.cons.length > 0) ? (
              <div className="grid gap-3 sm:grid-cols-2">
                {guitar.pros.length > 0 ? (
                  <div className="hairline rounded-xl border bg-[hsl(var(--success)/0.06)] p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-[hsl(var(--success))]">
                      Pros
                    </p>
                    <ul className="space-y-1.5">
                      {guitar.pros.map((pro) => (
                        <li key={pro} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 text-[hsl(var(--success))]">+</span>
                          {pro}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
                {guitar.cons.length > 0 ? (
                  <div className="hairline rounded-xl border bg-destructive/5 p-4">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-destructive">
                      Cons
                    </p>
                    <ul className="space-y-1.5">
                      {guitar.cons.map((con) => (
                        <li key={con} className="flex items-start gap-2 text-sm">
                          <span className="mt-0.5 text-destructive">-</span>
                          {con}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </div>
            ) : null}

            {/* Price offers */}
            <div>
              <h2 className="mb-3 text-lg font-semibold">Prices from retailers</h2>
              <PriceOffers offers={guitar.offers} />
            </div>
          </div>
        </div>

        {/* Full spec table */}
        <div className="mt-14">
          <SectionHeader title="Full specifications" />
          <SpecTable guitar={guitar} />
        </div>

        {/* FAQ */}
        {guitar.faqs.length > 0 ? (
          <div className="mt-14">
            <SectionHeader title="FAQ" />
            <Accordion type="single" collapsible className="hairline rounded-2xl border bg-card px-5">
              {guitar.faqs.map((faq) => (
                <AccordionItem key={faq.question} value={faq.question}>
                  <AccordionTrigger className="text-left">{faq.question}</AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        ) : null}

        {/* Reviews */}
        <div className="mt-14">
          <SectionHeader title="Owner reviews" />
          <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
            <div className="space-y-4">
              {guitar.reviews.length === 0 ? (
                <p className="text-sm text-muted-foreground">No approved reviews yet. Be the first!</p>
              ) : (
                guitar.reviews.map((review) => (
                  <div key={review.id} className="hairline rounded-2xl border bg-card p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-medium">{review.author}</p>
                        <StarRating value={review.rating} />
                      </div>
                      <time className="shrink-0 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString()}
                      </time>
                    </div>
                    {review.title ? (
                      <p className="mt-3 font-medium">{review.title}</p>
                    ) : null}
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{review.body}</p>
                  </div>
                ))
              )}
            </div>
            <ReviewForm guitarSlug={slug} />
          </div>
        </div>

        {/* Related */}
        {related.length > 0 ? (
          <div className="mt-14">
            <SectionHeader
              eyebrow="Similar instruments"
              title="You might also like"
              description="Same category, comparable price range."
            />
            <GuitarRail guitars={related} />
          </div>
        ) : null}
      </div>
    </>
  )
}
