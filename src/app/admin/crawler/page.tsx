import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { enqueueCrawl, cancelCrawl } from "@/server/actions/ops.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const TARGETS = ["brands", "wikidata", "retailers", "prices", "normalize", "index", "rankings"]

export default async function AdminCrawlerPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const jobs = await prisma.crawlJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 30,
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Crawler</h1>

      <div className="mt-6">
        <p className="text-sm font-medium text-muted-foreground mb-3">Enqueue a crawl job</p>
        <div className="flex flex-wrap gap-2">
          {TARGETS.map((target) => (
            <form key={target} action={enqueueCrawl.bind(null, target)}>
              <Button type="submit" size="sm" variant="outline" className="capitalize">
                {target}
              </Button>
            </form>
          ))}
        </div>
      </div>

      <div className="mt-8 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">Target</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">New</th>
              <th className="px-4 py-3 text-left">Started</th>
              <th className="px-4 py-3 text-left">Error</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No jobs yet.</td></tr>
            ) : jobs.map((job) => (
              <tr key={job.id} className="border-b last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-3 font-medium capitalize">{job.target}</td>
                <td className="px-4 py-3">
                  <Badge variant={
                    job.status === "SUCCESS" ? "success" :
                    job.status === "FAILED" ? "destructive" :
                    job.status === "RUNNING" ? "default" : "outline"
                  }>{job.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{job.itemsNew}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {job.startedAt ? formatDate(job.startedAt.toISOString()) : "—"}
                </td>
                <td className="px-4 py-3 text-xs text-destructive max-w-[200px] truncate">
                  {job.error ?? ""}
                </td>
                <td className="px-4 py-3">
                  {(job.status === "QUEUED" || job.status === "RUNNING") && (
                    <form action={cancelCrawl.bind(null, job.id)}>
                      <Button size="sm" variant="outline" type="submit">Cancel</Button>
                    </form>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
