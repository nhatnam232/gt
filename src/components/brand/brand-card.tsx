import Image from "next/image"
import Link from "next/link"
import type { BrandListItem } from "@/server/repositories/brand.repository"
import { formatNumber } from "@/lib/utils"

export function BrandCard({ brand }: { brand: BrandListItem }) {
  return (
    <Link
      href={`/brands/${brand.slug}`}
      className="card-hover hairline flex flex-col items-center gap-3 rounded-2xl border bg-card p-5 text-center"
    >
      <span className="relative grid h-10 w-full place-items-center">
        {brand.logoUrl ? (
          <Image
            src={brand.logoUrl}
            alt={brand.name}
            width={120}
            height={40}
            className="h-9 w-auto object-contain opacity-80 transition-opacity hover:opacity-100 dark:invert dark:brightness-90"
          />
        ) : (
          <span className="text-base font-semibold tracking-tight">{brand.name}</span>
        )}
      </span>
      <span className="text-xs text-muted-foreground">
        {formatNumber(brand.guitarCount)} instrument{brand.guitarCount === 1 ? "" : "s"}
        {brand.countryCode ? ` · ${brand.countryCode}` : ""}
      </span>
    </Link>
  )
}
