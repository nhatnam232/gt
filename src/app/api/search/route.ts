import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { searchService } from "@/server/services/search.service"

export const dynamic = "force-dynamic"

/** Instant-search endpoint used by the command palette and the search page. */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const q = url.searchParams.get("q") ?? ""
  const limit = Number(url.searchParams.get("limit") ?? 8)
  const category = url.searchParams.get("category") ?? undefined

  const verdict = await rateLimit(`search:${clientIp(await headers())}`, {
    name: "search",
    max: 120,
    window: "1 m",
  })
  if (!verdict.success) {
    return NextResponse.json({ error: "Too many requests" }, { status: 429 })
  }

  const result = await searchService.query(q, {
    limit: Number.isFinite(limit) ? limit : 8,
    category,
  })

  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=15, stale-while-revalidate=60" },
  })
}
