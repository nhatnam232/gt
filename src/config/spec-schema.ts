import type { Category } from "@prisma/client"

export type SpecValueKind = "text" | "number" | "boolean" | "list" | "currency"

export type SpecField = {
  /** Prisma column on Guitar, or a `specs` JSON key when `json` is true. */
  key: string
  label: string
  kind: SpecValueKind
  group: SpecGroupKey
  unit?: string
  /** True when the value lives inside Guitar.specs rather than a column. */
  json?: boolean
  /** Categories this field is meaningful for. Empty = all. */
  categories?: Category[]
  /** Show this field in the compact spec highlight strip on cards. */
  highlight?: boolean
  /** Available as a facet in the filter sidebar. */
  filterable?: boolean
}

export type SpecGroupKey =
  | "identity"
  | "pricing"
  | "body"
  | "neck"
  | "hardware"
  | "electronics"
  | "finish"
  | "origin"
  | "included"
  | "scores"

export const SPEC_GROUPS: { key: SpecGroupKey; label: string }[] = [
  { key: "identity", label: "Identity" },
  { key: "pricing", label: "Pricing" },
  { key: "body", label: "Body & tonewoods" },
  { key: "neck", label: "Neck & fingerboard" },
  { key: "hardware", label: "Hardware" },
  { key: "electronics", label: "Electronics" },
  { key: "finish", label: "Finish & cosmetics" },
  { key: "origin", label: "Origin" },
  { key: "included", label: "In the box" },
  { key: "scores", label: "Scores" },
]

/**
 * The canonical spec dictionary. Detail pages, the comparison table, the filter
 * sidebar, the search index and the JSON-LD builder all read from this single
 * definition, so adding a spec is a one-line change (Open/Closed principle).
 */
export const SPEC_FIELDS: SpecField[] = [
  { key: "name", label: "Name", kind: "text", group: "identity" },
  { key: "brand", label: "Brand", kind: "text", group: "identity", filterable: true, highlight: true },
  { key: "series", label: "Series", kind: "text", group: "identity", filterable: true },
  { key: "model", label: "Model", kind: "text", group: "identity" },
  { key: "sku", label: "SKU", kind: "text", group: "identity" },
  { key: "mpn", label: "MPN", kind: "text", group: "identity" },
  { key: "gtin", label: "GTIN / UPC", kind: "text", group: "identity" },
  { key: "category", label: "Type", kind: "text", group: "identity", filterable: true },
  { key: "subtype", label: "Subtype", kind: "text", group: "identity" },

  { key: "msrp", label: "MSRP", kind: "currency", group: "pricing" },
  { key: "currentBest", label: "Best current price", kind: "currency", group: "pricing", highlight: true, filterable: true },
  { key: "availability", label: "Availability", kind: "text", group: "pricing", filterable: true },

  { key: "bodyShape", label: "Body shape", kind: "text", group: "body", filterable: true, highlight: true },
  { key: "topWood", label: "Top wood", kind: "text", group: "body", filterable: true, highlight: true },
  { key: "backWood", label: "Back wood", kind: "text", group: "body", filterable: true },
  { key: "sideWood", label: "Side wood", kind: "text", group: "body", filterable: true },
  { key: "cutaway", label: "Cutaway", kind: "boolean", group: "body", filterable: true, categories: ["ACOUSTIC", "CLASSICAL", "ELECTRIC", "BASS"] },
  { key: "weightKg", label: "Weight", kind: "number", group: "body", unit: "kg", filterable: true },

  { key: "neckWood", label: "Neck", kind: "text", group: "neck", filterable: true },
  { key: "fingerboard", label: "Fingerboard", kind: "text", group: "neck", filterable: true },
  { key: "scaleLengthIn", label: "Scale length", kind: "number", group: "neck", unit: "in", filterable: true, highlight: true },
  { key: "nutWidthIn", label: "Nut width", kind: "number", group: "neck", unit: "in" },
  { key: "frets", label: "Frets", kind: "number", group: "neck", filterable: true, highlight: true },
  { key: "neckProfile", label: "Neck profile", kind: "text", group: "neck", json: true },
  { key: "fingerboardRadius", label: "Fingerboard radius", kind: "text", group: "neck", json: true },
  { key: "handedness", label: "Handedness", kind: "text", group: "neck", filterable: true },

  { key: "bridge", label: "Bridge", kind: "text", group: "hardware", filterable: true },
  { key: "nutMaterial", label: "Nut material", kind: "text", group: "hardware" },
  { key: "tuners", label: "Tuning machines", kind: "text", group: "hardware", json: true },
  { key: "strings", label: "Strings", kind: "number", group: "hardware", filterable: true, highlight: true },
  { key: "stringGauge", label: "Factory string gauge", kind: "text", group: "hardware", json: true },

  { key: "pickupConfig", label: "Pickups", kind: "text", group: "electronics", filterable: true, highlight: true, categories: ["ELECTRIC", "BASS"] },
  { key: "electronics", label: "Electronics", kind: "text", group: "electronics", filterable: true },
  { key: "electroAcoustic", label: "Electro-acoustic", kind: "boolean", group: "electronics", filterable: true, categories: ["ACOUSTIC", "CLASSICAL", "UKULELE"] },
  { key: "controls", label: "Controls", kind: "text", group: "electronics", json: true },
  { key: "preamp", label: "Preamp", kind: "text", group: "electronics", json: true },

  { key: "finish", label: "Finish", kind: "text", group: "finish", filterable: true },
  { key: "color", label: "Color", kind: "text", group: "finish", filterable: true },
  { key: "binding", label: "Binding", kind: "text", group: "finish", json: true },
  { key: "inlays", label: "Inlays", kind: "text", group: "finish", json: true },

  { key: "madeIn", label: "Made in", kind: "text", group: "origin", filterable: true, highlight: true },
  { key: "year", label: "Year", kind: "number", group: "origin", filterable: true },

  { key: "caseIncluded", label: "Case included", kind: "boolean", group: "included" },
  { key: "accessories", label: "Accessories", kind: "list", group: "included" },
  { key: "warranty", label: "Warranty", kind: "text", group: "included" },

  { key: "expertScore", label: "Expert score", kind: "number", group: "scores", unit: "/10", filterable: true, highlight: true },
  { key: "userScore", label: "Owner rating", kind: "number", group: "scores", unit: "/5", filterable: true },
  { key: "valueScore", label: "Value index", kind: "number", group: "scores", unit: "/10" },
]

export const specFieldsByGroup = (category?: Category) =>
  SPEC_GROUPS.map((group) => ({
    ...group,
    fields: SPEC_FIELDS.filter(
      (f) => f.group === group.key && (!f.categories || !category || f.categories.includes(category)),
    ),
  })).filter((g) => g.fields.length > 0)

export const highlightFields = SPEC_FIELDS.filter((f) => f.highlight)
export const filterableFields = SPEC_FIELDS.filter((f) => f.filterable)
export const specFieldByKey = (key: string) => SPEC_FIELDS.find((f) => f.key === key)
