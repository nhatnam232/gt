/**
 * Price crawler — refreshes price points for all published guitars.
 * In production this would call retailer APIs / scrape product pages.
 */

import { prisma } from "@/lib/prisma"

export async function crawlPrices() {
  console.log("[prices] Starting price crawl (stub)...")
  const guitars = await prisma.guitar.findMany({
    where: { isPublished: true },
    select: { id: true, name: true },
    take: 20,
  })
  console.log(`[prices] Would refresh prices for ${guitars.length} published guitars.`)
  // Full implementation: for each guitar x retailer source, fetch current price
  // and upsert a PricePoint row.
  console.log("[prices] Done (stub).")
}
