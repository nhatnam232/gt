import { NextRequest, NextResponse } from "next/server"
import { runNextJob } from "../../../../../etl/scheduler"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const target = req.nextUrl.searchParams.get("target")
  if (target) {
    // Enqueue a specific target
    const { prisma } = await import("@/lib/prisma")
    await prisma.crawlJob.create({
      data: { target, status: "QUEUED", itemsFound: 0, itemsNew: 0, itemsUpdated: 0, itemsFailed: 0 },
    })
  }

  const result = await runNextJob()
  return NextResponse.json(result)
}
