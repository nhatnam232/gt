"use server"

import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"

export async function approveReview(formData: FormData) {
  await requireRole("EDITOR")
  const reviewId = String(formData.get("reviewId"))
  await prisma.userReview.update({
    where: { id: reviewId },
    data: { isApproved: true },
  })
  revalidatePath("/admin/reviews")
}

export async function rejectReview(formData: FormData) {
  await requireRole("EDITOR")
  const reviewId = String(formData.get("reviewId"))
  await prisma.userReview.delete({ where: { id: reviewId } })
  revalidatePath("/admin/reviews")
}

export async function banUser(userId: string, reason?: string) {
  await requireRole("ADMIN")
  await prisma.user.update({
    where: { id: userId },
    data: { banned: true, banReason: reason ?? "Banned by admin" },
  })
  revalidatePath("/admin/users")
}

export async function unbanUser(userId: string) {
  await requireRole("ADMIN")
  await prisma.user.update({
    where: { id: userId },
    data: { banned: false, banReason: null },
  })
  revalidatePath("/admin/users")
}

export async function changeUserRole(userId: string, role: "USER" | "EDITOR" | "ADMIN") {
  await requireRole("ADMIN")
  await prisma.user.update({ where: { id: userId }, data: { role } })
  revalidatePath("/admin/users")
}

export async function publishGuitar(slug: string) {
  await requireRole("EDITOR")
  await prisma.guitar.update({ where: { slug }, data: { isPublished: true } })
  revalidatePath("/admin/guitars")
  revalidatePath(`/guitars/${slug}`)
}

export async function unpublishGuitar(slug: string) {
  await requireRole("EDITOR")
  await prisma.guitar.update({ where: { slug }, data: { isPublished: false } })
  revalidatePath("/admin/guitars")
  revalidatePath(`/guitars/${slug}`)
}
