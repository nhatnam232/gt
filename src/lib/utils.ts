import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Decimal } from "@prisma/client/runtime/library"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(
  value: string | number | Date | null | undefined,
  opts?: Intl.DateTimeFormatOptions,
): string {
  if (value === null || value === undefined) return ""
  const date = value instanceof Date ? value : new Date(value)
  if (isNaN(date.getTime())) return ""
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    ...opts,
  }).format(date)
}

export function formatNumber(
  value: number | string | Decimal | null | undefined,
  opts?: Intl.NumberFormatOptions,
): string {
  if (value === null || value === undefined) return "0"
  const num = Number(value)
  if (isNaN(num)) return "0"
  return new Intl.NumberFormat("en-US", opts).format(num)
}

export function formatPrice(amount: number | string | Decimal | null | undefined, currency = "USD"): string {
  if (amount === null || amount === undefined) return ""
  const num = typeof amount === "object" ? Number(amount) : Number(amount)
  if (isNaN(num)) return ""
  return new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 }).format(num)
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 1).trim()}…`
}

export function decimalToNumber(d: Decimal | null | undefined): number | null {
  if (d === null || d === undefined) return null
  return Number(d)
}

export function groupBy<T, K extends string | number>(arr: T[], key: (item: T) => K): Record<K, T[]> {
  return arr.reduce(
    (acc, item) => {
      const k = key(item)
      if (!acc[k]) acc[k] = []
      acc[k].push(item)
      return acc
    },
    {} as Record<K, T[]>,
  )
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  return keys.reduce((acc, key) => ({ ...acc, [key]: obj[key] }), {} as Pick<T, K>)
}

export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys) delete result[key]
  return result as Omit<T, K>
}

export function parseIntSafe(val: unknown, fallback = 0): number {
  const n = parseInt(String(val), 10)
  return isNaN(n) ? fallback : n
}

export function parseFloatSafe(val: unknown, fallback = 0): number {
  const n = parseFloat(String(val))
  return isNaN(n) ? fallback : n
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function range(start: number, end: number): number[] {
  return Array.from({ length: end - start }, (_, i) => start + i)
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < arr.length; i += size) chunks.push(arr.slice(i, i + size))
  return chunks
}
