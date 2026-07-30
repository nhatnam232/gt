"use server"

import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"

export async function upsertGuitar(formData: FormData) {
  await requireRole("EDITOR")

  const id = formData.get("id") as string | null
  const name = (formData.get("name") as string).trim()
  const brandId = formData.get("brandId") as string
  const category = formData.get("category") as string
  const model = (formData.get("model") as string | null)?.trim() || null
  const msrp = formData.get("msrp") ? Number(formData.get("msrp")) : null
  const year = formData.get("year") ? Number(formData.get("year")) : null
  const summary = (formData.get("summary") as string | null)?.trim() || null
  const imageUrl = (formData.get("imageUrl") as string | null)?.trim() || null
  const isPublished = formData.get("isPublished") === "true"

  const slug = slugify(`${await getBrandSlug(brandId)}-${name}`)

  const data = {
    name,
    brandId,
    category: category as "ACOUSTIC" | "ELECTRIC" | "BASS" | "CLASSICAL" | "UKULELE" | "AMPLIFIER" | "PEDAL" | "ACCESSORY",
    model,
    msrp,
    year,
    summary,
    images: imageUrl ? [imageUrl] : undefined,
    isPublished,
  }

  if (id) {
    await prisma.guitar.update({ where: { id }, data })
    revalidatePath("/admin/guitars")
    revalidatePath(`/guitars/${slug}`)
  } else {
    await prisma.guitar.create({ data: { ...data, slug } })
    revalidatePath("/admin/guitars")
  }

  redirect("/admin/guitars")
}

async function getBrandSlug(brandId: string): Promise<string> {
  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { slug: true } })
  return brand?.slug ?? "unknown"
}

export async function moderateReview(reviewId: string, approve: boolean) {
  await requireRole("EDITOR")
  if (approve) {
    await prisma.userReview.update({ where: { id: reviewId }, data: { isApproved: true, approvedAt: new Date() } })
  } else {
    await prisma.userReview.delete({ where: { id: reviewId } })
  }
  revalidatePath("/admin/reviews")
}

export async function banUser(userId: string) {
  await requireRole("ADMIN")
  await prisma.user.update({ where: { id: userId }, data: { banned: true } })
  revalidatePath("/admin/users")
}

export async function unbanUser(userId: string) {
  await requireRole("ADMIN")
  await prisma.user.update({ where: { id: userId }, data: { banned: false } })
  revalidatePath("/admin/users")
}

export async function setUserRole(userId: string, role: "USER" | "EDITOR" | "ADMIN") {
  await requireRole("ADMIN")
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/users")
}
