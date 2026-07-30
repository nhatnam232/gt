/**
 * ETL Scheduler - dispatches QUEUED CrawlJob rows.
 * Called by Vercel cron routes or a background worker.
 */
import { prisma } from "../src/lib/prisma"
import { crawlBrands } from "./adapters/brand-official"
import { crawlWikidata } from "./adapters/wikidata"
import { crawlRetailers } from "./adapters/retailers"
import { refreshPrices } from "./adapters/prices"
import { normalizeAll } from "./normalizer"
import { mergeAll } from "./merger"
import { reindexSearch } from "../src/server/services/index.service"
import { rankingService } from "../src/server/services/ranking.service"

type Adapter = () => Promise<unknown>

const ADAPTERS: Record<string, Adapter> = {
  brands: crawlBrands,
  wikidata: crawlWikidata,
  retailers: crawlRetailers,
  prices: refreshPrices,
  normalize: normalizeAll,
  merge: mergeAll,
  index: reindexSearch,
  rankings: () => rankingService.rebuildAll(),
  all: async () => {
    await crawlBrands()
    await crawlWikidata()
    await crawlRetailers()
    await normalizeAll()
    await mergeAll()
    await refreshPrices()
    await reindexSearch()
    await rankingService.rebuildAll()
  },
}

export async function runNextJob(): Promise<{ ran: string | null }> {
  const job = await prisma.crawlJob.findFirst({
    where: { status: "QUEUED" },
    orderBy: { createdAt: "asc" },
  })
  if (!job) return { ran: null }

  const claimed = await prisma.crawlJob.updateMany({
    where: { id: job.id, status: "QUEUED" },
    data: { status: "RUNNING", startedAt: new Date() },
  })
  if (claimed.count === 0) return { ran: null }

  const adapter = ADAPTERS[job.target]
  if (!adapter) {
    await prisma.crawlJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: `Unknown target: ${job.target}`, finishedAt: new Date() },
    })
    return { ran: job.target }
  }

  try {
    await adapter()
    await prisma.crawlJob.update({
      where: { id: job.id },
      data: { status: "SUCCESS", finishedAt: new Date() },
    })
  } catch (err) {
    await prisma.crawlJob.update({
      where: { id: job.id },
      data: { status: "FAILED", error: String(err), finishedAt: new Date() },
    })
  }

  return { ran: job.target }
}
