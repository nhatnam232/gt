import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function GuitarNotFound() {
  return (
    <div className="container-page section flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-3">404</p>
      <h1 className="text-3xl font-bold">Guitar not found</h1>
      <p className="mt-3 text-muted-foreground">This instrument doesn't exist or hasn't been published yet.</p>
      <Button asChild className="mt-6">
        <Link href="/guitars">Browse all guitars</Link>
      </Button>
    </div>
  )
}
