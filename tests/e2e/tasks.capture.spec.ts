import { test, expect } from "@playwright/test";

test.describe("Task capture flow", () => {
  test("user can capture and complete a task", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    await page.fill('input[name="task-title"]', "Write documentation");
    await page.click('button[data-testid="create-task"]');

    await expect(page.locator('li[data-testid="task-item"]:has-text("Write documentation")')).toBeVisible();

    await page.click('button[data-testid="complete-task"]');
    await expect(
      page.locator('li[data-testid="task-item-completed"]:has-text("Write documentation")'),
    ).toBeVisible();
  });
});
