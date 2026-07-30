"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container-page section flex min-h-[50vh] flex-col items-center justify-center text-center">
      <p className="eyebrow mb-3">Something went wrong</p>
      <h2 className="text-2xl font-bold">An unexpected error occurred</h2>
      <p className="mt-3 text-muted-foreground">{error.message}</p>
      <Button className="mt-6" onClick={reset}>Try again</Button>
    </div>
  )
}
