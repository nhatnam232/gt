"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useCallback, useTransition } from "react"
import { SlidersHorizontal, X } from "lucide-react"
import type { FacetSet } from "@/server/repositories/facet.repository"
import type { GuitarQuery } from "@/domain/guitar/types"
import { serializeGuitarQuery, countActiveFilters } from "@/domain/guitar/query"
import { formatPrice } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

type Props = { query: GuitarQuery; facets: FacetSet }

export function FilterSidebar({ query, facets }: Props) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [pending, startTransition] = useTransition()
  const activeCount = countActiveFilters(query)

  const navigate = useCallback(
    (next: Partial<GuitarQuery>) => {
      startTransition(() => {
        const merged = { ...query, ...next, page: 1 }
        const qs = serializeGuitarQuery(merged)
        const base = searchParams.get("category")
          ? `/c/${searchParams.get("category")}`
          : "/guitars"
        router.push(qs ? `${base}?${qs}` : base)
      })
    },
    [query, router, searchParams],
  )

  const toggleList = (
    key: keyof GuitarQuery,
    value: string,
    current: string[],
  ) => {
    const next = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value]
    navigate({ [key]: next } as Partial<GuitarQuery>)
  }

  const clearAll = () =>
    startTransition(() => {
      const base = query.category
        ? `/c/${query.category.toLowerCase()}`
        : "/guitars"
      router.push(base)
    })

  const FacetGroup = ({
    title,
    items,
    selected,
    queryKey,
    max = 12,
  }: {
    title: string
    items: { value: string; label: string; count: number }[]
    selected: string[]
    queryKey: keyof GuitarQuery
    max?: number
  }) =>
    items.length === 0 ? null : (
      <AccordionItem value={title}>
        <AccordionTrigger className="text-sm">{title}</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {items.slice(0, max).map((item) => (
              <label
                key={item.value}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={selected.includes(item.value)}
                  onCheckedChange={() =>
                    toggleList(queryKey, item.value, selected)
                  }
                />
                <span className="flex-1 truncate">{item.label}</span>
                <span className="tabular-nums text-xs text-muted-foreground">
                  {item.count}
                </span>
              </label>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    )

  return (
    <aside className="sticky top-20 w-[15rem] shrink-0" aria-label="Filters">
      <div className="flex items-center justify-between pb-3">
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <SlidersHorizontal className="size-4" /> Filters
          {activeCount > 0 ? (
            <span className="rounded-full bg-primary/12 px-1.5 text-xs font-semibold text-primary">
              {activeCount}
            </span>
          ) : null}
        </span>
        {activeCount > 0 ? (
          <Button
            variant="ghost"
            size="sm"
            className="h-6 gap-1 px-2 text-xs"
            onClick={clearAll}
          >
            <X className="size-3" /> Clear
          </Button>
        ) : null}
      </div>

      <ScrollArea className="h-[calc(100dvh-7rem)] pr-1">
        <Accordion type="multiple" defaultValue={["Brand", "Price"]} className="space-y-1">
          <FacetGroup title="Brand" items={facets.brands} selected={query.brands} queryKey="brands" max={20} />
          <FacetGroup title="Body shape" items={facets.bodyShapes} selected={query.bodyShapes} queryKey="bodyShapes" />
          <FacetGroup title="Top wood" items={facets.topWoods} selected={query.topWoods} queryKey="topWoods" />
          <FacetGroup title="Back wood" items={facets.backWoods} selected={query.backWoods} queryKey="backWoods" />
          <FacetGroup title="Neck wood" items={facets.neckWoods} selected={query.neckWoods} queryKey="neckWoods" />
          <FacetGroup title="Fingerboard" items={facets.fingerboards} selected={query.fingerboards} queryKey="fingerboards" />
          <FacetGroup title="Pickups" items={facets.pickups} selected={query.pickups} queryKey="pickups" />
          <FacetGroup title="Finish" items={facets.finishes} selected={query.finishes} queryKey="finishes" />
          <FacetGroup title="Color" items={facets.colors} selected={query.colors} queryKey="colors" />
          <FacetGroup title="Country" items={facets.countries} selected={query.countries} queryKey="countries" />
          <FacetGroup title="Frets" items={facets.frets} selected={query.frets.map(String)} queryKey="frets" />
          <FacetGroup title="Strings" items={facets.strings} selected={query.strings.map(String)} queryKey="strings" />
          <FacetGroup title="Availability" items={facets.availability} selected={query.availability} queryKey="availability" />
          <FacetGroup title="Year" items={facets.years} selected={query.years.map(String)} queryKey="years" max={20} />
          <FacetGroup title="Series" items={facets.series} selected={query.series} queryKey="series" />

          {/* Price range */}
          {facets.priceRange.max > facets.priceRange.min ? (
            <AccordionItem value="Price">
              <AccordionTrigger className="text-sm">Price</AccordionTrigger>
              <AccordionContent>
                <div className="px-1 pb-2">
                  <Slider
                    min={facets.priceRange.min}
                    max={facets.priceRange.max}
                    step={50}
                    value={[
                      query.minPrice ?? facets.priceRange.min,
                      query.maxPrice ?? facets.priceRange.max,
                    ]}
                    onValueCommit={([min, max]) =>
                      navigate({ minPrice: min, maxPrice: max })
                    }
                  />
                  <div className="mt-2 flex justify-between text-xs tabular-nums text-muted-foreground">
                    <span>{formatPrice(query.minPrice ?? facets.priceRange.min)}</span>
                    <span>{formatPrice(query.maxPrice ?? facets.priceRange.max)}</span>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}

          {/* Toggles */}
          <AccordionItem value="Options">
            <AccordionTrigger className="text-sm">Options</AccordionTrigger>
            <AccordionContent>
              <div className="space-y-2">
                {[
                  { key: "leftHanded", label: "Left-handed" },
                  { key: "cutaway", label: "Cutaway" },
                  { key: "electroAcoustic", label: "Electro-acoustic" },
                ].map(({ key, label }) => (
                  <label key={key} className="flex cursor-pointer items-center gap-2 text-sm">
                    <Checkbox
                      checked={Boolean(query[key as keyof GuitarQuery])}
                      onCheckedChange={(checked) =>
                        navigate({ [key]: checked || undefined } as Partial<GuitarQuery>)
                      }
                    />
                    {label}
                  </label>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </ScrollArea>
    </aside>
  )
}
