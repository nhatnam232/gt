import { auth } from "./auth"
import { headers } from "next/headers"

export type UserRole = "USER" | "EDITOR" | "ADMIN"

export async function getSession() {
  const h = await headers()
  return auth.api.getSession({ headers: h })
}

export async function getCurrentUser() {
  const session = await getSession()
  return session?.user ?? null
}

const ROLE_LEVEL: Record<UserRole, number> = {
  USER: 0,
  EDITOR: 1,
  ADMIN: 2,
}

/**
 * Throws an error (which triggers Next.js redirect in middleware)
 * if the current user does not have the required role.
 */
export async function requireRole(role: UserRole): Promise<NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>> {
  const user = await getCurrentUser()
  if (!user) throw new Error("UNAUTHORIZED")
  const userRole = (user as { role?: string }).role as UserRole ?? "USER"
  if (ROLE_LEVEL[userRole] < ROLE_LEVEL[role]) throw new Error("FORBIDDEN")
  return user as NonNullable<Awaited<ReturnType<typeof getCurrentUser>>>
}
