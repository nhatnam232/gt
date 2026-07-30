"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { SORT_OPTIONS } from "@/domain/guitar/types"

export function SortBar() {
  const router = useRouter()
  const sp = useSearchParams()
  const current = sp.get("sort") ?? "relevance"

  const setSort = (sort: string) => {
    const params = new URLSearchParams(sp.toString())
    params.set("sort", sort)
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-sm text-muted-foreground">Sort:</span>
      {SORT_OPTIONS.map((opt) => (
        <button
          key={opt.value}
          onClick={() => setSort(opt.value)}
          className={`text-sm px-3 py-1.5 rounded-lg border transition-colors ${
            current === opt.value
              ? "bg-primary text-primary-foreground border-primary"
              : "bg-background text-muted-foreground border-input hover:border-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
