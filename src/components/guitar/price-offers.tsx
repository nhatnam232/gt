import Link from "next/link"
import { ExternalLink, ShoppingBag } from "lucide-react"
import type { PriceOfferDto } from "@/domain/guitar/types"
import { toNumber } from "@/domain/guitar/view"
import { formatDate, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export function PriceOffers({ offers }: { offers: PriceOfferDto[] }) {
  if (offers.length === 0) {
    return (
      <div className="hairline rounded-2xl border border-dashed bg-card/60 px-6 py-10 text-center">
        <ShoppingBag className="mx-auto mb-3 size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">
          No retailer offers yet. Run the ETL importer to pull live prices.
        </p>
      </div>
    )
  }

  const lastChecked = offers.reduce<Date | null>(
    (latest, offer) =>
      offer.recordedAt && (!latest || offer.recordedAt > latest) ? offer.recordedAt : latest,
    null,
  )

  return (
    <div className="hairline overflow-hidden rounded-2xl border bg-card">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="border-b bg-secondary/50">
            <th className="px-4 py-3 text-left font-medium">Retailer</th>
            <th className="px-4 py-3 text-left font-medium">Availability</th>
            <th className="px-4 py-3 text-right font-medium">Price</th>
            <th className="px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {offers.map((offer) => (
            <tr key={offer.id} className="border-b last:border-0 hover:bg-secondary/30">
              <td className="px-4 py-3 font-medium">{offer.source?.name ?? "Retailer"}</td>
              <td className="px-4 py-3">
                <Badge variant={offer.inStock ? "success" : "outline"}>
                  {offer.inStock ? "In stock" : "Check store"}
                </Badge>
              </td>
              <td className="px-4 py-3 text-right font-semibold tabular-nums">
                {formatPrice(toNumber(offer.price) ?? 0, offer.currency)}
              </td>
              <td className="px-4 py-3">
                {offer.url ? (
                  <Button asChild size="sm" variant="outline" className="gap-1.5">
                    <Link href={offer.url} target="_blank" rel="noopener noreferrer">
                      Buy <ExternalLink className="size-3.5" />
                    </Link>
                  </Button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {lastChecked ? (
        <p className="px-4 py-3 text-xs text-muted-foreground">
          Last updated {formatDate(lastChecked)}. Prices are indicative - confirm on the retailer
          site before purchasing.
        </p>
      ) : null}
    </div>
  )
}
