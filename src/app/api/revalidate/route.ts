import { NextResponse } from "next/server"
import { revalidatePath, revalidateTag } from "next/cache"

export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  const secret = request.headers.get("x-revalidate-secret")
  if (secret !== process.env.BETTER_AUTH_SECRET) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }
  const body = (await request.json()) as { path?: string; tag?: string }
  if (body.tag) revalidateTag(body.tag)
  if (body.path) revalidatePath(body.path)
  return NextResponse.json({ revalidated: true })
}
