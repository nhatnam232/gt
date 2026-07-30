import type { Category } from "@prisma/client"

export type CategoryMeta = {
  key: Category
  slug: string
  label: string
  blurb: string
}

/**
 * Single source of truth for category routing. Nav, listing routes, sitemap and
 * static params all derive from this array (DRY).
 */
export const CATEGORIES: CategoryMeta[] = [
  { key: "ACOUSTIC", slug: "acoustic", label: "Acoustic", blurb: "Dreadnought, OM, grand auditorium and parlour steel-strings." },
  { key: "ELECTRIC", slug: "electric", label: "Electric", blurb: "Solidbody, semi-hollow and hollowbody electrics." },
  { key: "BASS", slug: "bass", label: "Bass", blurb: "4, 5 and 6 string electric and acoustic basses." },
  { key: "CLASSICAL", slug: "classical", label: "Classical", blurb: "Nylon-string classical and flamenco instruments." },
  { key: "UKULELE", slug: "ukulele", label: "Ukulele", blurb: "Soprano, concert, tenor and baritone ukuleles." },
  { key: "AMPLIFIER", slug: "amplifier", label: "Amplifier", blurb: "Tube, solid-state and modelling amps and cabinets." },
  { key: "PEDAL", slug: "pedal", label: "Pedal", blurb: "Drive, modulation, delay, reverb and multi-FX." },
  { key: "ACCESSORY", slug: "accessories", label: "Accessories", blurb: "Strings, cases, tuners, capos, straps and cables." },
]

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug)

export const categoryMeta = (key: Category) =>
  CATEGORIES.find((c) => c.key === key) ?? CATEGORIES[0]!

export type NavItem = {
  label: string
  href: string
  description?: string
  children?: NavItem[]
}

export const mainNav: NavItem[] = [
  { label: "Home", href: "/" },
  { label: "Brands", href: "/brands", description: "Every manufacturer we track" },
  {
    label: "Categories",
    href: "/guitars",
    children: CATEGORIES.map((c) => ({ label: c.label, href: `/c/${c.slug}`, description: c.blurb })),
  },
  { label: "Compare", href: "/compare", description: "Up to 5 instruments side by side" },
  { label: "Top Ranking", href: "/rankings", description: "Curated best-of lists" },
  { label: "Reviews", href: "/reviews" },
  { label: "Guides", href: "/guides" },
  { label: "News", href: "/news" },
  { label: "Deals", href: "/deals" },
]

export const footerNav: { title: string; items: NavItem[] }[] = [
  { title: "Catalog", items: CATEGORIES.map((c) => ({ label: c.label, href: `/c/${c.slug}` })) },
  {
    title: "Discover",
    items: [
      { label: "All guitars", href: "/guitars" },
      { label: "Brands", href: "/brands" },
      { label: "Rankings", href: "/rankings" },
      { label: "Compare", href: "/compare" },
      { label: "Deals", href: "/deals" },
    ],
  },
  {
    title: "Editorial",
    items: [
      { label: "Reviews", href: "/reviews" },
      { label: "Buying guides", href: "/guides" },
      { label: "News", href: "/news" },
    ],
  },
  {
    title: "About",
    items: [
      { label: "How we score", href: "/how-we-score" },
      { label: "Data sources", href: "/data-sources" },
    ],
  },
]
