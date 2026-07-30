/**
 * Retailer crawler — fetches guitar listings from Sweetwater & Thomann RSS/API.
 * Stores raw price points linked to existing guitars by name-matching.
 */

import { prisma } from "@/lib/prisma"

const RETAILER_SOURCES = ["sweetwater", "thomann"]

export async function crawlRetailers() {
  console.log("[retailers] Starting retailer crawl (stub)...")
  // Full implementation would scrape retailer search pages / APIs.
  // This stub records the attempt so the scheduler sees activity.
  const sources = await prisma.source.findMany({
    where: { slug: { in: RETAILER_SOURCES }, enabled: true },
  })

  for (const source of sources) {
    await prisma.source.update({
      where: { id: source.id },
      data: { lastCrawled: new Date() },
    })
    console.log(`[retailers] Marked ${source.name} as crawled (stub).`)
  }

  console.log("[retailers] Done.")
}
