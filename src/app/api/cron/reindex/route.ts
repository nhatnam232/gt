import { type NextRequest, NextResponse } from "next/server"
import { reindexSearch } from "@/server/services/index.service"
import { rankingService } from "@/server/services/ranking.service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const indexed = await reindexSearch()
  await rankingService.rebuildAll()
  return NextResponse.json({ ok: true, indexed })
}
