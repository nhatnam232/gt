import { requireRole } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { upsertGuitar } from "@/server/actions/admin.actions"
import { Input, Textarea } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export default async function EditGuitarPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))
  const { slug } = await params

  const [guitar, brands] = await Promise.all([
    prisma.guitar.findUnique({ where: { slug } }),
    prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } }),
  ])
  if (!guitar) notFound()

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-semibold">Edit: {guitar.name}</h1>
      <form action={upsertGuitar} className="mt-8 space-y-6">
        <input type="hidden" name="id" value={guitar.id} />
        <div className="space-y-1.5">
          <Label htmlFor="name">Name *</Label>
          <Input id="name" name="name" required defaultValue={guitar.name} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="brandId">Brand *</Label>
          <select name="brandId" id="brandId" required defaultValue={guitar.brandId} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="category">Category *</Label>
          <select name="category" id="category" required defaultValue={guitar.category} className="flex h-10 w-full rounded-xl border border-input bg-background px-3 py-2 text-sm">
            {["ACOUSTIC","ELECTRIC","BASS","CLASSICAL","UKULELE","AMPLIFIER","PEDAL","ACCESSORY"].map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="model">Model</Label>
          <Input id="model" name="model" defaultValue={guitar.model ?? ""} />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <Label htmlFor="msrp">MSRP (USD)</Label>
            <Input id="msrp" name="msrp" type="number" step="0.01" defaultValue={guitar.msrp?.toString() ?? ""} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="year">Year</Label>
            <Input id="year" name="year" type="number" defaultValue={guitar.year?.toString() ?? ""} />
          </div>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="summary">Summary</Label>
          <Textarea id="summary" name="summary" rows={4} defaultValue={guitar.summary ?? ""} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="imageUrl">Cover image URL</Label>
          <Input id="imageUrl" name="imageUrl" type="url" defaultValue={guitar.images?.[0] ?? ""} />
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="isPublished" name="isPublished" value="true"
            defaultChecked={guitar.isPublished} className="size-4 rounded" />
          <Label htmlFor="isPublished">Published</Label>
        </div>
        <div className="flex gap-3">
          <Button type="submit">Save changes</Button>
          <Button type="button" variant="outline"><a href="/admin/guitars">Cancel</a></Button>
        </div>
      </form>
    </div>
  )
}
