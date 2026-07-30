import { describe, it, expect } from "vitest"
import { slugify, truncate, formatPrice, clamp, chunk } from "@/lib/utils"

describe("slugify", () => {
  it("converts to lowercase and replaces spaces", () => {
    expect(slugify("Fender Stratocaster")).toBe("fender-stratocaster")
  })
  it("removes special characters", () => {
    expect(slugify("Gibson Les Paul Jr.")).toBe("gibson-les-paul-jr")
  })
  it("handles accented characters", () => {
    expect(slugify("Córdoba")).toBe("cordoba")
  })
})

describe("truncate", () => {
  it("returns original when short", () => {
    expect(truncate("hello", 10)).toBe("hello")
  })
  it("truncates long strings", () => {
    const result = truncate("hello world", 8)
    expect(result.length).toBeLessThanOrEqual(8)
    expect(result.endsWith("…")).toBe(true)
  })
})

describe("clamp", () => {
  it("clamps within range", () => {
    expect(clamp(5, 1, 10)).toBe(5)
    expect(clamp(-1, 1, 10)).toBe(1)
    expect(clamp(100, 1, 10)).toBe(10)
  })
})

describe("chunk", () => {
  it("splits array into chunks", () => {
    expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
  })
})
