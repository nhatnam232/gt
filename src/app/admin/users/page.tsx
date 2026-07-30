import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { banUser, unbanUser, changeUserRole } from "@/server/actions/admin.actions"
import { formatDate } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  await requireRole("ADMIN").catch(() => redirect("/sign-in"))
  const sp = await searchParams
  const q = sp.q?.trim() ?? ""

  const users = await prisma.user.findMany({
    where: q ? {
      OR: [
        { name: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ],
    } : undefined,
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true, _count: { select: { reviews: true } } },
  })

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Users ({users.length})</h1>
        <form method="get">
          <input name="q" defaultValue={q} placeholder="Search..." className="h-9 rounded-lg border border-input bg-background px-3 text-sm w-48" />
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-right">Reviews</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-b last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{u.name}</p>
                  <p className="text-xs text-muted-foreground">{u.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{u.role}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{u._count.reviews}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatDate(u.createdAt.toISOString())}</td>
                <td className="px-4 py-3">
                  {u.banned ? <Badge variant="destructive">Banned</Badge> : <Badge variant="success">Active</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    {u.banned ? (
                      <form action={async () => { "use server"; await unbanUser(u.id) }}>
                        <Button size="sm" variant="outline" type="submit">Unban</Button>
                      </form>
                    ) : (
                      <form action={async () => { "use server"; await banUser(u.id) }}>
                        <Button size="sm" variant="destructive" type="submit">Ban</Button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
