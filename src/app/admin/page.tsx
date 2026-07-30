import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { formatNumber } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminDashboard() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const [guitars, brands, pendingReviews, crawlJobs, users] = await Promise.all([
    prisma.guitar.count(),
    prisma.brand.count(),
    prisma.userReview.count({ where: { isApproved: false } }),
    prisma.crawlJob.count({ where: { status: { in: ["QUEUED", "RUNNING"] } } }),
    prisma.user.count(),
  ])

  const cards = [
    { label: "Guitars", value: guitars, href: "/admin/guitars" },
    { label: "Brands", value: brands, href: "/admin/guitars" },
    { label: "Pending reviews", value: pendingReviews, href: "/admin/reviews" },
    { label: "Active crawl jobs", value: crawlJobs, href: "/admin/crawler" },
    { label: "Users", value: users, href: "/admin/users" },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((card) => (
          <a key={card.label} href={card.href} className="hairline card-hover rounded-xl border bg-card p-5">
            <p className="text-xs text-muted-foreground">{card.label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums">{formatNumber(card.value)}</p>
          </a>
        ))}
      </div>
    </div>
  )
}
