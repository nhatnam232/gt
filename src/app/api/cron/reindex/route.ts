import { NextRequest, NextResponse } from "next/server"
import { indexAllGuitars } from "../../../../../etl/services/index.service"
import { buildRankings } from "../../../../../etl/services/ranking.service"

export const dynamic = "force-dynamic"
export const maxDuration = 300

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization")?.replace("Bearer ", "")
  if (secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await indexAllGuitars()
  await buildRankings()

  return NextResponse.json({ ok: true })
}
