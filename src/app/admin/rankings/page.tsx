import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { triggerReindex } from "@/server/actions/ops.actions"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminRankingsPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const rankings = await prisma.ranking.findMany({
    orderBy: { updatedAt: "desc" },
    take: 30,
    select: {
      id: true,
      slug: true,
      name: true,
      category: true,
      updatedAt: true,
      _count: { select: { entries: true } },
    },
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Rankings & Search index</h1>
        <form action={triggerReindex}>
          <Button type="submit" size="sm">Reindex search + rebuild rankings</Button>
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">Entries</th>
              <th className="px-4 py-3 text-left">Last updated</th>
            </tr>
          </thead>
          <tbody>
            {rankings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                  No rankings yet. Run the ETL pipeline to generate them.
                </td>
              </tr>
            ) : rankings.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <td className="px-4 py-3 font-medium">{r.name}</td>
                <td className="px-4 py-3">
                  {r.category ? <Badge variant="outline">{r.category}</Badge> : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{r._count.entries}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(r.updatedAt.toISOString())}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
