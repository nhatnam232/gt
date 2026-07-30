import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = { title: "Sign In" }

export default function SignInPage() {
  return (
    <div className="container-page flex min-h-[70vh] items-center justify-center">
      <div className="w-full max-w-sm rounded-2xl border bg-card p-8">
        <h1 className="text-2xl font-bold">Sign in</h1>
        <p className="mt-2 text-sm text-muted-foreground">Access your comparisons and saved instruments.</p>
        <div className="mt-6 space-y-3">
          {/* OAuth handoffs must be full page loads, not client-side navigation. */}
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/sign-in/github"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border bg-secondary/60 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Continue with GitHub
          </a>
          {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
          <a
            href="/api/auth/sign-in/google"
            className="flex h-10 w-full items-center justify-center gap-2 rounded-xl border bg-secondary/60 text-sm font-medium hover:bg-secondary transition-colors"
          >
            Continue with Google
          </a>
        </div>
        <p className="mt-6 text-center text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link href="/terms" className="underline">Terms</Link>{" & "}
          <Link href="/privacy" className="underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  )
}
