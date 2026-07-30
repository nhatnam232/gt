import { NextRequest, NextResponse } from "next/server"
import { getSession } from "@/lib/session"
import { headers } from "next/headers"
import { uploadToCloudinary } from "@/lib/cloudinary"

export const runtime = "nodejs"
export const maxDuration = 30

export async function POST(req: NextRequest) {
  const h = await headers()
  const session = await (await import("@/lib/auth")).auth.api.getSession({ headers: h })
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const role = (session.user as { role?: string }).role ?? "USER"
  if (role !== "EDITOR" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await req.formData()
  const file = formData.get("file") as File | null
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 })

  try {
    const url = await uploadToCloudinary(file)
    return NextResponse.json({ url })
  } catch (err) {
    console.error("Upload error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
