"use client"

import dynamic from "next/dynamic"
import { useEffect, useState } from "react"
import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"

// The palette (cmdk + fetching) is only loaded once the user actually searches.
const CommandPalette = dynamic(
  () => import("@/components/search/command-palette").then((m) => m.CommandPalette),
  { ssr: false },
)

export function SearchTrigger({ variant = "compact" }: { variant?: "compact" | "full" }) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.key === "k" && (event.metaKey || event.ctrlKey)) || event.key === "/") {
        const target = event.target as HTMLElement | null
        const typing =
          target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA" || target.isContentEditable)
        if (event.key === "/" && typing) return
        event.preventDefault()
        setOpen(true)
      }
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <>
      {variant === "compact" ? (
        <Button
          variant="outline"
          size="sm"
          onClick={() => setOpen(true)}
          className="gap-2 rounded-full pr-1.5 text-muted-foreground sm:min-w-[13rem] sm:justify-between"
        >
          <span className="flex items-center gap-2">
            <Search className="size-4" />
            <span className="hidden sm:inline">Search guitars...</span>
          </span>
          <kbd className="hidden rounded border bg-muted px-1.5 py-0.5 font-[family-name:var(--font-mono)] text-[10px] sm:inline">
            ⌘K
          </kbd>
        </Button>
      ) : (
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="group flex w-full items-center gap-3 rounded-2xl border bg-card/80 px-5 py-4 text-left shadow-sm backdrop-blur transition-all hover:shadow-md"
        >
          <Search className="size-5 text-muted-foreground" />
          <span className="flex-1 text-[15px] text-muted-foreground">
            Search 100+ brands - try &quot;Yamaha FG800&quot; or &quot;solid spruce dreadnought&quot;
          </span>
          <kbd className="hidden rounded border bg-muted px-2 py-1 font-[family-name:var(--font-mono)] text-[11px] text-muted-foreground sm:inline">
            ⌘K
          </kbd>
        </button>
      )}
      <CommandPalette open={open} onOpenChange={setOpen} />
    </>
  )
}
