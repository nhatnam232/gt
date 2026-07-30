/**
 * Spec definitions used by SpecTable to render readable labels
 * and group specifications into sections.
 */

export type SpecSection = {
  label: string
  keys: string[]
}

export const SPEC_SECTIONS: SpecSection[] = [
  {
    label: "Body",
    keys: ["category", "bodyShape", "subtype", "cutaway", "electroAcoustic", "finish", "color"],
  },
  {
    label: "Tonewoods",
    keys: ["topWood", "backWood", "sideWood", "neckWood", "fingerboard"],
  },
  {
    label: "Neck & Fretboard",
    keys: ["scaleLengthIn", "frets", "strings", "nutWidthIn", "nutMaterial", "bridge"],
  },
  {
    label: "Electronics",
    keys: ["pickupConfig", "electronics"],
  },
  {
    label: "Hardware & Other",
    keys: ["madeIn", "year", "weightKg", "handedness", "caseIncluded", "warranty"],
  },
]

export const SPEC_LABELS: Record<string, string> = {
  category: "Type",
  bodyShape: "Body shape",
  subtype: "Sub-type",
  cutaway: "Cutaway",
  electroAcoustic: "Electro-acoustic",
  finish: "Finish",
  color: "Color",
  topWood: "Top wood",
  backWood: "Back wood",
  sideWood: "Side wood",
  neckWood: "Neck wood",
  fingerboard: "Fingerboard",
  scaleLengthIn: "Scale length",
  frets: "Frets",
  strings: "Strings",
  nutWidthIn: "Nut width",
  nutMaterial: "Nut material",
  bridge: "Bridge",
  pickupConfig: "Pickups",
  electronics: "Electronics",
  madeIn: "Made in",
  year: "Year introduced",
  weightKg: "Weight",
  handedness: "Handedness",
  caseIncluded: "Case included",
  warranty: "Warranty",
}

export function formatSpecValue(key: string, value: unknown): string {
  if (value === null || value === undefined || value === "") return "—"
  if (typeof value === "boolean") return value ? "Yes" : "No"
  if (key === "scaleLengthIn" && typeof value === "number") return `${value}"`
  if (key === "nutWidthIn" && typeof value === "number") return `${value}"`
  if (key === "weightKg" && typeof value === "number") return `${value} kg (${(value * 2.205).toFixed(1)} lb)`
  if (key === "handedness") return String(value) === "LEFT" ? "Left-handed" : "Right-handed"
  return String(value)
}
