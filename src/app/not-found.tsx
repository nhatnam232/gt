import Link from "next/link"
import { Button } from "@/components/ui/button"
import { MainLayout } from "@/components/layout/main-layout"

export default function NotFound() {
  return (
    <MainLayout>
      <div className="container-page section flex flex-col items-center justify-center text-center min-h-[60vh]">
        <p className="eyebrow mb-3">404</p>
        <h1 className="text-4xl font-bold">Page not found</h1>
        <p className="mt-4 text-muted-foreground max-w-md">
          We couldn't find what you were looking for. It may have moved or never existed.
        </p>
        <div className="mt-8 flex gap-3">
          <Button asChild>
            <Link href="/">Go home</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/guitars">Browse instruments</Link>
          </Button>
        </div>
      </div>
    </MainLayout>
  )
}
