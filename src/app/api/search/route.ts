import { NextRequest, NextResponse } from "next/server"
import { searchGuitars } from "@/lib/search"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? ""
  const filter = req.nextUrl.searchParams.get("filter") ?? undefined
  const sort = req.nextUrl.searchParams.get("sort")?.split(",")
  const limit = Math.min(Number(req.nextUrl.searchParams.get("limit") ?? 24), 100)
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? 0)

  try {
    const results = await searchGuitars(q, filter, sort, limit, offset)
    return NextResponse.json(results)
  } catch (err) {
    console.error("Search error:", err)
    return NextResponse.json({ hits: [], estimatedTotalHits: 0 })
  }
}
