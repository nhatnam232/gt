"use client"

import { useEffect } from "react"
import { RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Surfaced in Vercel logs; no user data is included.
    console.error("Route error", { digest: error.digest, message: error.message })
  }, [error])

  return (
    <div className="container-page flex min-h-[70vh] flex-col items-center justify-center py-24 text-center">
      <h1 className="text-3xl sm:text-4xl">Something went wrong</h1>
      <p className="mt-3 max-w-md text-muted-foreground">
        The page failed to load. This is usually temporary - retrying normally fixes it.
      </p>
      {error.digest ? (
        <p className="mt-2 font-[family-name:var(--font-mono)] text-xs text-muted-foreground">
          Reference: {error.digest}
        </p>
      ) : null}
      <Button onClick={reset} className="mt-8 gap-2">
        <RotateCcw className="size-4" /> Try again
      </Button>
    </div>
  )
}
