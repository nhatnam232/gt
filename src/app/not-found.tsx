import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <p className="font-[family-name:var(--font-mono)] text-sm text-primary">404</p>
      <h1 className="mt-3 text-3xl sm:text-4xl">We could not find that page</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The instrument or page you were looking for may have been renamed, discontinued or moved.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Button asChild>
          <Link href="/guitars">Browse the catalogue</Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/">Back home</Link>
        </Button>
      </div>
    </div>
  )
}
