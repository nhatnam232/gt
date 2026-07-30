import { type NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { runNextJob } from "../../../../etl/scheduler"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const target = request.nextUrl.searchParams.get("target")
  if (target) {
    await prisma.crawlJob.create({
      data: { target, status: "QUEUED", itemsFound: 0, itemsNew: 0, itemsUpdated: 0, itemsFailed: 0 },
    })
  }

  const { ran } = await runNextJob()
  return NextResponse.json({ ok: true, ran })
}
