import { test, expect } from "@playwright/test"

test.describe("Guitar listing", () => {
  test("loads the catalogue page", async ({ page }) => {
    await page.goto("/guitars")
    await expect(page).toHaveTitle(/instruments|GuitarTribe/i)
    // Filter sidebar should exist
    await expect(page.getByRole("complementary")).toBeVisible()
  })

  test("category page loads", async ({ page }) => {
    await page.goto("/c/acoustic")
    await expect(page.getByRole("heading", { name: /acoustic/i })).toBeVisible()
  })
})
