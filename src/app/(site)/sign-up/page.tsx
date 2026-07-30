import { redirect } from "next/navigation"

// Redirect sign-up to sign-in — we use OAuth only
export default function SignUpPage() {
  redirect("/sign-in")
}
