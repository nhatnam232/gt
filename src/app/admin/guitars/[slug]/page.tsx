import { requireRole } from "@/lib/session"
import { redirect, notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { updateGuitar, deleteGuitar } from "@/server/actions/guitar.actions"
import { publishGuitar, unpublishGuitar } from "@/server/actions/admin.actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function EditGuitarPage({ params }: { params: Promise<{ slug: string }> }) {
  await requireRole("EDITOR").catch(() => redirect("/sign-in"))
  const { slug } = await params

  const guitar = await prisma.guitar.findUnique({
    where: { slug },
    include: { brand: { select: { name: true } } },
  })
  if (!guitar) notFound()

  const brands = await prisma.brand.findMany({ orderBy: { name: "asc" }, select: { id: true, name: true } })
  const CATEGORIES = ["ACOUSTIC", "ELECTRIC", "BASS", "CLASSICAL", "UKULELE", "AMPLIFIER", "PEDAL", "ACCESSORY"]

  const updateWithSlug = updateGuitar.bind(null, slug)
  const deleteWithSlug = deleteGuitar.bind(null, slug)

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/guitars" className="text-sm text-muted-foreground hover:text-foreground">← Back</Link>
          <h1 className="text-xl font-semibold">{guitar.name}</h1>
          {guitar.isPublished ? <Badge variant="success">Published</Badge> : <Badge variant="outline">Draft</Badge>}
        </div>
        <div className="flex gap-2">
          {guitar.isPublished ? (
            <form action={unpublishGuitar.bind(null, slug)}>
              <Button size="sm" variant="outline" type="submit">Unpublish</Button>
            </form>
          ) : (
            <form action={publishGuitar.bind(null, slug)}>
              <Button size="sm" variant="success" type="submit">Publish</Button>
            </form>
          )}
          <form action={deleteWithSlug} onSubmit={(e) => { if (!confirm("Delete this guitar?")) e.preventDefault() }}>
            <Button size="sm" variant="destructive" type="submit">Delete</Button>
          </form>
        </div>
      </div>

      <form action={updateWithSlug} className="mt-8 space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Label>Name</Label>
            <Input name="name" defaultValue={guitar.name} className="mt-1" />
          </div>
          <div>
            <Label>Category</Label>
            <select name="category" defaultValue={guitar.category} className="mt-1 flex h-10 w-full rounded-xl border border-input bg-background px-3.5 text-sm">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <Label>Model</Label>
            <Input name="model" defaultValue={guitar.model ?? ""} className="mt-1" />
          </div>
          <div>
            <Label>Year</Label>
            <Input name="year" type="number" defaultValue={guitar.year ?? ""} className="mt-1" />
          </div>
          <div>
            <Label>MSRP (USD)</Label>
            <Input name="msrp" type="number" step="0.01" defaultValue={guitar.msrp ? Number(guitar.msrp) : ""} className="mt-1" />
          </div>
          <div>
            <Label>Made in</Label>
            <Input name="madeIn" defaultValue={guitar.madeIn ?? ""} className="mt-1" />
          </div>
          <div>
            <Label>Top wood</Label>
            <Input name="topWood" defaultValue={guitar.topWood ?? ""} className="mt-1" />
          </div>
          <div>
            <Label>Neck wood</Label>
            <Input name="neckWood" defaultValue={guitar.neckWood ?? ""} className="mt-1" />
          </div>
          <div>
            <Label>Fingerboard</Label>
            <Input name="fingerboard" defaultValue={guitar.fingerboard ?? ""} className="mt-1" />
          </div>
          <div>
            <Label>Frets</Label>
            <Input name="frets" type="number" defaultValue={guitar.frets ?? ""} className="mt-1" />
          </div>
          <div>
            <Label>Strings</Label>
            <Input name="strings" type="number" defaultValue={guitar.strings ?? ""} className="mt-1" />
          </div>
          <div className="sm:col-span-2">
            <Label>Summary</Label>
            <textarea name="summary" rows={3} defaultValue={guitar.summary ?? ""} className="mt-1 flex min-h-[80px] w-full rounded-xl border border-input bg-background px-3.5 py-2.5 text-sm" />
          </div>
        </div>
        <Button type="submit">Save changes</Button>
      </form>
    </div>
  )
}
