import { type NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const { reindexSearch } = await import("@/server/services/index.service")
  const { rankingService } = await import("@/server/services/ranking.service")
  const indexed = await reindexSearch()
  await rankingService.rebuildAll()
  return NextResponse.json({ ok: true, indexed })
}
