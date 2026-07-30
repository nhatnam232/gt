import Link from "next/link"
import { Plus } from "lucide-react"
import { prisma } from "@/lib/prisma"
import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatPrice } from "@/lib/utils"

export const dynamic = "force-dynamic"

export default async function AdminGuitarsPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>
}) {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))
  const params = await searchParams
  const page = Math.max(1, Number(params.page ?? 1))
  const q = params.q ?? ""
  const take = 30
  const skip = (page - 1) * take

  const where = q
    ? { OR: [{ name: { contains: q, mode: "insensitive" as const } }, { brand: { name: { contains: q, mode: "insensitive" as const } } }] }
    : {}

  const [rows, total] = await Promise.all([
    prisma.guitar.findMany({
      where,
      select: {
        id: true,
        slug: true,
        name: true,
        isPublished: true,
        currentBest: true,
        currency: true,
        expertScore: true,
        brand: { select: { name: true } },
        updatedAt: true,
      },
      orderBy: { updatedAt: "desc" },
      take,
      skip,
    }),
    prisma.guitar.count({ where }),
  ])

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Guitars ({total})</h1>
        <Button asChild size="sm">
          <Link href="/admin/guitars/new"><Plus className="size-4" /> Add guitar</Link>
        </Button>
      </div>

      <form className="mt-4">
        <input
          name="q"
          defaultValue={q}
          placeholder="Search by name or brand..."
          className="w-full max-w-sm rounded-lg border bg-background px-3 py-2 text-sm"
        />
      </form>

      <div className="mt-6 overflow-hidden rounded-xl border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b bg-secondary/50">
              <th className="px-4 py-3 text-left">Name</th>
              <th className="px-4 py-3 text-left">Brand</th>
              <th className="px-4 py-3 text-right">Price</th>
              <th className="px-4 py-3 text-right">Score</th>
              <th className="px-4 py-3 text-center">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b last:border-0 hover:bg-secondary/30">
                <td className="px-4 py-3 font-medium">{row.name}</td>
                <td className="px-4 py-3 text-muted-foreground">{row.brand.name}</td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.currentBest ? formatPrice(Number(row.currentBest), row.currency) : "-"}
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {row.expertScore ? Number(row.expertScore).toFixed(1) : "-"}
                </td>
                <td className="px-4 py-3 text-center">
                  <Badge variant={row.isPublished ? "success" : "outline"}>
                    {row.isPublished ? "Published" : "Draft"}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <Link
                    href={`/admin/guitars/${row.slug}`}
                    className="text-xs text-primary hover:underline"
                  >
                    Edit
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {Math.ceil(total / take) > 1 ? (
        <div className="mt-4 flex gap-2">
          {page > 1 ? (
            <Button asChild variant="outline" size="sm">
              <Link href={`/admin/guitars?page=${page - 1}&q=${q}`}>Previous</Link>
            </Button>
          ) : null}
          <Button asChild variant="outline" size="sm">
            <Link href={`/admin/guitars?page=${page + 1}&q=${q}`}>Next</Link>
          </Button>
        </div>
      ) : null}
    </div>
  )
}
