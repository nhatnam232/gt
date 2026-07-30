import { describe, it, expect } from "vitest"
import { categoryFromSlug, categoryMeta } from "@/config/navigation"

describe("categoryFromSlug", () => {
  it("returns ACOUSTIC for \"acoustic\"", () => {
    expect(categoryFromSlug("acoustic")).toBe("ACOUSTIC")
  })
  it("returns null for unknown slugs", () => {
    expect(categoryFromSlug("unknown-type")).toBeNull()
  })
})

describe("categoryMeta", () => {
  it("returns correct label for ELECTRIC", () => {
    expect(categoryMeta("ELECTRIC").label).toBe("Electric")
  })
  it("includes icon", () => {
    expect(categoryMeta("BASS").icon).toBeTruthy()
  })
})
