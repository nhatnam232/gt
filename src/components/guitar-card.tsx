import Link from "next/link"
import Image from "next/image"
import { Decimal } from "@prisma/client/runtime/library"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { formatPrice, decimalToNumber } from "@/lib/utils"

type GuitarCardData = {
  id: string
  slug: string
  name: string
  category: string
  expertScore?: Decimal | null
  userScore?: Decimal | null
  availability: string
  brand: { name: string; slug: string }
  images: Array<{ url: string; alt?: string | null }>
  prices: Array<{ price: Decimal }>
}

export function GuitarCard({ guitar }: { guitar: GuitarCardData }) {
  const image = guitar.images[0]
  const price = guitar.prices[0]?.price
  const score = decimalToNumber(guitar.expertScore) ?? decimalToNumber(guitar.userScore)

  return (
    <Link
      href={`/guitars/${guitar.slug}`}
      className="group flex flex-col rounded-xl border bg-card overflow-hidden card-hover"
    >
      {/* Image */}
      <div className="relative aspect-[4/3] overflow-hidden bg-secondary/40">
        {image ? (
          <Image
            src={image.url}
            alt={image.alt ?? guitar.name}
            fill
            className="object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl">🎸</div>
        )}
        {guitar.availability === "DISCONTINUED" && (
          <Badge variant="secondary" className="absolute top-2 right-2 text-xs">
            Discontinued
          </Badge>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <p className="text-xs text-muted-foreground">{guitar.brand.name}</p>
        <h3 className="font-semibold text-sm leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {guitar.name}
        </h3>
        <div className="mt-auto flex items-center justify-between pt-2">
          {score ? (
            <span className="flex items-center gap-1 text-xs font-medium">
              <Star className="size-3 fill-current text-amber-500" />
              {score.toFixed(1)}
            </span>
          ) : (
            <span />
          )}
          {price ? (
            <span className="text-sm font-semibold">{formatPrice(price)}</span>
          ) : (
            <span className="text-xs text-muted-foreground">Price TBD</span>
          )}
        </div>
      </div>
    </Link>
  )
}
