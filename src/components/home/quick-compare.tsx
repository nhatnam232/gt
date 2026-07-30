"use client"

import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, GitCompareArrows } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { formatPrice } from "@/lib/utils"
import type { GuitarCardDto } from "@/domain/guitar/types"

/** Two-slot shortcut into the full comparison table. */
export function QuickCompare({ options }: { options: GuitarCardDto[] }) {
  const router = useRouter()
  const [left, setLeft] = useState(options[0]?.slug ?? "")
  const [right, setRight] = useState(options[1]?.slug ?? "")

  const bySlug = useMemo(
    () => new Map(options.map((option) => [option.slug, option])),
    [options],
  )

  const disabled = !left || !right || left === right

  return (
    <div className="hairline rounded-2xl border bg-card p-6 sm:p-8">
      <div className="flex items-center gap-2 text-sm font-medium">
        <GitCompareArrows className="size-4 text-primary" /> Quick comparison
      </div>
      <div className="mt-5 grid gap-4 md:grid-cols-[1fr_auto_1fr_auto] md:items-end">
        {[
          { value: left, set: setLeft, label: "First instrument" },
          { value: right, set: setRight, label: "Second instrument" },
        ].map((slot, index) => (
          <div key={slot.label} className={index === 1 ? "md:order-3" : undefined}>
            <label className="eyebrow mb-2 block">{slot.label}</label>
            <Select value={slot.value} onValueChange={slot.set}>
              <SelectTrigger>
                <SelectValue placeholder="Choose a guitar" />
              </SelectTrigger>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.slug} value={option.slug}>
                    {option.brand.name} {option.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {bySlug.get(slot.value)?.price ? (
              <p className="mt-2 text-xs tabular-nums text-muted-foreground">
                {formatPrice(
                  bySlug.get(slot.value)!.price!,
                  bySlug.get(slot.value)!.currency,
                )}
              </p>
            ) : null}
          </div>
        ))}

        <span className="hidden justify-self-center pb-2 text-sm text-muted-foreground md:order-2 md:block">
          vs
        </span>

        <Button
          className="md:order-4"
          disabled={disabled}
          onClick={() => router.push(`/compare?items=${left},${right}`)}
        >
          Compare <ArrowRight className="size-4" />
        </Button>
      </div>
      {disabled ? (
        <p className="mt-3 text-xs text-muted-foreground">
          Pick two different instruments - you can add up to five on the comparison page.
        </p>
      ) : null}
    </div>
  )
}
