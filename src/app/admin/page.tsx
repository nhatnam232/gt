import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import {
  Guitar, Star, Users, Activity, Search, CheckCircle, Clock
} from "lucide-react"

export const dynamic = "force-dynamic"

type Stat = { label: string; value: number | string; icon: React.ComponentType<{ className?: string }>; href: string; sub?: string }

export default async function AdminDashboard() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const [guitars, brands, pendingReviews, users, runningJobs, queuedJobs] = await Promise.all([
    prisma.guitar.count(),
    prisma.brand.count(),
    prisma.userReview.count({ where: { isApproved: false } }),
    prisma.user.count(),
    prisma.crawlJob.count({ where: { status: "RUNNING" } }),
    prisma.crawlJob.count({ where: { status: "QUEUED" } }),
  ])

  const publishedGuitars = await prisma.guitar.count({ where: { isPublished: true } })

  const stats: Stat[] = [
    { label: "Total instruments", value: guitars.toLocaleString(), icon: Guitar, href: "/admin/guitars", sub: `${publishedGuitars.toLocaleString()} published` },
    { label: "Brands", value: brands.toLocaleString(), icon: Activity, href: "/admin/guitars", sub: "active" },
    { label: "Pending reviews", value: pendingReviews.toLocaleString(), icon: Star, href: "/admin/reviews", sub: pendingReviews > 0 ? "Needs attention" : "All clear" },
    { label: "Users", value: users.toLocaleString(), icon: Users, href: "/admin/users" },
    { label: "Active crawl jobs", value: runningJobs, icon: Search, href: "/admin/crawler", sub: `${queuedJobs} queued` },
  ]

  return (
    <div>
      <h1 className="text-2xl font-semibold">Dashboard</h1>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="group rounded-xl border bg-card p-5 transition-colors hover:bg-secondary/50"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <p className="mt-1.5 text-3xl font-semibold tabular-nums">{stat.value}</p>
                {stat.sub ? (
                  <p className="mt-1 text-xs text-muted-foreground">{stat.sub}</p>
                ) : null}
              </div>
              <stat.icon className="size-5 text-muted-foreground/60 group-hover:text-primary transition-colors" />
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Quick actions</h2>
          <div className="mt-4 space-y-2">
            {[
              { href: "/admin/guitars/new", label: "Add a new instrument", icon: Guitar },
              { href: "/admin/crawler", label: "Enqueue a crawl job", icon: Activity },
              { href: "/admin/reviews", label: `Review ${pendingReviews} pending submission${pendingReviews !== 1 ? "s" : ""}`, icon: Star },
              { href: "/admin/rankings", label: "Rebuild search index & rankings", icon: Search },
            ].map((action) => (
              <Link
                key={action.href}
                href={action.href}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-secondary"
              >
                <action.icon className="size-4 text-muted-foreground" />
                {action.label}
              </Link>
            ))}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5">
          <h2 className="font-semibold">Recent crawl jobs</h2>
          <RecentJobs />
        </div>
      </div>
    </div>
  )
}

async function RecentJobs() {
  const jobs = await prisma.crawlJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, target: true, status: true, itemsNew: true, startedAt: true },
  })

  if (jobs.length === 0) {
    return (
      <p className="mt-4 text-sm text-muted-foreground">No crawl jobs yet. Go to Crawler to start one.</p>
    )
  }

  return (
    <ul className="mt-4 space-y-2">
      {jobs.map((job) => (
        <li key={job.id} className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {job.status === "SUCCESS" ? (
              <CheckCircle className="size-4 text-[hsl(var(--success))]" />
            ) : job.status === "RUNNING" || job.status === "QUEUED" ? (
              <Clock className="size-4 text-muted-foreground" />
            ) : (
              <Activity className="size-4 text-destructive" />
            )}
            <span className="font-medium capitalize">{job.target}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            {job.itemsNew > 0 ? <span>+{job.itemsNew} new</span> : null}
            <span>{job.status}</span>
          </div>
        </li>
      ))}
    </ul>
  )
}
