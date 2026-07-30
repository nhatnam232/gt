"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Guitar, Loader2 } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

export default function SignInPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setLoading(true)
    const result = await authClient.signIn.email({ email, password })
    setLoading(false)
    if (result.error) {
      setError(result.error.message ?? "Sign-in failed")
    } else {
      router.push("/admin")
    }
  }

  return (
    <div className="flex min-h-dvh items-center justify-center p-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="inline-grid size-12 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Guitar className="size-6" />
          </span>
          <h1 className="mt-4 text-2xl font-semibold">Sign in</h1>
          <p className="mt-1 text-sm text-muted-foreground">GuitarTribe admin access</p>
        </div>
        <form onSubmit={(e) => { void onSubmit(e) }} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          {error ? (
            <p className="rounded-lg bg-destructive/12 px-3 py-2 text-sm text-destructive">{error}</p>
          ) : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Sign in"}
          </Button>
        </form>
        <Button variant="outline" className="w-full" onClick={() => authClient.signIn.social({ provider: "github", callbackURL: "/admin" })}>
          Continue with GitHub
        </Button>
      </div>
    </div>
  )
}
