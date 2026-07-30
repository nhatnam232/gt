import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadAsset } from "@/lib/cloudinary"
import { headers } from "next/headers"

const MAX_SIZE = 8 * 1024 * 1024 // 8 MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export async function POST(request: NextRequest) {
  // Auth check — only EDITOR or ADMIN
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }
  const role = (session.user as { role?: string }).role ?? "USER"
  if (role !== "EDITOR" && role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 })
  }

  const formData = await request.formData()
  const file = formData.get("file")
  if (!file || typeof file === "string") {
    return NextResponse.json({ error: "No file provided" }, { status: 400 })
  }

  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "File too large (max 8 MB)" }, { status: 413 })
  }
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json({ error: "Invalid file type" }, { status: 415 })
  }

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const dataUri = `data:${file.type};base64,${buffer.toString("base64")}`
    const folder = (formData.get("folder") as string | null) ?? "guitars"

    const result = await uploadAsset(dataUri, { folder })
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    console.error("[upload] Cloudinary error:", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
