import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const target = request.nextUrl.searchParams.get("target")

  if (target) {
    const { prisma } = await import("@/lib/prisma")
    await prisma.crawlJob.create({
      data: { target, status: "QUEUED", itemsFound: 0, itemsNew: 0, itemsUpdated: 0, itemsFailed: 0 },
    })
  }

  const { runNextJob } = await import("/etl/scheduler")
  const { ran } = await runNextJob()
  return NextResponse.json({ ok: true, ran })
}
