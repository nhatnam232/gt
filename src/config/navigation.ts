import type { Category } from "@prisma/client"

export type CategoryMeta = {
  /** The Prisma enum value this metadata describes. */
  key: Category
  slug: string
  label: string
  plural: string
  icon: string
  description: string
  /** Short one-line description used in compact UI such as the command palette. */
  blurb: string
}

const CATEGORY_MAP: Record<Category, CategoryMeta> = {
  ACOUSTIC: { key: "ACOUSTIC", slug: "acoustic", label: "Acoustic", plural: "Acoustic Guitars", icon: "\ud83c\udfb8", description: "Steel-string and folk acoustic guitars", blurb: "Steel-string and folk" },
  ELECTRIC: { key: "ELECTRIC", slug: "electric", label: "Electric", plural: "Electric Guitars", icon: "\u26a1", description: "Solid, semi-hollow and hollow-body electrics", blurb: "Solid, semi-hollow, hollow" },
  BASS: { key: "BASS", slug: "bass", label: "Bass", plural: "Bass Guitars", icon: "\ud83c\udfb5", description: "4, 5 and 6-string bass guitars", blurb: "4, 5 and 6-string" },
  CLASSICAL: { key: "CLASSICAL", slug: "classical", label: "Classical", plural: "Classical Guitars", icon: "\ud83c\udfbc", description: "Nylon-string classical and flamenco guitars", blurb: "Nylon-string and flamenco" },
  UKULELE: { key: "UKULELE", slug: "ukulele", label: "Ukulele", plural: "Ukuleles", icon: "\ud83c\udf3a", description: "Soprano, concert, tenor and baritone ukuleles", blurb: "Soprano to baritone" },
  AMPLIFIER: { key: "AMPLIFIER", slug: "amplifiers", label: "Amplifier", plural: "Amplifiers", icon: "\ud83d\udd0a", description: "Guitar and bass amplifiers", blurb: "Guitar and bass amps" },
  PEDAL: { key: "PEDAL", slug: "pedals", label: "Pedal", plural: "Effects Pedals", icon: "\ud83c\udf9b\ufe0f", description: "Distortion, delay, reverb and other effects", blurb: "Distortion, delay, reverb" },
  ACCESSORY: { key: "ACCESSORY", slug: "accessories", label: "Accessory", plural: "Accessories", icon: "\ud83c\udf92", description: "Strings, picks, capos, straps and more", blurb: "Strings, picks, capos" },
}

export function categoryMeta(category: Category): CategoryMeta {
  return CATEGORY_MAP[category] ?? {
    key: category,
    slug: category.toLowerCase(),
    label: category,
    plural: `${category}s`,
    icon: "\ud83c\udfb8",
    description: "",
    blurb: "",
  }
}

export function categoryFromSlug(slug: string): Category | null {
  const entry = Object.entries(CATEGORY_MAP).find(([, meta]) => meta.slug === slug)
  return (entry?.[0] as Category) ?? null
}

export const CATEGORIES = Object.values(CATEGORY_MAP)

export type NavItem = {
  href: string
  label: string
  description?: string
  children?: NavItem[]
}

export type NavGroup = {
  title: string
  items: NavItem[]
}

export const NAV_LINKS: NavItem[] = [
  { href: "/guitars", label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/rankings", label: "Rankings" },
  { href: "/brands", label: "Brands" },
  { href: "/guides", label: "Guides" },
]

/** Primary navigation shown in the site header. */
export const mainNav: NavItem[] = [
  {
    href: "/guitars",
    label: "Browse",
    children: CATEGORIES.map((c) => ({
      href: `/c/${c.slug}`,
      label: c.plural,
      description: c.blurb,
    })),
  },
  { href: "/compare", label: "Compare" },
  { href: "/rankings", label: "Rankings" },
  { href: "/brands", label: "Brands" },
  {
    href: "/guides",
    label: "Learn",
    children: [
      { href: "/guides", label: "Guides" },
      { href: "/reviews", label: "Reviews" },
      { href: "/news", label: "News" },
      { href: "/deals", label: "Deals" },
    ],
  },
]

/** Grouped link columns shown in the site footer. */
export const footerNav: NavGroup[] = [
  {
    title: "Explore",
    items: [
      { href: "/guitars", label: "All instruments" },
      { href: "/compare", label: "Compare" },
      { href: "/rankings", label: "Rankings" },
      { href: "/brands", label: "Brands" },
    ],
  },
  {
    title: "Categories",
    items: CATEGORIES.slice(0, 5).map((c) => ({ href: `/c/${c.slug}`, label: c.plural })),
  },
  {
    title: "Content",
    items: [
      { href: "/guides", label: "Guides" },
      { href: "/reviews", label: "Reviews" },
      { href: "/news", label: "News" },
      { href: "/deals", label: "Deals" },
    ],
  },
  {
    title: "About",
    items: [
      { href: "/about", label: "About us" },
      { href: "/methodology", label: "Methodology" },
      { href: "/privacy", label: "Privacy" },
      { href: "/terms", label: "Terms" },
    ],
  },
]
