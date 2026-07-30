import { test, expect } from "@playwright/test"

test("homepage loads correctly", async ({ page }) => {
  await page.goto("/")
  await expect(page).toHaveTitle(/GuitarTribe/)
  await expect(page.getByRole("link", { name: /Browse/ })).toBeVisible()
})

test("navigation links work", async ({ page }) => {
  await page.goto("/")
  await page.getByRole("link", { name: /Browse/ }).click()
  await expect(page).toHaveURL(/\/guitars/)
})

test("brands page loads", async ({ page }) => {
  await page.goto("/brands")
  await expect(page.getByRole("heading", { name: /Guitar Brands/i })).toBeVisible()
})

test("rankings page loads", async ({ page }) => {
  await page.goto("/rankings")
  await expect(page.getByRole("heading", { name: /Guitar Rankings/i })).toBeVisible()
})

test("search page loads", async ({ page }) => {
  await page.goto("/search")
  await expect(page.getByRole("heading", { name: /Search/i })).toBeVisible()
})
