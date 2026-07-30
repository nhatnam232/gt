import { guitarService } from "@/server/services/guitar.service"
import { notFound } from "next/navigation"
import Image from "next/image"
import { formatPrice, decimalToNumber } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Star, ShoppingCart, ExternalLink } from "lucide-react"
import { GuitarCard } from "@/components/guitar-card"
import type { Metadata } from "next"

// Next.js requires a literal number (siteConfig.REVALIDATE.detail = 1800)
export const revalidate = 1800

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const guitar = await guitarService.findBySlug(slug)
  if (!guitar) return {}
  return {
    title: guitar.name,
    description: guitar.summary ?? `Compare the ${guitar.name} spec by spec.`,
    openGraph: { images: guitar.images[0]?.url ? [{ url: guitar.images[0].url }] : [] },
  }
}

export default async function GuitarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const guitar = await guitarService.findBySlug(slug)
  if (!guitar) notFound()

  const related = await guitarService.findRelated(
    { brandId: guitar.brandId, category: guitar.category, id: guitar.id },
    4,
  )

  const primaryImage = guitar.images[0]
  const lowestPrice = guitar.prices[0]
  const expertScore = decimalToNumber(guitar.expertScore)
  const userScore = decimalToNumber(guitar.userScore)

  return (
    <div className="container-page py-10">
      {/* Top section */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Images */}
        <div className="space-y-3">
          <div className="relative aspect-square overflow-hidden rounded-2xl bg-secondary/40">
            {primaryImage ? (
              <Image src={primaryImage.url} alt={primaryImage.alt ?? guitar.name} fill className="object-contain p-8" sizes="(max-width: 1024px) 100vw, 50vw" priority />
            ) : (
              <div className="flex h-full items-center justify-center text-8xl">🎸</div>
            )}
          </div>
          {guitar.images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto no-scrollbar">
              {guitar.images.slice(0, 6).map((img) => (
                <div key={img.id} className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-secondary/40">
                  <Image src={img.url} alt={img.alt ?? ""} fill className="object-contain p-1" sizes="64px" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="flex flex-col gap-4">
          <div>
            <p className="text-sm text-muted-foreground">{guitar.brand.name}</p>
            <h1 className="mt-1 text-3xl font-bold">{guitar.name}</h1>
            {guitar.model && <p className="text-muted-foreground">{guitar.model}</p>}
          </div>

          {/* Scores */}
          <div className="flex gap-4">
            {expertScore ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">Expert score</span>
                <span className="flex items-center gap-1 text-2xl font-bold">
                  <Star className="size-5 fill-amber-500 text-amber-500" />{expertScore.toFixed(1)}
                </span>
              </div>
            ) : null}
            {userScore ? (
              <div className="flex flex-col">
                <span className="text-xs text-muted-foreground">User rating</span>
                <span className="text-2xl font-bold">{userScore.toFixed(1)}</span>
              </div>
            ) : null}
          </div>

          {/* Price & buy */}
          <div className="rounded-xl border bg-card p-5">
            {lowestPrice ? (
              <>
                <p className="text-sm text-muted-foreground">Best price</p>
                <p className="text-3xl font-bold mt-1">{formatPrice(lowestPrice.price)}</p>
                <p className="text-xs text-muted-foreground mt-0.5">at {lowestPrice.source.name}</p>
                {lowestPrice.url && (
                  <Button className="mt-4 w-full" asChild>
                    <a href={lowestPrice.url} target="_blank" rel="noopener noreferrer">
                      <ShoppingCart className="size-4 mr-2" /> Buy at {lowestPrice.source.name}
                      <ExternalLink className="size-3 ml-1 opacity-60" />
                    </a>
                  </Button>
                )}
              </>
            ) : (
              <p className="text-muted-foreground text-sm">Price not available. Check retailers below.</p>
            )}
          </div>

          {/* All prices */}
          {guitar.prices.length > 1 && (
            <div className="space-y-2">
              <p className="text-sm font-semibold">All prices</p>
              {guitar.prices.map((p) => (
                <div key={p.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <span className="text-sm">{p.source.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="font-medium">{formatPrice(p.price)}</span>
                    {p.url && (
                      <a href={p.url} target="_blank" rel="noopener noreferrer" className="text-xs text-muted-foreground hover:text-foreground">
                        <ExternalLink className="size-3" />
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">{guitar.category}</Badge>
            {guitar.madeIn && <Badge variant="outline">Made in {guitar.madeIn}</Badge>}
            {guitar.year && <Badge variant="outline">{guitar.year}</Badge>}
            {guitar.handedness === "LEFT" && <Badge variant="outline">Left-handed</Badge>}
          </div>
        </div>
      </div>

      {/* Specs */}
      <section className="mt-12">
        <h2 className="text-xl font-bold mb-4">Specifications</h2>
        <div className="overflow-hidden rounded-xl border">
          <table className="w-full border-collapse text-sm">
            <tbody>
              {([
                ["Category", guitar.category],
                ["Body shape", guitar.bodyShape],
                ["Cutaway", guitar.cutaway ? "Yes" : "No"],
                ["Top wood", guitar.topWood],
                ["Back & sides", guitar.backWood ? `${guitar.backWood} / ${guitar.sideWood ?? "—"}` : null],
                ["Neck wood", guitar.neckWood],
                ["Fingerboard", guitar.fingerboard],
                ["Scale length", guitar.scaleLengthIn ? `${guitar.scaleLengthIn}\"` : null],
                ["Frets", guitar.frets],
                ["Strings", guitar.strings],
                ["Nut width", guitar.nutWidthIn ? `${guitar.nutWidthIn}\"` : null],
                ["Nut material", guitar.nutMaterial],
                ["Bridge", guitar.bridge],
                ["Pickups", guitar.pickupConfig],
                ["Electronics", guitar.electronics],
                ["Finish", guitar.finish],
                ["Made in", guitar.madeIn],
                ["Weight", guitar.weightKg ? `${guitar.weightKg} kg` : null],
                ["MSRP", guitar.msrp ? formatPrice(guitar.msrp) : null],
              ] as [string, unknown][]).filter(([, v]) => v !== null && v !== undefined && v !== "").map(([label, value]) => (
                <tr key={label} className="border-b last:border-0 odd:bg-secondary/20">
                  <td className="px-4 py-2.5 font-medium w-1/3">{label}</td>
                  <td className="px-4 py-2.5 text-muted-foreground">{String(value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Summary */}
      {guitar.summary && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-3">Overview</h2>
          <p className="text-muted-foreground leading-relaxed">{guitar.summary}</p>
        </section>
      )}

      {/* Reviews */}
      {guitar.reviews.length > 0 && (
        <section className="mt-8">
          <h2 className="text-xl font-bold mb-4">User reviews ({guitar.reviews.length})</h2>
          <div className="space-y-4">
            {guitar.reviews.map((r) => (
              <div key={r.id} className="rounded-xl border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {r.user.image && (
                      <Image src={r.user.image} alt={r.user.name ?? ""} width={32} height={32} className="rounded-full" />
                    )}
                    <span className="font-medium text-sm">{r.user.name}</span>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="size-4 fill-current" />
                    <span className="text-sm font-semibold">{Number(r.rating).toFixed(1)}</span>
                  </div>
                </div>
                {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
                {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related */}
      {related.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-bold mb-4">Related instruments</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {related.map((g) => <GuitarCard key={g.id} guitar={g} />)}
          </div>
        </section>
      )}
    </div>
  )
}
