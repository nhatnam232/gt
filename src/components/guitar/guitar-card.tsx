import Image from "next/image"
import Link from "next/link"
import { ImageOff } from "lucide-react"
import type { GuitarCardDto } from "@/domain/guitar/types"
import { cn, formatPrice } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { ScoreBadge, StarRating } from "@/components/guitar/score-badge"
import { CompareToggle } from "@/components/guitar/compare-toggle"

const AVAILABILITY_LABEL: Record<string, string> = {
  IN_STOCK: "In stock",
  OUT_OF_STOCK: "Out of stock",
  PREORDER: "Pre-order",
  BACKORDER: "Backorder",
  DISCONTINUED: "Discontinued",
  UNKNOWN: "",
}

/**
 * Primary catalogue card. Server component - only the compare button ships JS.
 * `priority` should be true for the first row above the fold only.
 */
export function GuitarCard({
  guitar,
  priority = false,
  className,
}: {
  guitar: GuitarCardDto
  priority?: boolean
  className?: string
}) {
  const discount =
    guitar.msrp && guitar.price && guitar.msrp > guitar.price
      ? Math.round(((guitar.msrp - guitar.price) / guitar.msrp) * 100)
      : null

  const specs = [
    guitar.bodyShape,
    guitar.topWood,
    guitar.pickupConfig,
    guitar.scaleLengthIn ? `${guitar.scaleLengthIn}" scale` : null,
  ].filter(Boolean) as string[]

  return (
    <article
      className={cn(
        "card-hover hairline group relative flex flex-col overflow-hidden rounded-[calc(var(--radius)+4px)] border bg-card",
        className,
      )}
    >
      <Link href={`/guitars/${guitar.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-muted">
        {guitar.image ? (
          <Image
            src={guitar.image.url}
            alt={guitar.image.alt || guitar.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            priority={priority}
            loading={priority ? undefined : "lazy"}
            placeholder={guitar.image.blurData ? "blur" : "empty"}
            blurDataURL={guitar.image.blurData ?? undefined}
            className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04]"
          />
        ) : (
          <span className="grid size-full place-items-center text-muted-foreground">
            <ImageOff className="size-8" />
          </span>
        )}

        {discount ? (
          <Badge variant="success" className="absolute left-3 top-3">
            -{discount}%
          </Badge>
        ) : null}
      </Link>

      <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-200 focus-within:opacity-100 group-hover:opacity-100 max-md:opacity-100">
        <CompareToggle slug={guitar.slug} />
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <Link
            href={`/brands/${guitar.brand.slug}`}
            className="text-xs font-medium uppercase tracking-wide text-muted-foreground transition-colors hover:text-primary"
          >
            {guitar.brand.name}
          </Link>
          <ScoreBadge score={guitar.expertScore} label="Expert score" />
        </div>

        <h3 className="text-[15px] font-semibold leading-snug">
          <Link href={`/guitars/${guitar.slug}`} className="transition-colors hover:text-primary">
            {guitar.name}
          </Link>
        </h3>

        {specs.length > 0 ? (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {specs.join(" · ")}
          </p>
        ) : null}

        {guitar.userScore !== null ? (
          <StarRating value={guitar.userScore} count={guitar.userScoreCount} />
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div>
            {guitar.price ? (
              <p className="text-[15px] font-semibold tabular-nums">
                {formatPrice(guitar.price, guitar.currency)}
              </p>
            ) : guitar.msrp ? (
              <p className="text-[15px] font-semibold tabular-nums text-muted-foreground">
                {formatPrice(guitar.msrp, guitar.currency)}
                <span className="ml-1 text-xs font-normal">MSRP</span>
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">Price unavailable</p>
            )}
            {discount && guitar.msrp ? (
              <p className="text-xs text-muted-foreground line-through tabular-nums">
                {formatPrice(guitar.msrp, guitar.currency)}
              </p>
            ) : null}
          </div>
          {AVAILABILITY_LABEL[guitar.availability] ? (
            <Badge
              variant={guitar.availability === "IN_STOCK" ? "success" : "outline"}
              className="shrink-0"
            >
              {AVAILABILITY_LABEL[guitar.availability]}
            </Badge>
          ) : null}
        </div>
      </div>
    </article>
  )
}
