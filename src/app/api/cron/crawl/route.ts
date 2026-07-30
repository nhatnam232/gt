import { NextResponse } from "next/server"
import { enqueueCrawl } from "@/server/actions/ops.actions"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const target = new URL(request.url).searchParams.get("target") ?? "brands"
  const sourceSlug = new URL(request.url).searchParams.get("source") ?? undefined

  try {
    await enqueueCrawl(target, sourceSlug)
    return NextResponse.json({ queued: true, target })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
