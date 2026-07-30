import { describe, expect, it } from "vitest"
import { slugify, formatPrice, formatNumber, clamp, truncate, chunk, unique } from "@/lib/utils"

describe("slugify", () => {
  it("lower-cases and hyphenates", () => {
    expect(slugify("Fender Telecaster")).toBe("fender-telecaster")
  })
  it("strips special characters", () => {
    expect(slugify("Gibson Les Paul (Standard)")).toBe("gibson-les-paul-standard")
  })
  it("collapses multiple hyphens", () => {
    expect(slugify("Taylor   814ce")).toBe("taylor-814ce")
  })
})

describe("formatPrice", () => {
  it("formats USD", () => {
    expect(formatPrice(1999, "USD")).toBe("$1,999")
  })
  it("handles zero", () => {
    expect(formatPrice(0)).toBe("$0")
  })
})

describe("formatNumber", () => {
  it("adds thousands separator", () => {
    expect(formatNumber(12345)).toBe("12,345")
  })
})

describe("clamp", () => {
  it("clamps to range", () => {
    expect(clamp(5, 0, 10)).toBe(5)
    expect(clamp(-1, 0, 10)).toBe(0)
    expect(clamp(20, 0, 10)).toBe(10)
  })
})

describe("truncate", () => {
  it("truncates long strings", () => {
    expect(truncate("hello world", 5)).toBe("hello...")
  })
  it("returns short strings unchanged", () => {
    expect(truncate("hi", 10)).toBe("hi")
  })
})

describe("chunk", () => {
  it("splits array into chunks", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })
})

describe("unique", () => {
  it("deduplicates", () => {
    expect(unique([1, 2, 2, 3])).toEqual([1, 2, 3])
  })
})
