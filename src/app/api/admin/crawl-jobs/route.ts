import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export async function GET() {
  const user = await requireRole("EDITOR", await headers()).catch(() => null)
  if (!user) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const jobs = await prisma.crawlJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      target: true,
      status: true,
      itemsFound: true,
      itemsNew: true,
      startedAt: true,
      finishedAt: true,
      error: true,
    },
  })

  return NextResponse.json(jobs)
}
