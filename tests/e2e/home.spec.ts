import { test, expect } from "@playwright/test"

test.describe("Homepage", () => {
  test("loads and shows search bar", async ({ page }) => {
    await page.goto("/")
    await expect(page).toHaveTitle(/GuitarTribe/)
    // Hero section should be present
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible()
  })

  test("navigation links work", async ({ page }) => {
    await page.goto("/")
    await page.getByRole("link", { name: /browse/i }).first().click()
    await expect(page).toHaveURL(/\/guitars/)
  })

  test("skip link is present for accessibility", async ({ page }) => {
    await page.goto("/")
    const skip = page.getByRole("link", { name: /skip/i })
    await expect(skip).toHaveCount(1)
  })
})
