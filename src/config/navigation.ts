import type { Category } from "@prisma/client"

export type CategoryMeta = {
  slug: string
  label: string
  plural: string
  icon: string
  description: string
}

const CATEGORY_MAP: Record<Category, CategoryMeta> = {
  ACOUSTIC: { slug: "acoustic", label: "Acoustic", plural: "Acoustic Guitars", icon: "🎸", description: "Steel-string and folk acoustic guitars" },
  ELECTRIC: { slug: "electric", label: "Electric", plural: "Electric Guitars", icon: "⚡", description: "Solid, semi-hollow and hollow-body electrics" },
  BASS: { slug: "bass", label: "Bass", plural: "Bass Guitars", icon: "🎵", description: "4, 5 and 6-string bass guitars" },
  CLASSICAL: { slug: "classical", label: "Classical", plural: "Classical Guitars", icon: "🎼", description: "Nylon-string classical and flamenco guitars" },
  UKULELE: { slug: "ukulele", label: "Ukulele", plural: "Ukuleles", icon: "🌺", description: "Soprano, concert, tenor and baritone ukuleles" },
  AMPLIFIER: { slug: "amplifiers", label: "Amplifier", plural: "Amplifiers", icon: "🔊", description: "Guitar and bass amplifiers" },
  PEDAL: { slug: "pedals", label: "Pedal", plural: "Effects Pedals", icon: "🎛️", description: "Distortion, delay, reverb and other effects" },
  ACCESSORY: { slug: "accessories", label: "Accessory", plural: "Accessories", icon: "🎒", description: "Strings, picks, capos, straps and more" },
}

export function categoryMeta(category: Category): CategoryMeta {
  return CATEGORY_MAP[category] ?? {
    slug: category.toLowerCase(),
    label: category,
    plural: `${category}s`,
    icon: "🎸",
    description: "",
  }
}

export function categoryFromSlug(slug: string): Category | null {
  const entry = Object.entries(CATEGORY_MAP).find(([, meta]) => meta.slug === slug)
  return (entry?.[0] as Category) ?? null
}

export const CATEGORIES = Object.values(CATEGORY_MAP)

export const NAV_LINKS = [
  { href: "/guitars", label: "Browse" },
  { href: "/compare", label: "Compare" },
  { href: "/rankings", label: "Rankings" },
  { href: "/brands", label: "Brands" },
  { href: "/guides", label: "Guides" },
]
