import { requireRole } from "@/lib/session"
import { redirect } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { upsertGuitar } from "@/server/actions/admin.actions"
import { Input, Textarea } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default async function NewGuitarPage() {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))

  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Add new instrument</h1>
      <form action={upsertGuitar} className="mt-8 space-y-6">
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required placeholder="e.g. Fender American Professional II Stratocaster" />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brandId">Brand *</Label>
          <select name="brandId" id="brandId" required className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            <option value="">Select a brand...</option>
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <select name="category" id="category" required className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            {["ACOUSTIC","ELECTRIC","BASS","CLASSICAL","UKULELE","AMPLIFIER","PEDAL","ACCESSORY"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" placeholder="e.g. American Professional II" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="msrp">MSRP (USD)</Label>
            <Input id="msrp" name="msrp" type="number" step="0.01" placeholder="1499.99" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" placeholder="2024" />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" name="summary" rows={4} placeholder="Brief description for the listing..." />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Cover image URL</Label>
          <Input id="imageUrl" name="imageUrl" type="url" placeholder="https://..." />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPublished" name="isPublished" value="true" className="size-4 rounded" />
          <Label htmlFor="isPublished">Publish immediately</Label>
        </div>
        <div className="flex gap-3">
          <Button type="submit">Create instrument</Button>
          <Button type="button" variant="outline" onClick={undefined}>
            <a href="/admin/guitars">Cancel</a>
          </Button>
        </div>
      </form>
    </div>
  )
}
