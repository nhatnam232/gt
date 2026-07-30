"use server"

import { cookies } from "next/headers"
import { COMPARE_COOKIE, MAX_COMPARE } from "@/config/site"

export async function addToCompare(slug: string) {
  const cookieStore = await cookies()
  const existing = JSON.parse(decodeURIComponent(cookieStore.get(COMPARE_COOKIE)?.value ?? "[]")) as string[]
  if (existing.includes(slug) || existing.length >= MAX_COMPARE) return
  const updated = [...existing, slug]
  cookieStore.set(COMPARE_COOKIE, encodeURIComponent(JSON.stringify(updated)), {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  })
}

export async function removeFromCompare(slug: string) {
  const cookieStore = await cookies()
  const existing = JSON.parse(decodeURIComponent(cookieStore.get(COMPARE_COOKIE)?.value ?? "[]")) as string[]
  const updated = existing.filter((s) => s !== slug)
  cookieStore.set(COMPARE_COOKIE, encodeURIComponent(JSON.stringify(updated)), {
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
    sameSite: "lax",
  })
}

export async function clearCompare() {
  const cookieStore = await cookies()
  cookieStore.set(COMPARE_COOKIE, "[]", { maxAge: 0, path: "/" })
}
