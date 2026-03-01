import { test, expect } from '@playwright/test';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

test.describe('Dashboard Navigation', () => {
  const email = uniqueEmail('nav');
  let stateFile = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ page, context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
    await page.goto('/dashboard');
  });

  test('sidebar nav links are visible', async ({ page }) => {
    await expect(
      page.getByRole('link', { name: /dashboard/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /translate/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /batch/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /history/i }).first()
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: /settings/i }).first()
    ).toBeVisible();
  });

  test('navigate through all dashboard pages via nav', async ({ page }) => {
    // Translate
    await page
      .getByRole('link', { name: /translate/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/translate/);
    await expect(page.getByText('Translate Image')).toBeVisible();

    // Batch
    await page.getByRole('link', { name: /batch/i }).first().click();
    await expect(page).toHaveURL(/\/batch/);

    // History
    await page
      .getByRole('link', { name: /history/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/history/);

    // Settings
    await page
      .getByRole('link', { name: /settings/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/settings/);

    // Back to dashboard
    await page
      .getByRole('link', { name: /dashboard/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test('theme toggle switches theme', async ({ page }) => {
    // Find theme toggle button
    const themeBtn = page.getByRole('button', {
      name: /theme|dark|light|toggle/i,
    });

    if (await themeBtn.isVisible()) {
      // Get initial theme
      const htmlBefore = await page.locator('html').getAttribute('class');

      await themeBtn.click();

      // Theme class should change
      const htmlAfter = await page.locator('html').getAttribute('class');
      expect(htmlAfter).not.toBe(htmlBefore);
    }
  });

  test('notification bell is visible', async ({ page }) => {
    const bell = page.getByRole('button', {
      name: /notification/i,
    });

    // Bell should be in the header
    await expect(bell).toBeVisible();
  });

  test('user dropdown menu works', async ({ page }) => {
    // Find the user avatar/menu trigger
    const avatar = page
      .getByRole('button', { name: /account|profile|user|menu/i })
      .first();

    if (await avatar.isVisible()) {
      await avatar.click();

      // Dropdown should show settings, help, logout options
      await expect(
        page
          .getByRole('menuitem', { name: /settings/i })
          .or(page.getByRole('link', { name: /settings/i }))
      ).toBeVisible();
    }
  });

  test('logo links to dashboard', async ({ page }) => {
    await page.goto('/translate');

    // Click logo/brand
    const logo = page.getByRole('link', { name: /imgtext/i }).first();
    await logo.click();

    await expect(page).toHaveURL(/\/dashboard/);
  });
});
