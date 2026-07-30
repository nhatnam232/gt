import { prisma } from "../src/lib/prisma"
import type { LogLevel, JobStatus } from "@prisma/client"

export async function createJob(target: string) {
  return prisma.crawlJob.create({
    data: { target, status: "RUNNING", itemsFound: 0, itemsNew: 0, itemsUpdated: 0, itemsFailed: 0, startedAt: new Date() },
  })
}

export async function finishJob(
  id: string,
  stats: { found: number; added: number; failed: number },
  status: JobStatus = "SUCCESS",
) {
  await prisma.crawlJob.update({
    where: { id },
    data: {
      status: stats.failed > 0 && stats.added === 0 ? "FAILED" : status,
      itemsFound: stats.found,
      itemsNew: stats.added,
      itemsFailed: stats.failed,
      finishedAt: new Date(),
    },
  })
}

export async function logJob(jobId: string, level: LogLevel, message: string) {
  await prisma.crawlLog.create({ data: { jobId, level, message } })
  console.log(`[${level}] ${message}`)
}
