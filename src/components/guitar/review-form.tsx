"use client"

import { useActionState, useRef } from "react"
import { Star } from "lucide-react"
import { submitReview, type ReviewActionState } from "@/server/actions/review.actions"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input, Textarea } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const initial: ReviewActionState = { status: "idle" }

export function ReviewForm({ guitarSlug }: { guitarSlug: string }) {
  const [state, dispatch, pending] = useActionState(submitReview, initial)
  const formRef = useRef<HTMLFormElement>(null)

  if (state.status === "success") {
    return (
      <div className="hairline rounded-2xl border bg-card p-6 text-center">
        <p className="text-sm font-medium">Thank you! Your review has been submitted for moderation.</p>
        <p className="mt-1 text-xs text-muted-foreground">It will appear once approved by the editorial team.</p>
      </div>
    )
  }

  return (
    <form
      ref={formRef}
      action={dispatch}
      className="hairline space-y-5 rounded-2xl border bg-card p-6"
    >
      <input type="hidden" name="slug" value={guitarSlug} />
      <h3 className="text-base font-semibold">Write a review</h3>

      <div className="space-y-1.5">
        <Label htmlFor="authorName">Your name</Label>
        <Input id="authorName" name="authorName" placeholder="Guitar enthusiast" maxLength={80} />
        {state.fieldErrors?.authorName ? (
          <p className="text-xs text-destructive">{state.fieldErrors.authorName}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label>Rating</Label>
        <div className="flex gap-1" role="group" aria-label="Star rating">
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className="cursor-pointer">
              <input type="radio" name="rating" value={star} className="sr-only" />
              <Star className="size-6 text-muted-foreground transition-colors hover:text-[hsl(var(--warning))] peer-checked:text-[hsl(var(--warning))]" />
            </label>
          ))}
        </div>
        {state.fieldErrors?.rating ? (
          <p className="text-xs text-destructive">{state.fieldErrors.rating}</p>
        ) : null}
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="title">Summary (optional)</Label>
        <Input id="title" name="title" placeholder="Great fingerpicker for the price" maxLength={120} />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="body">Review</Label>
        <Textarea
          id="body"
          name="body"
          placeholder="Share your experience with this instrument - tone, playability, build quality..."
          rows={5}
          minLength={40}
          maxLength={4000}
        />
        {state.fieldErrors?.body ? (
          <p className="text-xs text-destructive">{state.fieldErrors.body}</p>
        ) : null}
      </div>

      {state.status === "error" && state.message ? (
        <p className="rounded-lg bg-destructive/12 px-3 py-2 text-sm text-destructive">{state.message}</p>
      ) : null}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? "Submitting..." : "Submit review"}
      </Button>
    </form>
  )
}
