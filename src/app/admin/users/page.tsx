import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { banUser, unbanUser, setUserRole } from "@/server/actions/admin.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

const ROLE_VARIANT: Record<string, "default" | "success" | "warning" | "destructive" | "outline"> = {
  ADMIN: "destructive",
  EDITOR: "warning",
  USER: "outline",
}

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireRole("ADMIN").catch(() => redirect("/sign-in"))

  const sp = await searchParams
  const q = sp.q?.trim() ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))
  const perPage = 30

  const where = q
    ? { OR: [
        { name: { contains: q, mode: "insensitive" as const } },
        { email: { contains: q, mode: "insensitive" as const } },
      ] }
    : {}

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
      select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
    }),
    prisma.user.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Users ({total.toLocaleString()})</h1>
        <form method="get">
          <input name="q" defaultValue={q} placeholder="Search name or email..."
            className="h-9 rounded-lg border border-input bg-background px-3 text-sm" />
        </form>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Joined</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3">
                  <Badge variant={ROLE_VARIANT[user.role] ?? "outline"}>{user.role}</Badge>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(user.createdAt.toISOString())}
                </td>
                <td className="px-4 py-3">
                  {user.banned
                    ? <Badge variant="destructive">Banned</Badge>
                    : <Badge variant="success">Active</Badge>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap justify-end gap-2">
                    {user.role !== "ADMIN" && (
                      <form action={setUserRole.bind(null, user.id, "EDITOR")}>
                        <button type="submit" className="text-xs hover:underline">Make Editor</button>
                      </form>
                    )}
                    {user.banned ? (
                      <form action={unbanUser.bind(null, user.id)}>
                        <button type="submit" className="text-xs text-primary hover:underline">Unban</button>
                      </form>
                    ) : (
                      <form action={banUser.bind(null, user.id)}>
                        <button type="submit" className="text-xs text-destructive hover:underline">Ban</button>
                      </form>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <form key={p} method="get">
              <input type="hidden" name="q" value={q} />
              <input type="hidden" name="page" value={p} />
              <Button type="submit" size="sm" variant={p === page ? "default" : "outline"}>{p}</Button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}
