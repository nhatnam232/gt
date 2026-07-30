"use server"

import { revalidatePath } from "next/cache"
import { prisma } from "@/lib/prisma"
import { assertRole } from "@/lib/session"
import { rankingService } from "@/server/services/ranking.service"
import { reindexSearch } from "@/server/services/index.service"

/**
 * Queue a crawl. The job row is the contract between the web app and the ETL
 * worker (`npm run etl:run`), which claims QUEUED jobs - the request never does
 * network work itself.
 */
export async function enqueueCrawl(target: string, sourceSlug?: string): Promise<string> {
  const user = await assertRole("EDITOR")
  const source = sourceSlug
    ? await prisma.source.findUnique({ where: { slug: sourceSlug }, select: { id: true } })
    : null

  const job = await prisma.crawlJob.create({
    data: { target: target.slice(0, 120), sourceId: source?.id ?? null, status: "QUEUED" },
    select: { id: true },
  })

  await prisma.crawlLog.create({
    data: { jobId: job.id, level: "INFO", message: `Queued by ${user.email}` },
  })

  revalidatePath("/admin/crawler")
  return job.id
}

export async function cancelCrawl(jobId: string): Promise<void> {
  await assertRole("EDITOR")
  await prisma.crawlJob.update({
    where: { id: jobId },
    data: { status: "CANCELLED", finishedAt: new Date() },
  })
  revalidatePath("/admin/crawler")
}

export async function rebuildRankings(): Promise<Record<string, number>> {
  await assertRole("EDITOR")
  const result = await rankingService.rebuildAll()
  revalidatePath("/rankings")
  return result
}

export async function reindex(): Promise<number> {
  await assertRole("EDITOR")
  const count = await reindexSearch()
  revalidatePath("/search")
  return count
}
