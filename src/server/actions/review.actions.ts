"use server"

import { prisma } from "@/lib/prisma"
import { headers } from "next/headers"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

/**
 * State shape returned by `submitReview`, designed for use with React's
 * `useActionState` hook in `components/guitar/review-form.tsx`.
 */
export type ReviewActionState = {
  status: "idle" | "success" | "error"
  message?: string
}

export const initialReviewActionState: ReviewActionState = { status: "idle" }

export async function submitReview(
  _prevState: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const h = await headers()
  const session = await auth.api.getSession({ headers: h })
  if (!session) {
    return { status: "error", message: "Must be signed in to submit a review." }
  }

  const guitarId = String(formData.get("guitarId"))
  const rating = parseFloat(String(formData.get("rating") ?? "0"))
  const title = (formData.get("title") as string)?.trim() || null
  const body = (formData.get("body") as string)?.trim() || null
  const pros = (formData.get("pros") as string)?.trim() || null
  const cons = (formData.get("cons") as string)?.trim() || null

  if (!guitarId || rating < 1 || rating > 10) {
    return { status: "error", message: "Invalid review data. Rating must be between 1 and 10." }
  }

  await prisma.userReview.upsert({
    where: { guitarId_userId: { guitarId, userId: session.user.id } },
    create: { guitarId, userId: session.user.id, rating, title, body, pros, cons, isApproved: false },
    update: { rating, title, body, pros, cons, isApproved: false },
  })

  const guitar = await prisma.guitar.findUnique({ where: { id: guitarId }, select: { slug: true } })
  if (guitar) revalidatePath(`/guitars/${guitar.slug}`)

  return { status: "success", message: "Thanks! Your review is pending approval." }
}
