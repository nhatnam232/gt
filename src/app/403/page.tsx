import Link from "next/link"
import { ShieldOff } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function ForbiddenPage() {
  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center gap-4 text-center">
      <ShieldOff className="size-12 text-muted-foreground" />
      <h1 className="text-3xl font-semibold">Access denied</h1>
      <p className="max-w-md text-muted-foreground">
        You do not have permission to view this page.
      </p>
      <Button asChild><Link href="/">Back home</Link></Button>
    </div>
  )
}
