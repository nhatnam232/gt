import { cn } from "@/lib/utils"

function tone(score: number): string {
  if (score >= 8.5) return "bg-[hsl(var(--success)/0.14)] text-[hsl(var(--success))]"
  if (score >= 7) return "bg-primary/12 text-primary"
  if (score >= 5) return "bg-[hsl(var(--warning)/0.16)] text-[hsl(var(--warning))]"
  return "bg-destructive/12 text-destructive"
}

/** Compact 0-10 score chip used on cards, tables and rankings. */
export function ScoreBadge({
  score,
  label,
  className,
  size = "sm",
}: {
  score: number | null
  label?: string
  className?: string
  size?: "sm" | "lg"
}) {
  if (score === null || Number.isNaN(score)) return null
  return (
    <span
      className={cn(
        "inline-flex items-baseline gap-1 rounded-lg font-semibold tabular-nums",
        tone(score),
        size === "lg" ? "px-2.5 py-1 text-lg" : "px-2 py-0.5 text-[13px]",
        className,
      )}
      title={label ? `${label}: ${score.toFixed(1)} / 10` : `${score.toFixed(1)} / 10`}
    >
      {score.toFixed(1)}
      <span className={cn("font-normal opacity-70", size === "lg" ? "text-xs" : "text-[10px]")}>
        /10
      </span>
    </span>
  )
}

/** Star rendering for owner ratings (1-5). */
export function StarRating({
  value,
  count,
  className,
}: {
  value: number | null
  count?: number
  className?: string
}) {
  if (value === null) return null
  const percent = Math.max(0, Math.min(100, (value / 5) * 100))
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      <span
        className="relative text-sm leading-none text-muted-foreground/40"
        aria-label={`${value.toFixed(1)} out of 5`}
      >
        <span aria-hidden>★★★★★</span>
        <span
          aria-hidden
          className="absolute inset-0 overflow-hidden text-[hsl(var(--warning))]"
          style={{ width: `${percent}%` }}
        >
          ★★★★★
        </span>
      </span>
      <span className="text-xs tabular-nums text-muted-foreground">
        {value.toFixed(1)}
        {count ? ` (${count})` : ""}
      </span>
    </span>
  )
}
