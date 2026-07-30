"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { CATEGORIES } from "@/config/navigation"

export function FilterSidebar() {
  const router = useRouter()
  const sp = useSearchParams()

  const setFilter = (key: string, value: string) => {
    const params = new URLSearchParams(sp.toString())
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete("page")
    router.push(`?${params.toString()}`)
  }

  const currentCategory = sp.get("category") ?? ""

  return (
    <aside className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold mb-3">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => setFilter("category", "")}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
              !currentCategory ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-muted-foreground"
            }`}
          >
            All types
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setFilter("category", cat.slug.toUpperCase())}
              className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors flex items-center gap-2 ${
                currentCategory === cat.slug.toUpperCase()
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-secondary text-muted-foreground"
              }`}
            >
              <span>{cat.icon}</span> {cat.label}
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
