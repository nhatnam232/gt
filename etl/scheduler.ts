/**
 * ETL Scheduler — called by /api/cron/crawl to process one QUEUED CrawlJob.
 * Designed to be triggered by Vercel cron (max 10s on Hobby, 300s on Pro).
 */

import { prisma } from "@/lib/prisma"

export async function runNextJob(): Promise<{ ran: boolean; target?: string; error?: string }> {
  // Claim the oldest queued job atomically
  const job = await prisma.crawlJob.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
  })

  if (!job) return { ran: false }

  await prisma.crawlJob.update({
    where: { id: job.id },
    data: { status: "RUNNING", startedAt: new Date() },
  })

  let itemsNew = 0
  let error: string | undefined

  try {
    switch (job.target) {
      case "brands": {
        const { crawlBrands } = await import("./crawlers/brand-official")
        await crawlBrands()
        break
      }
      case "wikidata": {
        const { crawlWikidata } = await import("./crawlers/wikidata")
        await crawlWikidata()
        break
      }
      case "retailers": {
        const { crawlRetailers } = await import("./crawlers/retailers")
        await crawlRetailers()
        break
      }
      case "prices": {
        const { crawlPrices } = await import("./crawlers/prices")
        await crawlPrices()
        break
      }
      case "index": {
        const { indexAllGuitars } = await import("./services/index.service")
        await indexAllGuitars()
        break
      }
      case "rankings": {
        const { buildRankings } = await import("./services/ranking.service")
        await buildRankings()
        break
      }
      default:
        throw new Error(`Unknown ETL target: ${job.target}`)
    }

    await prisma.crawlJob.update({
      where: { id: job.id },
      data: { status: "SUCCESS", finishedAt: new Date(), itemsNew },
    })
  } catch (err) {
    error = err instanceof Error ? err.message : String(err)
    await prisma.crawlJob.update({
      where: { id: job.id },
      data: { status: "FAILED", finishedAt: new Date(), error },
    })
  }

  return { ran: true, target: job.target, error }
}
