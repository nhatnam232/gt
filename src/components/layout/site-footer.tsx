import Link from "next/link"
import { Guitar } from "lucide-react"
import { footerNav } from "@/config/navigation"
import { siteConfig } from "@/config/site"

export function SiteFooter() {
  return (
    <footer className="mt-20 border-t bg-secondary/30">
      <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-2">
            <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">
              <Guitar className="size-5" />
            </span>
            <span className="text-[15px] font-semibold">
              Guitar<span className="text-primary">Tribe</span>
            </span>
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            {siteConfig.description}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Specifications are aggregated from manufacturer documentation and public catalogues.
            Prices are indicative and change frequently - always confirm with the retailer.
          </p>
        </div>

        {footerNav.map((group) => (
          <nav key={group.title} aria-label={group.title}>
            <p className="eyebrow">{group.title}</p>
            <ul className="mt-3 space-y-2">
              {group.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t">
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} {siteConfig.name}. Independent and not affiliated with
            any manufacturer.
          </p>
          <div className="flex items-center gap-4">
            <Link href="/how-we-score" className="hover:text-foreground">
              How we score
            </Link>
            <Link href="/data-sources" className="hover:text-foreground">
              Data sources
            </Link>
            <Link href="/sitemap.xml" className="hover:text-foreground">
              Sitemap
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
