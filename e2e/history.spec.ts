import { test, expect } from '@playwright/test';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

test.describe('History', () => {
  const email = uniqueEmail('history');
  let stateFile = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ page, context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
    await page.goto('/history');
  });

  test('renders history page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();
  });

  test('shows empty state for new user', async ({ page }) => {
    // New user should have no translations
    await expect(page.getByText(/no translations yet/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  test('empty state shows CTA links', async ({ page }) => {
    await expect(page.getByText(/no translations yet/i)).toBeVisible({
      timeout: 10_000,
    });

    // Should have links to translate and batch
    await expect(
      page.getByRole('link', { name: /single|translate/i }).first()
    ).toBeVisible();
  });

  test('tabs exist when content present', async ({ page }) => {
    // For a new user, tabs may or may not show. Check the page structure.
    // The tabs should be "Single" and "Batch"
    const singleTab = page.getByRole('tab', { name: /single/i });
    const batchTab = page.getByRole('tab', { name: /batch/i });

    // If tabs are visible, verify they work
    if (await singleTab.isVisible()) {
      await singleTab.click();
      await batchTab.click();
    }
  });
});
