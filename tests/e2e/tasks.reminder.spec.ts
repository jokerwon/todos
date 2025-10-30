import { test, expect } from "@playwright/test";

test.describe("Task reminders", () => {
  test("user schedules reminder", async ({ page }) => {
    await page.goto("http://localhost:3000/");

    await page.fill('input[name="task-title"]', "准备周报");
    await page.click('[data-testid="create-task"]');

    await page.click('[data-testid="open-reminder-modal"]');
    await page.fill('[data-testid="reminder-minutes-input"]', "30");
    await page.click('[data-testid="save-reminder"]');

    await expect(page.locator('[data-testid="reminder-badge"]')).toBeVisible();
  });
});
