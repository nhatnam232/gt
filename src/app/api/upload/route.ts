import { type NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { uploadAsset } from "@/lib/cloudinary"
import { headers } from "next/headers"

const MAX_SIZE = 8 * 1024 * 1024
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/avif"]

export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  const role = (session.user as { role?: string }).role ?? "USER"
  if (role !== "EDITOR" && role !== "ADMIN") return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  const formData = await request.formData()
  const file = formData.get("file")
  if (!file || typeof file === "string") return NextResponse.json({ error: "No file" }, { status: 400 })
  if ((file as File).size > MAX_SIZE) return NextResponse.json({ error: "Too large" }, { status: 413 })
  if (!ALLOWED_TYPES.includes((file as File).type)) return NextResponse.json({ error: "Invalid type" }, { status: 415 })

  try {
    const buffer = Buffer.from(await (file as File).arrayBuffer())
    const dataUri = `data:${(file as File).type};base64,${buffer.toString("base64")}`
    const folder = (formData.get("folder") as string | null) ?? "guitars"
    const result = await uploadAsset(dataUri, { folder })
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id })
  } catch (err) {
    console.error("[upload]", err)
    return NextResponse.json({ error: "Upload failed" }, { status: 500 })
  }
}
