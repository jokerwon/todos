import { expect, test } from '@playwright/test';

test.describe('Login module', () => {
  test('logs in with valid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    await expect(page.locator('[data-testid="welcome"]')).toBeVisible();
  });

  test('shows error on invalid credentials', async ({ page }) => {
    await page.goto('/auth/login');
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'wrong');
    await page.click('button[type="submit"]');

    await expect(page.locator('[data-testid="login-error"]')).toBeVisible();
  });

  test('remember me issues long-lived session cookie', async ({ page, context }) => {
    await page.goto('/auth/login?redirectTo=%2F');
    await page.fill('input[name="email"]', 'demo@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.check('[data-testid="remember-toggle"]');
    await page.click('button[type="submit"]');

    await expect(page).toHaveURL('/');
    const cookies = await context.cookies();
    const sessionCookie = cookies.find((cookie) => cookie.name === 'local-auth-session');
    expect(sessionCookie).toBeDefined();
    if (sessionCookie?.expires) {
      const delta = sessionCookie.expires * 1000 - Date.now();
      expect(delta).toBeGreaterThan(24 * 60 * 60 * 1000);
    }
  });

  test('exposes recovery and SSO entry points', async ({ page }) => {
    await page.goto('/auth/login');
    await expect(page.locator('a[href="/auth/forgot-password"]').first()).toBeVisible();
    await expect(page.locator('[data-testid="sso-buttons"] button')).toHaveCount(2);
  });
});
