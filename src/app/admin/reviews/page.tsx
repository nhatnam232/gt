import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { approveReview, rejectReview } from "@/server/actions/admin.actions"
import { formatDate } from "@/lib/utils"
import { Star } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

export const dynamic = "force-dynamic"

export default async function AdminReviewsPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const reviews = await prisma.userReview.findMany({
    where: { isApproved: false },
    orderBy: { createdAt: "desc" },
    take: 50,
    include: {
      user: { select: { name: true, email: true } },
      guitar: { select: { name: true, slug: true } },
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Pending reviews ({reviews.length})</h1>
      {reviews.length === 0 ? (
        <div className="mt-8 rounded-xl border bg-card p-8 text-center">
          <p className="text-muted-foreground">All caught up! No reviews pending approval.</p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="font-medium">{r.guitar.name}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    by {r.user.name} ({r.user.email}) · {formatDate(r.createdAt.toISOString())}
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="size-4 fill-amber-500 text-amber-500" />
                  <span className="font-semibold">{Number(r.rating).toFixed(1)}</span>
                </div>
              </div>
              {r.title && <p className="mt-3 font-semibold">{r.title}</p>}
              {r.body && <p className="mt-1 text-sm text-muted-foreground">{r.body}</p>}
              {(r.pros || r.cons) && (
                <div className="mt-3 flex gap-4 text-sm">
                  {r.pros && <p className="text-green-600">➕ {r.pros}</p>}
                  {r.cons && <p className="text-red-500">➖ {r.cons}</p>}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <form action={approveReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <Button size="sm" type="submit" variant="default">Approve</Button>
                </form>
                <form action={rejectReview}>
                  <input type="hidden" name="reviewId" value={r.id} />
                  <Button size="sm" type="submit" variant="destructive">Reject</Button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
