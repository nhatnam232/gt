"use client"

import { useEffect, useMemo, useState } from "use"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { GitCompareArrows, Share2, Trash2, X } from "lucide-react"
import { useCompare } from "@/components/compare/use-compare"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { ScoreBadge, StarRating } from "@/components/guitar/score-badge"
import { Badge } from "@/components/ui/badge"
import { cn, formatPrice } from "@/lib/utils"
import type { CompareResult } from "@/server/services/compare.service"

export default function ComparePage() {
  const { slugs, remove, clear } = useCompare()
  const searchParams = useSearchParams()
  const router = useRouter()
  const [result, setResult] = useState<CompareResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [hideSame, setHideSame] = useState(false)

  // Support ?items=slug1,slug2 for shareable links
  const initialItems = searchParams.get("items")
  const effectiveSlugs = useMemo(() => {
    const fromUrl = initialItems?.split(",").map((s) => s.trim()).filter(Boolean) ?? []
    return fromUrl.length >= 2 ? fromUrl : slugs
  }, [initialItems, slugs])

  useEffect(() => {
    if (effectiveSlugs.length < 2) { setResult(null); return }
    setLoading(true)
    fetch(`/api/compare?items=${effectiveSlugs.join(",")}`)
      .then((res) => res.json())
      .then(setResult)
      .finally(() => setLoading(false))
  }, [effectiveSlugs.join(",")])

  const share = () => {
    const url = `${window.location.origin}/compare?items=${effectiveSlugs.join(",")}`
    void navigator.clipboard.writeText(url)
  }

  const printPdf = () => window.print()

  if (effectiveSlugs.length < 2) {
    return (
      <div className="container-page flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <GitCompareArrows className="size-12 text-muted-foreground" />
        <h1 className="text-2xl font-semibold">Compare instruments</h1>
        <p className="max-w-md text-muted-foreground">
          Add at least two instruments to your comparison tray using the Compare button on any
          guitar card or detail page.
        </p>
        <Button asChild>
          <Link href="/guitars">Browse the catalogue</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container-page py-10">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold">
          Comparing {effectiveSlugs.length} instruments
        </h1>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2">
            <Switch id="hide-same" checked={hideSame} onCheckedChange={setHideSame} />
            <Label htmlFor="hide-same" className="text-sm">Hide identical rows</Label>
          </div>
          <Button variant="outline" size="sm" onClick={share} className="gap-1.5">
            <Share2 className="size-4" /> Copy link
          </Button>
          <Button variant="outline" size="sm" onClick={printPdf} className="gap-1.5">
            Export PDF
          </Button>
          <Button variant="ghost" size="sm" onClick={clear} className="gap-1.5">
            <Trash2 className="size-4" /> Clear
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-muted-foreground">Loading comparison...</div>
      ) : result ? (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr>
                <th className="sticky left-0 z-10 w-[200px] bg-background/95 pb-4 pr-4 text-left align-bottom text-base font-semibold backdrop-blur">
                  Specification
                </th>
                {result.guitars.map((guitar, i) => (
                  <th key={guitar.slug} className="min-w-[200px] pb-4 pl-4 text-left align-bottom">
                    <div className="space-y-2">
                      {guitar.image ? (
                        <img
                          src={guitar.image.url}
                          alt={guitar.name}
                          className="h-28 w-full rounded-xl border bg-muted object-contain p-3"
                        />
                      ) : null}
                      <p className="text-xs font-medium text-muted-foreground">{guitar.brand.name}</p>
                      <p className="font-semibold leading-snug">{guitar.name}</p>
                      <ScoreBadge score={guitar.expertScore} label="Expert" />
                      {guitar.price ? (
                        <p className="text-base font-semibold tabular-nums">
                          {formatPrice(guitar.price, guitar.currency)}
                        </p>
                      ) : null}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 px-2 text-xs text-muted-foreground"
                        onClick={() => remove(guitar.slug)}
                      >
                        <X className="size-3" /> Remove
                      </Button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {result.groups.map((group) => {
                const visibleRows = hideSame
                  ? group.rows.filter((row) => row.differs)
                  : group.rows
                if (visibleRows.length === 0) return null
                return (
                  <>
                    <tr key={group.key}>
                      <td
                        colSpan={result.guitars.length + 1}
                        className="sticky left-0 bg-secondary/60 px-2 py-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"
                      >
                        {group.label}
                      </td>
                    </tr>
                    {visibleRows.map((row) => (
                      <tr
                        key={row.key}
                        className={cn(
                          "border-b",
                          row.differs && "bg-primary/4",
                        )}
                      >
                        <td className="sticky left-0 bg-background/95 py-2.5 pr-4 font-medium backdrop-blur">
                          {row.label}
                        </td>
                        {row.cells.map((cell, i) => (
                          <td
                            key={i}
                            className={cn(
                              "py-2.5 pl-4 tabular-nums",
                              row.bestIndex === i && "font-semibold text-primary",
                            )}
                          >
                            {cell.display}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  )
}
