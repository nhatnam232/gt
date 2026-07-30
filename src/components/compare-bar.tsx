"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { X, SlidersHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { COMPARE_COOKIE, MAX_COMPARE } from "@/config/site"

function getCookieValue(name: string): string[] {
  if (typeof document === "undefined") return []
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`)) 
  if (!match) return []
  try { return JSON.parse(decodeURIComponent(match[1])) } catch { return [] }
}

function setCookieValue(name: string, value: string[]) {
  document.cookie = `${name}=${encodeURIComponent(JSON.stringify(value))}; path=/; max-age=${60 * 60 * 24 * 30}`
}

export function useCompare() {
  const [slugs, setSlugs] = useState<string[]>([])

  useEffect(() => {
    setSlugs(getCookieValue(COMPARE_COOKIE))
  }, [])

  const toggle = (slug: string) => {
    setSlugs((prev) => {
      const next = prev.includes(slug) ? prev.filter((s) => s !== slug) : prev.length < MAX_COMPARE ? [...prev, slug] : prev
      setCookieValue(COMPARE_COOKIE, next)
      return next
    })
  }

  const clear = () => {
    setSlugs([])
    setCookieValue(COMPARE_COOKIE, [])
  }

  return { slugs, toggle, clear, isFull: slugs.length >= MAX_COMPARE }
}

export function CompareBar() {
  const { slugs, clear } = useCompare()

  if (slugs.length < 2) return null

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40">
      <div className="glass rounded-2xl px-5 py-3 shadow-xl flex items-center gap-4">
        <SlidersHorizontal className="size-4 text-muted-foreground" />
        <span className="text-sm font-medium">{slugs.length} selected</span>
        <Button size="sm" asChild>
          <Link href={`/compare?slugs=${slugs.join(",")}`}>Compare</Link>
        </Button>
        <Button size="icon" variant="ghost" onClick={clear} className="size-7">
          <X className="size-4" />
        </Button>
      </div>
    </div>
  )
}
