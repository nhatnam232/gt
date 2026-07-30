import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import Link from "next/link"
import { LayoutDashboard, Guitar, Search, Star, Users, BarChart3 } from "lucide-react"

const NAV = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, exact: true },
  { href: "/admin/guitars", label: "Instruments", icon: Guitar },
  { href: "/admin/crawler", label: "Crawler", icon: Search },
  { href: "/admin/rankings", label: "Rankings", icon: BarChart3 },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/users", label: "Users", icon: Users },
]

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-56 shrink-0 border-r bg-card">
        <div className="sticky top-0">
          <div className="border-b px-5 py-4">
            <Link href="/" className="text-base font-semibold">GuitarTribe</Link>
            <p className="text-xs text-muted-foreground">Admin panel</p>
          </div>
          <nav className="p-3 space-y-0.5">
            {NAV.map((item) => (
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
          <div className="border-t p-3">
            <Link
              href="/"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
            >
              ← Back to site
            </Link>
          </div>
        </div>
      </aside>
      {/* Main */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
