import { test, expect } from '@playwright/test';

test.describe('Homepage', () => {
  test('should load the homepage', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/PURA/);
  });

  test('should display dashboard content', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1, h2')).toBeVisible();
  });
});

test.describe('Navigation', () => {
  test('should navigate to guests page', async ({ page }) => {
    await page.goto('/');
    await page.click('text=Guests');
    await expect(page).toHaveURL(/.*guests/);
  });
});
