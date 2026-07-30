import { describe, expect, it } from "vitest"
import { parseGuitarQuery, serializeGuitarQuery, countActiveFilters } from "@/domain/guitar/query"

describe("parseGuitarQuery", () => {
  it("returns defaults for empty params", () => {
    const query = parseGuitarQuery({})
    expect(query.sort).toBe("relevance")
    expect(query.page).toBe(1)
    expect(query.brands).toEqual([])
  })

  it("parses brand filter", () => {
    const query = parseGuitarQuery({ brand: "fender,taylor" })
    expect(query.brands).toEqual(["fender", "taylor"])
  })

  it("caps page at 1 minimum", () => {
    const query = parseGuitarQuery({ page: "-5" })
    expect(query.page).toBe(1)
  })

  it("clamps perPage", () => {
    const query = parseGuitarQuery({ perPage: "999" })
    expect(query.perPage).toBe(60)
  })

  it("parses boolean filters", () => {
    const query = parseGuitarQuery({ left: "1", cutaway: "true" })
    expect(query.leftHanded).toBe(true)
    expect(query.cutaway).toBe(true)
  })
})

describe("serializeGuitarQuery", () => {
  it("round-trips filters", () => {
    const query = parseGuitarQuery({ brand: "fender", sort: "price-asc" })
    const qs = serializeGuitarQuery(query)
    const back = parseGuitarQuery(Object.fromEntries(new URLSearchParams(qs)))
    expect(back.brands).toEqual(["fender"])
    expect(back.sort).toBe("price-asc")
  })
})

describe("countActiveFilters", () => {
  it("counts correctly", () => {
    const query = parseGuitarQuery({ brand: "fender,taylor", minPrice: "500" })
    expect(countActiveFilters(query)).toBe(3)
  })
})
