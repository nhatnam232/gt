import type { GuitarDetailDto } from "@/domain/guitar/types"
import { toNumber } from "@/domain/guitar/view"

function Row({ label, value }: { label: string; value: string | number | boolean | null }) {
  if (value === null || value === undefined || value === "") return null
  const display = typeof value === "boolean" ? (value ? "Yes" : "No") : String(value)
  return (
    <tr className="border-b last:border-0">
      <th
        scope="row"
        className="w-[40%] py-3 pr-4 text-left text-sm font-medium text-muted-foreground align-top"
      >
        {label}
      </th>
      <td className="py-3 text-sm">{display}</td>
    </tr>
  )
}

export function SpecTable({ guitar }: { guitar: GuitarDetailDto }) {
  const data: Record<string, string | number | boolean | null> = {
    Brand: guitar.brand.name,
    Model: guitar.model,
    Category: guitar.category,
    Subtype: guitar.subtype,
    Series: guitar.series,
    "Body shape": guitar.bodyShape,
    "Top wood": guitar.topWood,
    "Back wood": guitar.backWood,
    "Side wood": guitar.sideWood,
    "Neck wood": guitar.neckWood,
    Fingerboard: guitar.fingerboard,
    Bridge: guitar.bridge,
    "Nut material": guitar.nutMaterial,
    "Scale length": guitar.scaleLengthIn ? `${guitar.scaleLengthIn}\"` : null,
    "Nut width": guitar.nutWidthIn ? `${guitar.nutWidthIn}\"` : null,
    Frets: guitar.frets,
    Strings: guitar.strings,
    Pickups: guitar.pickupConfig,
    Electronics: guitar.electronics,
    Finish: guitar.finish,
    Color: guitar.color,
    "Made in": guitar.madeIn,
    Year: guitar.year,
    Handedness: guitar.handedness,
    "Weight (kg)": toNumber(guitar.weightKg),
    "Case included": guitar.caseIncluded,
    Cutaway: guitar.cutaway,
    "Electro-acoustic": guitar.electroAcoustic,
    Warranty: guitar.warranty,
  }

  return (
    <div className="hairline overflow-hidden rounded-2xl border bg-card">
      <table className="w-full border-collapse">
        <tbody>
          {Object.entries(data).map(([key, value]) => (
            <Row key={key} label={key} value={value} />
          ))}
        </tbody>
      </table>
    </div>
  )
}
