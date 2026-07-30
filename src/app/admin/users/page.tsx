import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { setUserRole, setUserBanned } from "@/server/actions/admin.actions"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

export const dynamic = "force-dynamic"

export default async function AdminUsersPage() {
  await requireRole("ADMIN").catch(() => redirect("/sign-in"))

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
    select: { id: true, name: true, email: true, role: true, banned: true, createdAt: true },
  })

  return (
    <div>
      <h1 className="text-2xl font-semibold">Users ({users.length})</h1>
      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Role</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b last:border-0">
                <td className="px-4 py-3">
                  <p className="font-medium">{user.name ?? "-"}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </td>
                <td className="px-4 py-3"><Badge variant="outline">{user.role}</Badge></td>
                <td className="px-4 py-3">
                  <Badge variant={user.banned ? "destructive" : "success"}>
                    {user.banned ? "Banned" : "Active"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-2">
                    <form action={setUserRole.bind(null, user.id, user.role === "ADMIN" ? "USER" : "EDITOR")}>
                      <Button type="submit" variant="outline" size="sm">
                        {user.role === "ADMIN" ? "Demote" : "Make editor"}
                      </Button>
                    </form>
                    <form action={setUserBanned.bind(null, user.id, !user.banned)}>
                      <Button type="submit" variant={user.banned ? "outline" : "destructive"} size="sm">
                        {user.banned ? "Unban" : "Ban"}
                      </Button>
                    </form>
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
