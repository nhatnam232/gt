import { NextResponse } from "next/server"
import { compareService } from "@/server/services/compare.service"
import { MAX_COMPARE } from "@/config/site"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const raw = url.searchParams.get("items") ?? ""
  const slugs = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE)

  if (slugs.length < 2) {
    return NextResponse.json({ error: "Provide at least 2 slugs" }, { status: 400 })
  }

  const result = await compareService.build(slugs)
  return NextResponse.json(result, {
    headers: { "Cache-Control": "public, max-age=60, stale-while-revalidate=600" },
  })
}
