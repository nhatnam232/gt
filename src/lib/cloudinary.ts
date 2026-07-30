import { v2 as cloudinary } from "cloudinary"
import { env, features } from "./env"

if (features.cloudinary) {
  cloudinary.config({
    cloud_name: env.CLOUDINARY_CLOUD_NAME,
    api_key: env.CLOUDINARY_API_KEY,
    api_secret: env.CLOUDINARY_API_SECRET,
    secure: true,
  })
}

export type UploadedAsset = {
  url: string
  publicId: string
  width: number
  height: number
  blurDataUrl?: string
}

/** Upload a buffer (admin image upload) or mirror a remote source image. */
export async function uploadAsset(
  input: Buffer | string,
  options?: { folder?: string; publicId?: string },
): Promise<UploadedAsset> {
  if (!features.cloudinary) {
    if (typeof input === "string") {
      return { url: input, publicId: input, width: 0, height: 0 }
    }
    throw new Error("Cloudinary is not configured: set CLOUDINARY_* environment variables")
  }

  const folder = options?.folder ?? env.CLOUDINARY_UPLOAD_FOLDER
  const payload =
    typeof input === "string" ? input : `data:image/jpeg;base64,${input.toString("base64")}`

  const result = await cloudinary.uploader.upload(payload, {
    folder,
    public_id: options?.publicId,
    overwrite: true,
    resource_type: "image",
    transformation: [{ quality: "auto:good", fetch_format: "auto" }],
  })

  return {
    url: result.secure_url,
    publicId: result.public_id,
    width: result.width,
    height: result.height,
  }
}

export async function destroyAsset(publicId: string): Promise<void> {
  if (!features.cloudinary) return
  await cloudinary.uploader.destroy(publicId)
}

/** Build a responsive delivery URL. Falls back to the raw URL when unmanaged. */
export function cdnUrl(url: string, width: number): string {
  if (!features.cloudinary) return url
  const marker = "/upload/"
  const at = url.indexOf(marker)
  if (at === -1) return url
  const transform = `f_auto,q_auto,w_${width},c_limit/`
  return `${url.slice(0, at + marker.length)}${transform}${url.slice(at + marker.length)}`
}

/** 1x1 tinted placeholder used as blurDataURL when the source has no LQIP. */
export const FALLBACK_BLUR =
  "data:image/svg+xml;base64," +
  Buffer.from(
    '<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="#e5e2dc"/></svg>',
  ).toString("base64")
