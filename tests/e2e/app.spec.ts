import { test, expect } from '@playwright/test';

test('loads the app shell', async ({ page }) => {
  await page.goto('/');

  await expect(page).toHaveTitle(/LangGraph Visual Modeler/i);
  await expect(page.getByRole('heading', { name: 'State Schema' })).toBeVisible();
});

test('can add a state field', async ({ page }) => {
  await page.goto('/');

  await page.getByRole('button', { name: /Add Field/i }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
});

test('node palette is visible', async ({ page }) => {
  await page.goto('/');

  const palette = page.locator('.node-palette, [data-testid="node-palette"]');
  await expect(palette).toBeVisible();
});
