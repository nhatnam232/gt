"use client"

import { useActionState, useEffect, useState } from "react"
import { RefreshCw } from "lucide-react"
import { enqueueCrawl, cancelCrawl } from "@/server/actions/ops.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"

type CrawlJob = {
  id: string
  target: string
  status: string
  itemsFound: number
  itemsNew: number
  startedAt: string | null
  finishedAt: string | null
  error: string | null
}

export default function CrawlerPage() {
  const [jobs, setJobs] = useState<CrawlJob[]>([])
  const [loading, setLoading] = useState(true)

  const loadJobs = () => {
    setLoading(true)
    fetch("/api/admin/crawl-jobs")
      .then((res) => res.json())
      .then((data) => setJobs(data as CrawlJob[]))
      .finally(() => setLoading(false))
  }

  useEffect(() => { loadJobs() }, [])

  const STATUS_VARIANT: Record<string, "default" | "success" | "destructive" | "outline" | "warning"> = {
    QUEUED: "outline",
    RUNNING: "default",
    SUCCESS: "success",
    PARTIAL: "warning",
    FAILED: "destructive",
    CANCELLED: "outline",
  }

  const targets = ["brands", "prices", "wikidata", "retailers"]

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Crawler monitor</h1>
        <Button variant="outline" size="sm" onClick={loadJobs} className="gap-2">
          <RefreshCw className="size-4" /> Refresh
        </Button>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {targets.map((target) => (
          <form key={target} action={async () => { "use server"; await enqueueCrawl(target) }}>
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
            {loading ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : jobs.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-muted-foreground">No jobs yet. Enqueue one above.</td></tr>
            ) : jobs.map((job) => (
              <tr key={job.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{job.target}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[job.status] ?? "outline"}>{job.status}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{job.itemsFound}</td>
                <td className="px-4 py-3 text-right tabular-nums">{job.itemsNew}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {job.startedAt ? new Date(job.startedAt).toLocaleString() : "-"}
                </td>
                <td className="px-4 py-3">
                  {job.status === "QUEUED" || job.status === "RUNNING" ? (
                    <form action={async () => { "use server"; await cancelCrawl(job.id) }}>
                      <button type="submit" className="text-xs text-destructive hover:underline">Cancel</button>
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
