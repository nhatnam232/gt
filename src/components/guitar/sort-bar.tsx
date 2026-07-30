"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useTransition } from "react"
import { LayoutGrid, List } from "lucide-react"
import type { GuitarQuery, SortKey } from "@/domain/guitar/types"
import { SORT_OPTIONS } from "@/domain/guitar/types"
import { serializeGuitarQuery } from "@/domain/guitar/query"
import { formatNumber } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export function SortBar({
  query,
  total,
  view,
  onViewChange,
}: {
  query: GuitarQuery
  total: number
  view: "grid" | "list"
  onViewChange: (view: "grid" | "list") => void
}) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const onSort = (sort: string) =>
    startTransition(() => {
      const qs = serializeGuitarQuery({ ...query, sort: sort as SortKey, page: 1 })
      const base = query.category
        ? `/c/${query.category.toLowerCase()}`
        : "/guitars"
      router.push(qs ? `${base}?${qs}` : base)
    })

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-4">
      <p className="text-sm text-muted-foreground">
        <span className="font-medium tabular-nums text-foreground">{formatNumber(total)}</span>{" "}
        instrument{total !== 1 ? "s" : ""}
      </p>
      <div className="flex items-center gap-2">
        <Select value={query.sort} onValueChange={onSort}>
          <SelectTrigger className="h-9 w-[10rem] text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {SORT_OPTIONS.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="flex overflow-hidden rounded-lg border">
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none border-0 h-9 w-9 ${ view === "grid" ? "bg-secondary" : ""}`}
            onClick={() => onViewChange("grid")}
            aria-label="Grid view"
          >
            <LayoutGrid className="size-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className={`rounded-none border-0 border-l h-9 w-9 ${ view === "list" ? "bg-secondary" : ""}`}
            onClick={() => onViewChange("list")}
            aria-label="List view"
          >
            <List className="size-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
