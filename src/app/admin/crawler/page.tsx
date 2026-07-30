import { redirect } from "next/navigation"
import { requireRole } from "@/lib/session"
import { prisma } from "@/lib/prisma"
import { enqueueCrawl, cancelCrawl } from "@/server/actions/ops.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const STATUS_VARIANT: Record<string, "default" | "success" | "destructive" | "outline" | "warning"> = {
  QUEUED: "outline",
  RUNNING: "default",
  SUCCESS: "success",
  PARTIAL: "warning",
  FAILED: "destructive",
  CANCELLED: "outline",
}

export default async function CrawlerPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const jobs = await prisma.crawlJob.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
    select: {
      id: true,
      target: true,
      status: true,
      itemsFound: true,
      itemsNew: true,
      startedAt: true,
      finishedAt: true,
      error: true,
    },
  })

  const targets = ["brands", "prices", "wikidata", "retailers"]

  return (
    <div>
      <h1 className="text-2xl font-semibold">Crawler monitor</h1>

      <div className="mt-6 flex flex-wrap gap-3">
        {targets.map((target) => (
          <form key={target} action={enqueueCrawl.bind(null, target)}>
            <Button type="submit" variant="outline" size="sm" className="capitalize">
              Enqueue {target}
            </Button>
          </form>
        ))}
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">Target</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-right">Found</th>
              <th className="px-4 py-3 text-right">New</th>
              <th className="px-4 py-3 text-left">Started</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {jobs.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">
                  No jobs yet. Enqueue one above.
                </td>
              </tr>
            ) : jobs.map((job) => (
              <tr key={job.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{job.target}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[job.status] ?? "outline"}>{job.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{job.itemsFound}</td>
                <td className="px-4 py-3 text-right tabular-nums">{job.itemsNew}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {job.startedAt ? formatDate(job.startedAt.toISOString()) : "-"}
                </td>
                <td className="px-4 py-3">
                  {job.status === "QUEUED" || job.status === "RUNNING" ? (
                    <form action={cancelCrawl.bind(null, job.id)}>
                      <button type="submit" className="text-xs text-destructive hover:underline">
                        Cancel
                      </button>
                    </form>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
