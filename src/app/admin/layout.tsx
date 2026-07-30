import { redirect } from "next/navigation"
import Link from "next/link"
import {
  BarChart2,
  BookOpen,
  Database,
  GitCompareArrows,
  Guitar,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Settings,
  Users,
} from "lucide-react"
import { requireRole } from "@/lib/session"
import { authClient } from "@/lib/auth-client"

const nav = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/guitars", label: "Guitars", icon: Guitar },
  { href: "/admin/crawler", label: "Crawler", icon: Database },
  { href: "/admin/rankings", label: "Rankings", icon: ListChecks },
  { href: "/admin/reviews", label: "Reviews", icon: BookOpen },
  { href: "/admin/users", label: "Users", icon: Users },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart2 },
  { href: "/admin/logs", label: "Logs", icon: Settings },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireRole("EDITOR").catch(() => null)
  if (!user) redirect("/sign-in")

  return (
    <div className="flex min-h-dvh">
      <aside className="sticky top-0 flex h-dvh w-56 shrink-0 flex-col border-r bg-card">
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Guitar className="size-5 text-primary" />
          <span className="text-sm font-semibold">GT Admin</span>
        </div>
        <nav className="flex-1 space-y-1 p-3">
          {nav.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
            >
              <item.icon className="size-4" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="border-t p-4">
          <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          <form action={async () => { "use server"; redirect("/sign-in") }}>
            <button type="submit" className="mt-2 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground">
              <LogOut className="size-3.5" /> Sign out
            </button>
          </form>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
