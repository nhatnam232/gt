import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { moderateReview } from "@/server/actions/admin.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const reviews = await prisma.userReview.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: { guitar: { select: { name: true, slug: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pending reviews ({reviews.length})</h1>
      <div className="mt-6 space-y-4">
        {reviews.length === 0 ? (
          <p className="text-muted-foreground">No pending reviews.</p>
        ) : reviews.map((review) => (
          <div key={review.id} className="hairline rounded-xl border bg-card p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="font-medium">{review.authorName ?? review.userId ?? "Anonymous"}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {review.guitar.name} &middot; {review.rating}/5 stars
                </p>
                {review.title ? <p className="mt-2 font-medium">{review.title}</p> : null}
                <p className="mt-2 text-sm text-muted-foreground">{review.body}</p>
              </div>
              <div className="flex gap-2">
                <form action={moderateReview.bind(null, review.id, true)}>
                  <Button type="submit" size="sm" variant="success">Approve</Button>
                </form>
                <form action={moderateReview.bind(null, review.id, false)}>
                  <Button type="submit" size="sm" variant="destructive">Reject</Button>
                </form>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
