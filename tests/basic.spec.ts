import { test, expect } from '@playwright/test';

test('homepage loads correctly', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('h1')).toHaveText('OpenClaw Desktop');
});

test('counter increments', async ({ page }) => {
  await page.goto('/');
  const button = page.locator('button');
  await expect(button).toHaveText('Counter: 0');
  await button.click();
  await expect(button).toHaveText('Counter: 1');
});
