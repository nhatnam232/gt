import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { createGuitar } from "@/server/actions/guitar.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"

export default async function NewGuitarPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })

  const CATEGORIES = ["ACOUSTIC", "ELECTRIC", "BASS", "CLASSICAL", "UKULELE", "AMPLIFIER", "PEDAL", "ACCESSORY"]

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-4">
        <Link href="/admin/guitars" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
        <h1 className="text-2xl font-semibold">Add instrument</h1>
      </div>

      <form action={createGuitar} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required placeholder="e.g. Fender American Professional II Stratocaster" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="brandId">Brand *</Label>
            <select id="brandId" name="brandId" required className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm">
              <option value="">Select brand...</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="category">Category *</Label>
            <select id="category" name="category" required className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label htmlFor="model">Model</Label>
            <Input id="model" name="model" placeholder="e.g. Stratocaster" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" min="1800" max={new Date().getFullYear() + 2} placeholder="2024" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="msrp">MSRP (USD)</Label>
            <Input id="msrp" name="msrp" type="number" step="0.01" placeholder="1499.99" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="madeIn">Made in</Label>
            <Input id="madeIn" name="madeIn" placeholder="USA, Japan, Mexico..." className="mt-1" />
          </div>
          <div>
            <Label htmlFor="topWood">Top wood</Label>
            <Input id="topWood" name="topWood" placeholder="Sitka Spruce" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="neckWood">Neck wood</Label>
            <Input id="neckWood" name="neckWood" placeholder="Maple" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="fingerboard">Fingerboard</Label>
            <Input id="fingerboard" name="fingerboard" placeholder="Rosewood" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="frets">Frets</Label>
            <Input id="frets" name="frets" type="number" placeholder="22" className="mt-1" />
          </div>
          <div>
            <Label htmlFor="strings">Strings</Label>
            <Input id="strings" name="strings" type="number" placeholder="6" className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="summary">Summary</Label>
            <textarea id="summary" name="summary" rows={3} placeholder="Brief overview of this instrument..." className="mt-1 flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm" />
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="submit">Create instrument</Button>
          <Button type="button" variant="outline" asChild>
            <Link href="/admin/guitars">Cancel</Link>
          </Button>
        </div>
      </form>
    </div>
  )
}
