import { headers } from "next/headers"
import { redirect } from "next/navigation"
import type { Role } from "@prisma/client"
import { auth } from "./auth"

export type SessionUser = {
  id: string
  email: string
  name: string | null
  image: string | null
  role: Role
}

export async function currentUser(): Promise<SessionUser | null> {
  const session = await auth.api.getSession({ headers: await headers() })
  if (!session?.user) return null
  const user = session.user as unknown as SessionUser
  return {
    id: user.id,
    email: user.email,
    name: user.name ?? null,
    image: user.image ?? null,
    role: (user.role ?? "USER") as Role,
  }
}

const RANK: Record<Role, number> = { USER: 0, EDITOR: 1, ADMIN: 2 }

export function hasRole(user: SessionUser | null, minimum: Role): boolean {
  if (!user) return false
  return RANK[user.role] >= RANK[minimum]
}

/** Server-side guard for admin routes and privileged server actions. */
export async function requireRole(minimum: Role): Promise<SessionUser> {
  const user = await currentUser()
  if (!user) redirect(`/sign-in?next=/admin`)
  if (!hasRole(user, minimum)) redirect("/403")
  return user
}

/** Throwing variant for server actions, where redirect() is undesirable. */
export async function assertRole(minimum: Role): Promise<SessionUser> {
  const user = await currentUser()
  if (!hasRole(user, minimum)) throw new Error("Not authorised")
  return user!
}
