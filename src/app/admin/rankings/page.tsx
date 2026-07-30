import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { rebuildRankings, reindex } from "@/server/actions/ops.actions"
import { rankingService } from "@/server/services/ranking.service"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminRankingsPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))
  const rankings = await rankingService.index()

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Rankings</h1>
        <div className="flex gap-2">
          <form action={rebuildRankings}>
            <Button type="submit" variant="outline" size="sm">Rebuild rankings</Button>
          </form>
          <form action={reindex}>
            <Button type="submit" variant="outline" size="sm">Reindex search</Button>
          </form>
        </div>
      </div>
      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">Ranking</th>
              <th className="px-4 py-3 text-right">Entries</th>
              <th className="px-4 py-3 text-left">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {rankings.length === 0 ? (
              <tr><td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">No rankings yet. Click Rebuild rankings.</td></tr>
            ) : rankings.map((ranking) => (
              <tr key={ranking.slug} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{ranking.title}</td>
                <td className="px-4 py-3 text-right tabular-nums">{ranking.count}</td>
                <td className="px-4 py-3 text-muted-foreground">{formatDate(ranking.updatedAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
