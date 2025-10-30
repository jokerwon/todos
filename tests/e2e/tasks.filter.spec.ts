import { test, expect } from "@playwright/test";

test.describe("Task filters", () => {
  test("user filters by category", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    await page.click('[data-testid="open-category-manager"]');
    await page.fill('[data-testid="category-name-input"]', "工作");
    await page.click('[data-testid="create-category"]');

    const firstChip = page.locator('[data-testid^="filter-chip-category-"]').first();
    await firstChip.click();
    await expect(page.locator('[data-testid="active-task-list"]')).toBeVisible();
  });
});
