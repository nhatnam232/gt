"use server"

import { headers } from "next/headers"
import { revalidatePath } from "next/cache"
import { z } from "zod"
import { prisma } from "@/lib/prisma"
import { clientIp, rateLimit } from "@/lib/rate-limit"
import { stripHtml } from "@/lib/sanitize"
import { currentUser } from "@/lib/session"

export type ReviewActionState = {
  status: "idle" | "success" | "error"
  message?: string
  fieldErrors?: Record<string, string>
}

const schema = z.object({
  slug: z.string().min(1).max(140),
  rating: z.coerce.number().int().min(1).max(5),
  title: z.string().max(120).optional(),
  body: z.string().min(40, "Please write at least 40 characters.").max(4000),
  authorName: z.string().max(80).optional(),
})

/**
 * Public review submission. Rate limited per IP, HTML-stripped, and held for
 * moderation (isApproved = false) so scores can never be poisoned anonymously.
 */
export async function submitReview(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const parsed = schema.safeParse({
    slug: formData.get("slug"),
    rating: formData.get("rating"),
    title: formData.get("title") || undefined,
    body: formData.get("body"),
    authorName: formData.get("authorName") || undefined,
  })

  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form")
      fieldErrors[key] ??= issue.message
    }
    return { status: "error", message: "Please check the form.", fieldErrors }
  }

  const ip = clientIp(await headers())
  const verdict = await rateLimit(`review:${ip}`, { name: "review", max: 5, window: "1 h" })
  if (!verdict.success) {
    return { status: "error", message: "Too many submissions. Please try again later." }
  }

  const guitar = await prisma.guitar.findUnique({
    where: { slug: parsed.data.slug },
    select: { id: true, slug: true },
  })
  if (!guitar) return { status: "error", message: "Instrument not found." }

  const user = await currentUser()

  await prisma.userReview.create({
    data: {
      guitarId: guitar.id,
      userId: user?.id ?? null,
      authorName: user?.name ?? stripHtml(parsed.data.authorName ?? "").slice(0, 80) || null,
      rating: parsed.data.rating,
      title: parsed.data.title ? stripHtml(parsed.data.title) : null,
      body: stripHtml(parsed.data.body),
      isApproved: false,
    },
  })

  revalidatePath(`/guitars/${guitar.slug}`)

  return {
    status: "success",
    message: "Thanks! Your review is queued for moderation and will appear shortly.",
  }
}

/** Recompute the aggregate owner rating from approved reviews only. */
export async function recomputeUserScore(guitarId: string): Promise<void> {
  const aggregate = await prisma.userReview.aggregate({
    where: { guitarId, isApproved: true },
    _avg: { rating: true },
    _count: { _all: true },
  })
  const average = aggregate._avg.rating
  await prisma.guitar.update({
    where: { id: guitarId },
    data: {
      userScore: average === null ? null : Number(average.toFixed(1)),
      userScoreCount: aggregate._count._all,
    },
  })
}
