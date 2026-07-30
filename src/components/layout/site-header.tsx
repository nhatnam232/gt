"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useEffect, useState } from "react"
import { ChevronDown, GitCompareArrows, Guitar, Menu } from "lucide-react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { CATEGORIES, mainNav } from "@/config/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ThemeToggle } from "@/components/layout/theme-toggle"
import { SearchTrigger } from "@/components/search/search-trigger"
import { useCompare } from "@/components/compare/use-compare"

export function SiteHeader() {
  const pathname = usePathname()
  const [elevated, setElevated] = useState(false)
  const [open, setOpen] = useState(false)
  const { count } = useCompare()
  const { scrollY } = useScroll()

  useMotionValueEvent(scrollY, "change", (value) => setElevated(value > 8))

  useEffect(() => setOpen(false), [pathname])

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href)

  return (
    <header
      className={cn(
        "sticky top-0 z-40 w-full border-b transition-shadow duration-300",
        elevated ? "glass border-border shadow-sm" : "border-transparent bg-background",
      )}
    >
      <div className="container-page flex h-16 items-center gap-3">
        <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="GuitarTribe home">
          <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm">
            <Guitar className="size-5" />
          </span>
          <span className="hidden text-[15px] font-semibold tracking-tight sm:block">
            Guitar<span className="text-primary">Tribe</span>
          </span>
        </Link>

        <nav aria-label="Main" className="ml-2 hidden items-center gap-0.5 lg:flex">
          {mainNav.map((item) =>
            item.children ? (
              <DropdownMenu key={item.label}>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="gap-1 rounded-lg px-3 text-[13.5px] font-medium text-muted-foreground hover:text-foreground"
                  >
                    {item.label}
                    <ChevronDown className="size-3.5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-[22rem] p-2">
                  <div className="grid gap-0.5">
                    {item.children.map((child) => (
                      <DropdownMenuItem key={child.href} asChild>
                        <Link href={child.href} className="flex flex-col items-start gap-0.5 py-2">
                          <span className="text-sm font-medium">{child.label}</span>
                          {child.description ? (
                            <span className="text-xs text-muted-foreground">{child.description}</span>
                          ) : null}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                key={item.href}
                asChild
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-lg px-3 text-[13.5px] font-medium",
                  isActive(item.href) ? "text-foreground" : "text-muted-foreground hover:text-foreground",
                )}
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ),
          )}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <SearchTrigger />

          <Button asChild variant="ghost" size="sm" className="relative gap-1.5 rounded-lg">
            <Link href="/compare" aria-label="Compare list">
              <GitCompareArrows className="size-4" />
              <span className="hidden sm:inline">Compare</span>
              {count > 0 ? (
                <Badge className="ml-0.5 h-5 min-w-5 justify-center px-1.5 tabular-nums">{count}</Badge>
              ) : null}
            </Link>
          </Button>

          <ThemeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="overflow-y-auto p-0">
              <SheetHeader>
                <SheetTitle>Browse</SheetTitle>
              </SheetHeader>
              <div className="space-y-6 p-5">
                <div className="space-y-1">
                  {mainNav
                    .filter((item) => !item.children)
                    .map((item) => (
                      <SheetClose asChild key={item.href}>
                        <Link
                          href={item.href}
                          className={cn(
                            "block rounded-lg px-3 py-2 text-sm font-medium transition-colors hover:bg-secondary",
                            isActive(item.href) && "bg-secondary",
                          )}
                        >
                          {item.label}
                        </Link>
                      </SheetClose>
                    ))}
                </div>
                <div>
                  <p className="eyebrow px-3 pb-2">Categories</p>
                  <div className="grid grid-cols-2 gap-1">
                    {CATEGORIES.map((category) => (
                      <SheetClose asChild key={category.slug}>
                        <Link
                          href={`/c/${category.slug}`}
                          className="rounded-lg px-3 py-2 text-sm transition-colors hover:bg-secondary"
                        >
                          {category.label}
                        </Link>
                      </SheetClose>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Category rail: fast horizontal access on tablet and up. */}
      <motion.div
        initial={false}
        animate={{ height: elevated ? 0 : "auto", opacity: elevated ? 0 : 1 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        className="hidden overflow-hidden border-t md:block"
      >
        <div className="container-page no-scrollbar flex items-center gap-1 overflow-x-auto py-2">
          {CATEGORIES.map((category) => (
            <Link
              key={category.slug}
              href={`/c/${category.slug}`}
              className={cn(
                "whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground",
                pathname === `/c/${category.slug}` && "bg-secondary text-foreground",
              )}
            >
              {category.label}
            </Link>
          ))}
          <span className="mx-1 h-4 w-px bg-border" />
          <Link
            href="/rankings"
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
          >
            Top ranking
          </Link>
          <Link
            href="/deals"
            className="whitespace-nowrap rounded-full px-3 py-1.5 text-[13px] font-medium text-primary transition-colors hover:bg-primary/10"
          >
            Deals
          </Link>
        </div>
      </motion.div>
    </header>
  )
}
