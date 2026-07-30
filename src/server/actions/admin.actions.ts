"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { Prisma } from "@prisma/client"
import { prisma } from "@/lib/prisma"
import { assertRole } from "@/lib/session"
import { clientIp } from "@/lib/rate-limit"
import { sanitizeHtml, stripHtml } from "@/lib/sanitize"
import { slugify } from "@/lib/utils"
import { cache } from "@/lib/cache"
import { recomputeUserScore } from "./review.actions"

export type AdminActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: Record<string, string>
  slug?: string
}

const CATEGORIES = [
  "ACOUSTIC",
  "ELECTRIC",
  "BASS",
  "CLASSICAL",
  "UKULELE",
  "AMPLIFIER",
  "PEDAL",
  "ACCESSORY",
] as const

const AVAILABILITY = [
  "IN_STOCK",
  "OUT_OF_STOCK",
  "PREORDER",
  "BACKORDER",
  "DISCONTINUED",
  "UNKNOWN",
] as const

const optionalText = z
  .string()
  .transform((v) => v.trim())
  .transform((v) => (v === "" ? undefined : stripHtml(v)))
  .optional()

const optionalNumber = z
  .union([z.string(), z.number()])
  .transform((v) => (v === "" || v === null ? undefined : Number(v)))
  .refine((v) => v === undefined || Number.isFinite(v), "Must be a number")
  .optional()

const guitarSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2).max(200),
  brandSlug: z.string().min(1),
  seriesName: optionalText,
  category: z.enum(CATEGORIES),
  model: optionalText,
  sku: optionalText,
  mpn: optionalText,
  gtin: optionalText,
  subtype: optionalText,
  msrp: optionalNumber,
  currentBest: optionalNumber,
  currency: z.string().length(3).default("USD"),
  bodyShape: optionalText,
  topWood: optionalText,
  backWood: optionalText,
  sideWood: optionalText,
  neckWood: optionalText,
  fingerboard: optionalText,
  bridge: optionalText,
  nutMaterial: optionalText,
  scaleLengthIn: optionalNumber,
  nutWidthIn: optionalNumber,
  frets: optionalNumber,
  strings: optionalNumber,
  pickupConfig: optionalText,
  electronics: optionalText,
  finish: optionalText,
  color: optionalText,
  madeIn: optionalText,
  year: optionalNumber,
  weightKg: optionalNumber,
  handedness: z.enum(["RIGHT", "LEFT", "BOTH"]).default("RIGHT"),
  cutaway: z.coerce.boolean().optional(),
  electroAcoustic: z.coerce.boolean().optional(),
  caseIncluded: z.coerce.boolean().optional(),
  warranty: optionalText,
  accessories: z.string().optional(),
  summary: z.string().max(8000).optional(),
  pros: z.string().optional(),
  cons: z.string().optional(),
  expertScore: optionalNumber,
  availability: z.enum(AVAILABILITY).default("UNKNOWN"),
  isPublished: z.coerce.boolean().optional(),
  specs: z.string().optional(),
})

const lines = (value: string | undefined): string[] =>
  (value ?? "")
    .split(/\r?\n/)
    .map((line) => stripHtml(line).trim())
    .filter(Boolean)
    .slice(0, 40)

async function audit(
  userId: string,
  action: string,
  entity: string,
  entityId: string | null,
  diff?: Prisma.InputJsonValue,
): Promise<void> {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      diff,
      ip: clientIp(await headers()),
    },
  })
}

function decimal(value: number | undefined): Prisma.Decimal | null {
  return value === undefined ? null : new Prisma.Decimal(value)
}

