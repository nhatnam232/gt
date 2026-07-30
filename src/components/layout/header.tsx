"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Music, Menu, X, Search, Moon, Sun, SlidersHorizontal } from "lucide-react"
import { useState } from "react"
import { useTheme } from "next-themes"
import { NAV_LINKS } from "@/config/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export function Header() {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 glass border-b">
      <div className="container-page flex h-14 items-center gap-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-base shrink-0">
          <Music className="size-5" />
          <span className="hidden sm:inline">GuitarTribe</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-1 ml-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-lg text-sm transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-secondary text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/60",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link href="/search" aria-label="Search">
              <Search className="size-4" />
            </Link>
          </Button>
          <Button variant="ghost" size="icon" asChild className="hidden sm:flex">
            <Link href="/compare" aria-label="Compare">
              <SlidersHorizontal className="size-4" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            aria-label="Toggle theme"
          >
            <Sun className="size-4 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0" />
            <Moon className="absolute size-4 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100" />
          </Button>
          {/* Mobile menu toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Menu"
          >
            {mobileOpen ? <X className="size-4" /> : <Menu className="size-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 pb-4">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "px-3 py-2 rounded-lg text-sm",
                  pathname.startsWith(link.href)
                    ? "bg-secondary font-medium"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/search" onClick={() => setMobileOpen(false)} className="flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground">
              <Search className="size-4" /> Search
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
