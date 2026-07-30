import { NextResponse } from "next/server"
import { reindex } from "@/server/actions/ops.actions"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    await reindex()
    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
