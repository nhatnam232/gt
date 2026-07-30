"use server"

import { cookies } from "next/headers"
import { revalidatePath } from "next/cache"
import { MAX_COMPARE } from "@/config/site"

export const COMPARE_COOKIE = "gt_compare"

const SAFE_SLUG = /^[a-z0-9][a-z0-9-]{0,120}$/

function parse(value: string | undefined): string[] {
  if (!value) return []
  return value
    .split(",")
    .map((slug) => slug.trim().toLowerCase())
    .filter((slug) => SAFE_SLUG.test(slug))
    .slice(0, MAX_COMPARE)
}

async function write(slugs: string[]): Promise<string[]> {
  const store = await cookies()
  const next = Array.from(new Set(slugs)).slice(0, MAX_COMPARE)
  store.set(COMPARE_COOKIE, next.join(","), {
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
    httpOnly: false,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  })
  return next
}

/** Read the current compare tray (server components + route handlers). */
export async function getCompareList(): Promise<string[]> {
  const store = await cookies()
  return parse(store.get(COMPARE_COOKIE)?.value)
}

export async function toggleCompare(slug: string): Promise<{ list: string[]; added: boolean; full: boolean }> {
  const clean = slug.trim().toLowerCase()
  if (!SAFE_SLUG.test(clean)) return { list: await getCompareList(), added: false, full: false }

  const current = await getCompareList()
  if (current.includes(clean)) {
    const list = await write(current.filter((s) => s !== clean))
    revalidatePath("/compare")
    return { list, added: false, full: false }
  }
  if (current.length >= MAX_COMPARE) {
    return { list: current, added: false, full: true }
  }
  const list = await write([...current, clean])
  revalidatePath("/compare")
  return { list, added: true, full: list.length >= MAX_COMPARE }
}

export async function removeFromCompare(slug: string): Promise<string[]> {
  const current = await getCompareList()
  const list = await write(current.filter((s) => s !== slug.trim().toLowerCase()))
  revalidatePath("/compare")
  return list
}

export async function clearCompare(): Promise<string[]> {
  const list = await write([])
  revalidatePath("/compare")
  return list
}
