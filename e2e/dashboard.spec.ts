import { test, expect } from '@playwright/test';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

test.describe('Dashboard', () => {
  const email = uniqueEmail('dashboard');
  let stateFile = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ page, context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
    await page.goto('/dashboard');
  });

  test('shows welcome heading with user info', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /welcome/i })).toBeVisible();
  });

  test('shows quick action cards', async ({ page }) => {
    // Quick Translate card
    await expect(
      page.getByRole('link', { name: /translate/i }).first()
    ).toBeVisible();

    // Batch Translate card
    await expect(
      page.getByRole('link', { name: /batch/i }).first()
    ).toBeVisible();
  });

  test('quick translate link navigates to /translate', async ({ page }) => {
    await page
      .getByRole('link', { name: /quick translate|translate/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/translate/);
  });

  test('quick batch link navigates to /batch', async ({ page }) => {
    await page.getByRole('link', { name: /batch/i }).first().click();
    await expect(page).toHaveURL(/\/batch/);
  });
});
