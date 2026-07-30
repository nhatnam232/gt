import type { GuitarImage, PricePoint } from "@prisma/client"

/**
 * Prisma returns rows, not view models: money is a Decimal, images and prices
 * are arrays. These helpers flatten a row for presentation without inventing
 * columns that do not exist in prisma/schema.prisma.
 */

/** Prisma Decimal | number | string | null -> number | null. */
export function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null
  const n = Number(value)
  return Number.isFinite(n) ? n : null
}

/** Primary image, falling back to the first one in sort order. */
export function primaryImage(guitar: { images?: GuitarImage[] | null }): GuitarImage | null {
  const images = guitar.images ?? []
  if (images.length === 0) return null
  return images.find((image) => image.isPrimary) ?? images[0]!
}

/** Cheapest tracked retailer offer, or null when nothing has been crawled. */
export function bestOffer<T extends PricePoint>(guitar: { prices?: T[] | null }): T | null {
  const offers = guitar.prices ?? []
  if (offers.length === 0) return null
  return offers.reduce((cheapest, offer) =>
    (toNumber(offer.price) ?? Infinity) < (toNumber(cheapest.price) ?? Infinity) ? offer : cheapest,
  )
}

/** Cheapest live price as a plain number. */
export function bestPrice(guitar: { prices?: PricePoint[] | null }): number | null {
  return toNumber(bestOffer(guitar)?.price)
}

/** Currency of the cheapest offer, defaulting to USD. */
export function guitarCurrency(guitar: { prices?: PricePoint[] | null }): string {
  return bestOffer(guitar)?.currency ?? "USD"
}
