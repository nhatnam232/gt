import Link from "next/link"
import { Music } from "lucide-react"

const FOOTER_LINKS = [
  {
    heading: "Browse",
    links: [
      { href: "/guitars", label: "All Instruments" },
      { href: "/c/acoustic", label: "Acoustic" },
      { href: "/c/electric", label: "Electric" },
      { href: "/c/bass", label: "Bass" },
      { href: "/c/classical", label: "Classical" },
    ],
  },
  {
    heading: "Tools",
    links: [
      { href: "/compare", label: "Compare" },
      { href: "/rankings", label: "Rankings" },
      { href: "/brands", label: "Brands" },
      { href: "/search", label: "Search" },
    ],
  },
  {
    heading: "Content",
    links: [
      { href: "/guides", label: "Buyer's Guides" },
      { href: "/reviews", label: "Reviews" },
      { href: "/news", label: "News" },
      { href: "/deals", label: "Deals" },
    ],
  },
  {
    heading: "Company",
    links: [
      { href: "/about", label: "About" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
      { href: "/contact", label: "Contact" },
    ],
  },
]

export function Footer() {
  return (
    <footer className="border-t bg-secondary/40 mt-auto">
      <div className="container-page py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold">
              <Music className="size-5" /> GuitarTribe
            </Link>
            <p className="mt-2 text-sm text-muted-foreground max-w-[200px]">
              Independent guitar comparison engine.
            </p>
          </div>
          {/* Links */}
          {FOOTER_LINKS.map((col) => (
            <div key={col.heading}>
              <h3 className="text-xs font-semibold uppercase tracking-widest mb-3">{col.heading}</h3>
              <ul className="space-y-2">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-10 border-t pt-6 text-xs text-muted-foreground">
          © {new Date().getFullYear()} GuitarTribe. Prices and availability are approximate and may vary.
        </div>
      </div>
    </footer>
  )
}
