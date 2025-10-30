import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("home page has no obvious accessibility tree issues", async ({ page }) => {
    await page.goto("http://localhost:3000/");
    const snapshot = await page.accessibility.snapshot();
    expect(snapshot?.children?.length).toBeGreaterThan(0);
  });
});
