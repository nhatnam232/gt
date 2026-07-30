"use client"

import { useCallback, useEffect, useState } from "react"
import { MAX_COMPARE } from "@/config/site"

export const COMPARE_COOKIE = "gt_compare"
const EVENT = "gt:compare-changed"

function read(): string[] {
  if (typeof document === "undefined") return []
  const match = document.cookie.match(new RegExp(`(?:^|; )${COMPARE_COOKIE}=([^;]*)`))
  if (!match) return []
  return decodeURIComponent(match[1]!)
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_COMPARE)
}

function write(slugs: string[]) {
  const value = Array.from(new Set(slugs)).slice(0, MAX_COMPARE).join(",")
  document.cookie = `${COMPARE_COOKIE}=${encodeURIComponent(value)}; path=/; max-age=${60 * 60 * 24 * 30}; samesite=lax`
  window.dispatchEvent(new Event(EVENT))
}

/**
 * Cookie-backed compare tray shared by every card on the site. The same cookie
 * is read on the server by the /compare route, so the tray survives reloads and
 * can be linked/shared without any account.
 */
export function useCompare() {
  const [slugs, setSlugs] = useState<string[]>([])

  useEffect(() => {
    const sync = () => setSlugs(read())
    sync()
    window.addEventListener(EVENT, sync)
    window.addEventListener("focus", sync)
    return () => {
      window.removeEventListener(EVENT, sync)
      window.removeEventListener("focus", sync)
    }
  }, [])

  const toggle = useCallback((slug: string) => {
    const current = read()
    if (current.includes(slug)) {
      write(current.filter((s) => s !== slug))
      return false
    }
    if (current.length >= MAX_COMPARE) return false
    write([...current, slug])
    return true
  }, [])

  const remove = useCallback((slug: string) => write(read().filter((s) => s !== slug)), [])
  const clear = useCallback(() => write([]), [])

  return {
    slugs,
    count: slugs.length,
    has: (slug: string) => slugs.includes(slug),
    isFull: slugs.length >= MAX_COMPARE,
    toggle,
    remove,
    clear,
  }
}
