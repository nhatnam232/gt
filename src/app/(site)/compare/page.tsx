import { guitarService } from "@/server/services/guitar.service"
import { formatPrice, decimalToNumber } from "@/lib/utils"
import type { Metadata } from "next"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"

export const metadata: Metadata = { title: "Compare Guitars" }

export default async function ComparePage({
  searchParams,
}: {
  searchParams: Promise<{ slugs?: string }>
}) {
  const sp = await searchParams
  const slugs = (sp.slugs ?? "").split(",").filter(Boolean).slice(0, 5)
  const guitars = slugs.length > 0 ? await guitarService.findBySlugMany(slugs) : []

  const SPEC_ROWS: Array<{ label: string; key: string; format?: (v: unknown) => string }> = [
    { label: "Brand", key: "brandName" },
    { label: "Category", key: "category" },
    { label: "Body shape", key: "bodyShape" },
    { label: "Top wood", key: "topWood" },
    { label: "Neck wood", key: "neckWood" },
    { label: "Fingerboard", key: "fingerboard" },
    { label: "Scale length", key: "scaleLengthIn", format: (v) => v ? `${v}"` : "—" },
    { label: "Frets", key: "frets" },
    { label: "Strings", key: "strings" },
    { label: "Pickups", key: "pickupConfig" },
    { label: "Made in", key: "madeIn" },
    { label: "Price", key: "price" },
    { label: "Expert score", key: "expertScore" },
  ]

  if (guitars.length < 2) {
    return (
      <div className="container-page py-10">
        <h1 className="text-3xl font-bold">Compare Guitars</h1>
        <p className="mt-4 text-muted-foreground">
          Add guitars to compare using the <strong>Compare</strong> button on any guitar page, or browse below.
        </p>
        <div className="mt-6">
          <Button asChild><Link href="/guitars">Browse guitars</Link></Button>
        </div>
      </div>
    )
  }

  const rows = guitars.map((g) => ({
    ...g,
    brandName: g.brand.name,
    price: g.prices[0]?.price ? formatPrice(g.prices[0].price) : "—",
    expertScore: g.expertScore ? `${Number(g.expertScore).toFixed(1)} / 10` : "—",
  }))

  return (
    <div className="container-page py-10">
      <h1 className="text-3xl font-bold">Compare Guitars</h1>
      <div className="mt-8 overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 text-left px-3 py-2" />
              {guitars.map((g) => (
                <th key={g.id} className="min-w-[160px] px-3 py-2 text-left">
                  <Link href={`/guitars/${g.slug}`} className="hover:underline font-semibold">{g.name}</Link>
                  {g.images[0] && (
                    <div className="relative mt-2 aspect-square w-24 overflow-hidden rounded-lg bg-secondary/40">
                      <Image src={g.images[0].url} alt={g.name} fill className="object-contain p-2" sizes="96px" />
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {SPEC_ROWS.map((row) => (
              <tr key={row.label} className="border-t odd:bg-secondary/20">
                <td className="px-3 py-2.5 font-medium text-muted-foreground">{row.label}</td>
                {rows.map((g) => {
                  const raw = (g as Record<string, unknown>)[row.key]
                  const val = row.format ? row.format(raw) : (raw ? String(raw) : "—")
                  return <td key={g.id} className="px-3 py-2.5">{val}</td>
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