/** Create or update a catalog entry from the admin form. */
export async function upsertGuitar(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  const user = await assertRole("EDITOR")

  const raw = Object.fromEntries(formData.entries())
  const parsed = guitarSchema.safeParse(raw)
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      fieldErrors[String(issue.path[0] ?? "form")] ??= issue.message
    }
    return { status: "error", message: "Validation failed.", fieldErrors }
  }
  const input = parsed.data

  const brand = await prisma.brand.findUnique({ where: { slug: input.brandSlug } })
  if (!brand) return { status: "error", message: "Unknown brand.", fieldErrors: { brandSlug: "Unknown brand" } }

  let seriesId: string | null = null
  if (input.seriesName) {
    const series = await prisma.series.upsert({
      where: { brandId_slug: { brandId: brand.id, slug: slugify(input.seriesName) } },
      create: { brandId: brand.id, slug: slugify(input.seriesName), name: input.seriesName },
      update: { name: input.seriesName },
    })
    seriesId = series.id
  }

  let specs: Prisma.InputJsonValue = {}
  if (input.specs) {
    try {
      const value = JSON.parse(input.specs)
      if (value && typeof value === "object" && !Array.isArray(value)) specs = value
    } catch {
      return { status: "error", message: "Specs must be valid JSON.", fieldErrors: { specs: "Invalid JSON" } }
    }
  }

  const slug = slugify(`${brand.name} ${input.name}`)
  const data = {
    slug,
    name: stripHtml(input.name),
    brandId: brand.id,
    seriesId,
    category: input.category,
    model: input.model ?? null,
    sku: input.sku ?? null,
    mpn: input.mpn ?? null,
    gtin: input.gtin ?? null,
    subtype: input.subtype ?? null,
    msrp: decimal(input.msrp),
    currentBest: decimal(input.currentBest),
    currency: input.currency.toUpperCase(),
    bodyShape: input.bodyShape ?? null,
    topWood: input.topWood ?? null,
    backWood: input.backWood ?? null,
    sideWood: input.sideWood ?? null,
    neckWood: input.neckWood ?? null,
    fingerboard: input.fingerboard ?? null,
    bridge: input.bridge ?? null,
    nutMaterial: input.nutMaterial ?? null,
    scaleLengthIn: decimal(input.scaleLengthIn),
    nutWidthIn: decimal(input.nutWidthIn),
    frets: input.frets ?? null,
    strings: input.strings ?? null,
    pickupConfig: input.pickupConfig ?? null,
    electronics: input.electronics ?? null,
    finish: input.finish ?? null,
    color: input.color ?? null,
    madeIn: input.madeIn ?? null,
    year: input.year ?? null,
    weightKg: decimal(input.weightKg),
    handedness: input.handedness,
    cutaway: input.cutaway ?? null,
    electroAcoustic: input.electroAcoustic ?? null,
    caseIncluded: input.caseIncluded ?? null,
    warranty: input.warranty ?? null,
    accessories: lines(input.accessories),
    summary: input.summary ? sanitizeHtml(input.summary) : null,
    pros: lines(input.pros),
    cons: lines(input.cons),
    expertScore: decimal(input.expertScore),
    availability: input.availability,
    isPublished: input.isPublished ?? false,
    publishedAt: input.isPublished ? new Date() : null,
    specs,
  }

  const record = input.id
    ? await prisma.guitar.update({ where: { id: input.id }, data })
    : await prisma.guitar.create({ data })

  await audit(user.id, input.id ? "guitar.update" : "guitar.create", "Guitar", record.id, { slug })
  await cache.invalidate("guitars:*")
  revalidatePath("/guitars")
  revalidatePath(`/guitars/${record.slug}`)
  revalidatePath("/admin/guitars")

  return { status: "success", message: "Saved.", slug: record.slug }
}

export async function setGuitarPublished(id: string, isPublished: boolean): Promise<void> {
  const user = await assertRole("EDITOR")
  const record = await prisma.guitar.update({
    where: { id },
    data: { isPublished, publishedAt: isPublished ? new Date() : null },
    select: { slug: true, id: true },
  })
  await audit(user.id, "guitar.publish", "Guitar", record.id, { isPublished })
  await cache.invalidate("guitars:*")
  revalidatePath("/guitars")
  revalidatePath(`/guitars/${record.slug}`)
  revalidatePath("/admin/guitars")
}

export async function deleteGuitar(id: string): Promise<void> {
  const user = await assertRole("ADMIN")
  const record = await prisma.guitar.delete({ where: { id }, select: { slug: true, id: true } })
  await audit(user.id, "guitar.delete", "Guitar", record.id, { slug: record.slug })
  await cache.invalidate("guitars:*")
  revalidatePath("/guitars")
  revalidatePath("/admin/guitars")
}

export async function moderateReview(id: string, approve: boolean): Promise<void> {
  const user = await assertRole("EDITOR")
  if (approve) {
    const review = await prisma.userReview.update({
      where: { id },
      data: { isApproved: true },
      select: { guitarId: true, guitar: { select: { slug: true } } },
    })
    await recomputeUserScore(review.guitarId)
    revalidatePath(`/guitars/${review.guitar.slug}`)
  } else {
    const review = await prisma.userReview.delete({
      where: { id },
      select: { guitarId: true, guitar: { select: { slug: true } } },
    })
    await recomputeUserScore(review.guitarId)
    revalidatePath(`/guitars/${review.guitar.slug}`)
  }
  await audit(user.id, approve ? "review.approve" : "review.reject", "UserReview", id)
  revalidatePath("/admin/reviews")
}

export async function setUserRole(userId: string, role: "USER" | "EDITOR" | "ADMIN"): Promise<void> {
  const actor = await assertRole("ADMIN")
  if (actor.id === userId) throw new Error("You cannot change your own role.")
  await prisma.user.update({ where: { id: userId }, data: { role } })
  await audit(actor.id, "user.role", "User", userId, { role })
  revalidatePath("/admin/users")
}

export async function setUserBanned(userId: string, banned: boolean): Promise<void> {
  const actor = await assertRole("ADMIN")
  if (actor.id === userId) throw new Error("You cannot ban yourself.")
  await prisma.user.update({ where: { id: userId }, data: { banned } })
  await audit(actor.id, banned ? "user.ban" : "user.unban", "User", userId)
  revalidatePath("/admin/users")
}
