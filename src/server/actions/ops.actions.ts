"use server"

import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function enqueueCrawl(target: string) {
  await requireRole("EDITOR")
  await prisma.crawlJob.create({
    data: { target, status: "QUEUED", itemsFound: 0, itemsNew: 0, itemsUpdated: 0, itemsFailed: 0 },
  })
  revalidatePath("/admin/crawler")
}

export async function cancelCrawl(jobId: string) {
  await requireRole("EDITOR")
  await prisma.crawlJob.update({
    where: { id: jobId },
    data: { status: "CANCELLED", finishedAt: new Date() },
  })
  revalidatePath("/admin/crawler")
}

export async function triggerReindex() {
  await requireRole("EDITOR")
  // Fire and forget - the actual reindex runs in a background job
  await fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/cron/reindex`, {
    method: "GET",
    headers: { Authorization: `Bearer ${process.env.CRON_SECRET}` },
  }).catch(() => null)
  revalidatePath("/admin/rankings")
}
