import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import Link from "next/link"
import { Plus, Pencil } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminGuitarsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>
}) {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const sp = await searchParams
  const q = sp.q?.trim() ?? ""
  const page = Math.max(1, Number(sp.page ?? 1))
  const perPage = 30

  const where = q
    ? {
        OR: [
          { name: { contains: q, mode: "insensitive" as const } },
          { brand: { name: { contains: q, mode: "insensitive" as const } } },
          { model: { contains: q, mode: "insensitive" as const } },
        ],
      }
    : {}

  const [guitars, total] = await Promise.all([
    prisma.guitar.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: perPage,
      skip: (page - 1) * perPage,
      include: { brand: { select: { name: true } } },
    }),
    prisma.guitar.count({ where }),
  ])

  const totalPages = Math.ceil(total / perPage)

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">Instruments ({total.toLocaleString()})</h1>
        <div className="flex gap-3">
          <form method="get">
            <input
              name="q"
              defaultValue={q}
              placeholder="Search..."
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm w-48"
            />
          </form>
          <Button asChild size="sm">
            <Link href="/admin/guitars/new">
              <Plus className="size-4" /> Add instrument
            </Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-left">Category</th>
              <th className="px-4 py-3 text-right">MSRP</th>
              <th className="px-4 py-3 text-left">Status</th>
              <th className="px-4 py-3 text-left">Updated</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {guitars.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                  No instruments found.
                </td>
              </tr>
            ) : guitars.map((g) => (
              <tr key={g.id} className="border-b last:border-0 hover:bg-secondary/20">
                <td className="px-4 py-3">
                  <p className="font-medium">{g.name}</p>
                  {g.model ? <p className="text-xs text-muted-foreground">{g.model}</p> : null}
                </td>
                <td className="px-4 py-3">{g.brand.name}</td>
                <td className="px-4 py-3">
                  <Badge variant="outline">{g.category}</Badge>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {g.msrp ? `$${Number(g.msrp).toLocaleString()}` : "—"}
                </td>
                <td className="px-4 py-3">
                  {g.isPublished
                    ? <Badge variant="success">Published</Badge>
                    : <Badge variant="outline">Draft</Badge>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {formatDate(g.updatedAt.toISOString())}
                </td>
                <td className="px-4 py-3">
                  <Button variant="ghost" size="icon-sm" asChild>
                    <Link href={`/admin/guitars/${g.slug}`}>
                      <Pencil className="size-3.5" />
                    </Link>
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {Array.from({ length: Math.min(totalPages, 10) }, (_, i) => i + 1).map((p) => (
            <form key={p} method="get">
              {q && <input type="hidden" name="q" value={q} />}
              <input type="hidden" name="page" value={p} />
              <Button type="submit" size="sm" variant={p === page ? "default" : "outline"}>
                {p}
              </Button>
            </form>
          ))}
        </div>
      )}
    </div>
  )
}
