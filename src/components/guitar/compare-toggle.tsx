"use client"

import { useState } from "react"
import { Check, GitCompareArrows } from "lucide-react"
import { cn } from "@/lib/utils"
import { useCompare } from "@/components/compare/use-compare"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

/** Adds/removes an instrument from the shared compare tray (cookie-backed). */
export function CompareToggle({
  slug,
  className,
  labelled = false,
}: {
  slug: string
  className?: string
  labelled?: boolean
}) {
  const { has, toggle, isFull } = useCompare()
  const [warn, setWarn] = useState(false)
  const active = has(slug)

  const onClick = (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    if (!active && isFull) {
      setWarn(true)
      setTimeout(() => setWarn(false), 1800)
      return
    }
    toggle(slug)
  }

  return (
    <Tooltip open={warn ? true : undefined}>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onClick}
          aria-pressed={active}
          aria-label={active ? "Remove from comparison" : "Add to comparison"}
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition-all",
            active
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background/90 text-muted-foreground hover:border-primary/50 hover:text-foreground",
            className,
          )}
        >
          {active ? <Check className="size-3.5" /> : <GitCompareArrows className="size-3.5" />}
          {labelled ? (active ? "In comparison" : "Compare") : null}
        </button>
      </TooltipTrigger>
      <TooltipContent>
        {warn ? "Comparison is full - remove one first" : active ? "Remove from comparison" : "Add to comparison"}
      </TooltipContent>
    </Tooltip>
  )
}
