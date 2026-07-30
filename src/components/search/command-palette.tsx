"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { Command } from "cmdk"
import { ArrowRight, Loader2, Search, Sparkles } from "lucide-react"
import { CATEGORIES } from "@/config/navigation"
import { formatPrice } from "@/lib/utils"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import type { SearchHit } from "@/server/services/search.service"

type Props = { open: boolean; onOpenChange: (open: boolean) => void }

/**
 * Raycast-style instant search. Debounced, abortable requests against
 * /api/search so keystrokes never queue up, with typo tolerance and highlight
 * coming straight from Meilisearch.
 */
export function CommandPalette({ open, onOpenChange }: Props) {
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [hits, setHits] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [, startTransition] = useTransition()
  const abortRef = useRef<AbortController | null>(null)

  useEffect(() => {
    if (!open) {
      setQuery("")
      setHits([])
      return
    }
  }, [open])

  useEffect(() => {
    const term = query.trim()
    if (term.length < 2) {
      setHits([])
      setLoading(false)
      return
    }

    setLoading(true)
    const timer = setTimeout(async () => {
      abortRef.current?.abort()
      const controller = new AbortController()
      abortRef.current = controller
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}&limit=8`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error("search failed")
        const data = (await response.json()) as { hits: SearchHit[] }
        setHits(data.hits ?? [])
      } catch (error) {
        if ((error as Error).name !== "AbortError") setHits([])
      } finally {
        setLoading(false)
      }
    }, 160)

    return () => clearTimeout(timer)
  }, [query])

  const go = (href: string) => {
    onOpenChange(false)
    startTransition(() => router.push(href))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="top-[12%] max-w-xl translate-y-0 gap-0 overflow-hidden p-0">
        <DialogTitle className="sr-only">Search guitars</DialogTitle>
        <Command shouldFilter={false} loop className="[&_[cmdk-group-heading]]:px-3">
          <div className="flex items-center gap-3 border-b px-4">
            <Search className="size-4 shrink-0 text-muted-foreground" />
            <Command.Input
              autoFocus
              value={query}
              onValueChange={setQuery}
              placeholder="Search by brand, model, wood or spec..."
              className="h-14 w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
            />
            {loading ? <Loader2 className="size-4 animate-spin text-muted-foreground" /> : null}
          </div>

          <Command.List className="max-h-[22rem] overflow-y-auto p-2">
            {query.trim().length >= 2 && !loading && hits.length === 0 ? (
              <Command.Empty className="px-3 py-8 text-center text-sm text-muted-foreground">
                No instruments matched &quot;{query}&quot;.
              </Command.Empty>
            ) : null}

            {hits.length > 0 ? (
              <Command.Group
                heading={
                  <span className="eyebrow">Instruments</span>
                }
              >
                {hits.map((hit) => (
                  <Command.Item
                    key={hit.slug}
                    value={hit.slug}
                    onSelect={() => go(`/guitars/${hit.slug}`)}
                    className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm data-[selected=true]:bg-secondary"
                  >
                    <span className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
                      {hit.image ? (
                        <Image
                          src={hit.image}
                          alt=""
                          fill
                          sizes="40px"
                          className="object-cover"
                          unoptimized
                        />
                      ) : null}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span
                        className="block truncate font-medium"
                        // Highlighted markup is escaped server-side before <mark> is added.
                        dangerouslySetInnerHTML={{ __html: hit.highlighted }}
                      />
                      <span className="block truncate text-xs text-muted-foreground">
                        {hit.brand} - {hit.category.toLowerCase()}
                      </span>
                    </span>
                    {hit.price ? (
                      <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
                        {formatPrice(hit.price, hit.currency)}
                      </span>
                    ) : null}
                  </Command.Item>
                ))}
                <Command.Item
                  value="__all__"
                  onSelect={() => go(`/search?q=${encodeURIComponent(query.trim())}`)}
                  className="mt-1 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 text-sm font-medium text-primary data-[selected=true]:bg-primary/10"
                >
                  <ArrowRight className="size-4" /> See all results for &quot;{query.trim()}&quot;
                </Command.Item>
              </Command.Group>
            ) : null}

            {query.trim().length < 2 ? (
              <>
                <Command.Group heading={<span className="eyebrow">Browse categories</span>}>
                  {CATEGORIES.map((category) => (
                    <Command.Item
                      key={category.slug}
                      value={category.slug}
                      onSelect={() => go(`/c/${category.slug}`)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm data-[selected=true]:bg-secondary"
                    >
                      {category.label}
                      <span className="truncate text-xs text-muted-foreground">{category.blurb}</span>
                    </Command.Item>
                  ))}
                </Command.Group>
                <Command.Group heading={<span className="eyebrow">Jump to</span>}>
                  {[
                    { label: "Compare instruments", href: "/compare" },
                    { label: "Top rankings", href: "/rankings" },
                    { label: "Brands", href: "/brands" },
                    { label: "Deals", href: "/deals" },
                  ].map((item) => (
                    <Command.Item
                      key={item.href}
                      value={item.href}
                      onSelect={() => go(item.href)}
                      className="flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2 text-sm data-[selected=true]:bg-secondary"
                    >
                      <Sparkles className="size-3.5 text-primary" /> {item.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              </>
            ) : null}
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}
