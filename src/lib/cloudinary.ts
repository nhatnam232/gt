import { v2 as cloudinary } from "cloudinary"

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export type UploadOptions = { folder?: string; publicId?: string }

export async function uploadAsset(dataUri: string, options: UploadOptions = {}) {
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: options.folder ?? "guitartribe",
    public_id: options.publicId,
    overwrite: !!options.publicId,
    resource_type: "image",
    transformation: [{ quality: "auto", fetch_format: "auto" }, { width: 1200, crop: "limit" }],
  })
  return { secure_url: result.secure_url, public_id: result.public_id, width: result.width, height: result.height }
}

export async function deleteAsset(publicId: string) {
  await cloudinary.uploader.destroy(publicId)
}

export { cloudinary }
