"use server"

import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { slugify } from "@/lib/utils"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import type { Category } from "@prisma/client"

export async function createGuitar(formData: FormData) {
  await requireRole("EDITOR")

  const name = String(formData.get("name") ?? "").trim()
  const brandId = String(formData.get("brandId") ?? "")
  const category = String(formData.get("category") ?? "ACOUSTIC") as Category
  const model = (formData.get("model") as string)?.trim() || null
  const year = formData.get("year") ? parseInt(String(formData.get("year"))) : null
  const msrp = formData.get("msrp") ? parseFloat(String(formData.get("msrp"))) : null
  const madeIn = (formData.get("madeIn") as string)?.trim() || null
  const topWood = (formData.get("topWood") as string)?.trim() || null
  const neckWood = (formData.get("neckWood") as string)?.trim() || null
  const fingerboard = (formData.get("fingerboard") as string)?.trim() || null
  const frets = formData.get("frets") ? parseInt(String(formData.get("frets"))) : null
  const strings = formData.get("strings") ? parseInt(String(formData.get("strings"))) : null
  const summary = (formData.get("summary") as string)?.trim() || null

  if (!name || !brandId) throw new Error("Name and brand are required")

  const brand = await prisma.brand.findUnique({ where: { id: brandId }, select: { slug: true } })
  if (!brand) throw new Error("Brand not found")

  const baseSlug = slugify(`${brand.slug}-${name}`)
  // ensure unique slug
  let slug = baseSlug
  let attempt = 0
  while (await prisma.guitar.findUnique({ where: { slug } })) {
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const guitar = await prisma.guitar.create({
    data: {
      slug, name, brandId, category, model, year, msrp, madeIn,
      topWood, neckWood, fingerboard, frets, strings, summary,
      isPublished: false,
    },
  })

  revalidatePath("/admin/guitars")
  redirect(`/admin/guitars/${guitar.slug}`)
}

export async function updateGuitar(slug: string, formData: FormData) {
  await requireRole("EDITOR")

  const data: Record<string, unknown> = {}
  const fields = ["name", "model", "madeIn", "topWood", "neckWood", "fingerboard", "summary", "finish", "color",
    "bodyShape", "pickupConfig", "electronics", "bridge", "nutMaterial"]
  for (const f of fields) {
    const v = (formData.get(f) as string)?.trim()
    if (v !== undefined) data[f] = v || null
  }

  const numFields = ["year", "frets", "strings", "msrp", "scaleLengthIn", "nutWidthIn", "weightKg"]
  for (const f of numFields) {
    const v = formData.get(f)
    data[f] = v ? parseFloat(String(v)) : null
  }

  const cat = formData.get("category")
  if (cat) data.category = cat as Category

  const published = formData.get("isPublished")
  if (published !== null) data.isPublished = published === "true"

  await prisma.guitar.update({ where: { slug }, data })
  revalidatePath("/admin/guitars")
  revalidatePath(`/guitars/${slug}`)
  revalidatePath(`/admin/guitars/${slug}`)
}

export async function deleteGuitar(slug: string) {
  await requireRole("ADMIN")
  await prisma.guitar.delete({ where: { slug } })
  revalidatePath("/admin/guitars")
  redirect("/admin/guitars")
}
