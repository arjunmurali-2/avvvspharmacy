import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('avvvs-consent', JSON.stringify({ analytics: false, marketing: false, at: 'test' })));
});

test('phone: no sideways scrolling and the menu opens', async ({ page }) => {
  await page.goto('/');
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
  expect(overflow).toBeLessThanOrEqual(0);
  await page.getByRole('button', { name: 'Menu' }).click();
  const sheet = page.getByRole('dialog', { name: 'Menu' });
  await expect(sheet).toBeVisible();
  await expect(sheet.getByText('By concern')).toBeVisible();
});

test('phone: concern page filters open as a sheet', async ({ page }) => {
  await page.goto('/concerns/digestive-health');
  await page.getByRole('button', { name: /^Filters/ }).click();
  await expect(page.getByRole('complementary', { name: 'Filters' })).toBeVisible();
});
