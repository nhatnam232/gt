/**
 * Refreshes PriceOffer records by re-fetching retailer product pages and
 * extracting the current price via JSON-LD or meta tags.
 */

import * as cheerio from "cheerio"
import pLimit from "p-limit"
import { prisma } from "../../src/lib/prisma"
import { createJob, finishJob, logJob } from "../job"
import { safeGet } from "../http"

export async function refreshPrices() {
  const job = await createJob("prices")
  let updated = 0, failed = 0

  const offers = await prisma.priceOffer.findMany({
    where: {
      checkedAt: {
        // Only refresh offers not checked in the last 4 hours
        lt: new Date(Date.now() - 4 * 60 * 60 * 1000),
      },
    },
    take: 500,
    select: { id: true, url: true, guitarId: true, currency: true },
  })

  await logJob(job.id, "INFO", `Refreshing ${offers.length} price offers`)

  const limit = pLimit(3)
  await Promise.all(
    offers.map((offer) =>
      limit(async () => {
        try {
          const html = await safeGet(offer.url)
          if (!html) return
          const price = extractPrice(html)
          if (!price) return

          await prisma.priceOffer.update({
            where: { id: offer.id },
            data: { price, checkedAt: new Date() },
          })

          // Append to price history
          await prisma.priceHistory.create({
            data: { guitarId: offer.guitarId, price, currency: offer.currency, recordedAt: new Date() },
          })

          updated++
        } catch {
          failed++
        }
      }),
    ),
  )

  await finishJob(job.id, { found: offers.length, added: 0, failed })
  console.log(`[prices] updated=${updated} failed=${failed}`)
}

function extractPrice(html: string): number | null {
  const $ = cheerio.load(html)

  // JSON-LD offer price
  const jsonLdScripts = $('script[type="application/ld+json"]').toArray()
  for (const el of jsonLdScripts) {
    try {
      const data = JSON.parse($(el).html() ?? '')
      const items = Array.isArray(data) ? data : [data]
      for (const item of items) {
        const offers = item.offers ?? item.Offers
        if (offers) {
          const offer = Array.isArray(offers) ? offers[0] : offers
          const price = Number(offer?.price ?? offer?.Price)
          if (Number.isFinite(price) && price > 0) return price
        }
      }
    } catch { /* skip */ }
  }

  // Meta price tags
  const metaPrice =
    $('meta[property="product:price:amount"]').attr('content') ??
    $('meta[property="og:price:amount"]').attr('content') ??
    $('[data-price]').first().attr('data-price')

  if (metaPrice) {
    const n = Number(metaPrice.replace(/[^0-9.]/g, ''))
    if (Number.isFinite(n) && n > 0) return n
  }

  return null
}
