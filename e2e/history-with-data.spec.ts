import { test, expect } from '@playwright/test';
import path from 'path';
import { signUp, uniqueEmail } from './helpers';

test.describe('History – single translation appears after translate', () => {
  const email = uniqueEmail('history-single');

  test('translate image → appears in history as Single entry', async ({
    page,
  }) => {
    test.setTimeout(150_000);
    await signUp(page, email);

    await page.goto('/translate', { waitUntil: 'domcontentloaded' });
    await expect(page.getByText('Translate Image')).toBeVisible({
      timeout: 15_000,
    });

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures/test-image.png')
    );

    const targetSelect = page
      .getByText('Target Language')
      .locator('..')
      .getByRole('combobox');
    await targetSelect.click();
    await page.getByRole('option', { name: 'German' }).click();

    await page
      .getByRole('main')
      .getByRole('button', { name: 'Translate' })
      .click();
    await expect(page.getByText('Translation complete')).toBeVisible({
      timeout: 120_000,
    });

    await page.goto('/history');
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();

    // Should NOT show empty state
    await expect(page.getByText(/no translations yet/i)).not.toBeVisible({
      timeout: 10_000,
    });

    // Single tab should be visible
    await expect(page.getByRole('tab', { name: /single/i })).toBeVisible();

    // A card with "German" should be visible
    await expect(page.getByText(/german/i).first()).toBeVisible();
  });
});

test.describe('History – batch appears after batch submission', () => {
  const email = uniqueEmail('history-batch');

  test('submit batch → appears in history Batch tab', async ({ page }) => {
    await signUp(page, email);

    await page.goto('/batch');
    await expect(page.getByText(/new batch/i)).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures/test-image.png')
    );

    // MultiLanguageSelect renders language buttons directly (no dropdown).
    // Click the "German" button to select it as a target language.
    await page.getByRole('button', { name: 'German' }).click();

    await page.getByRole('button', { name: /start batch/i }).click();

    // Wait for batch submission confirmation (status badge or progress text)
    await expect(
      page.getByText(/pending|processing|completed/i).first()
    ).toBeVisible({ timeout: 30_000 });

    await page.goto('/history');
    await expect(page.getByRole('heading', { name: /history/i })).toBeVisible();

    // Click Batch tab
    const batchTab = page.getByRole('tab', { name: /batch/i });
    await expect(batchTab).toBeVisible({ timeout: 10_000 });
    await batchTab.click();

    // At least one batch entry should be visible (empty state must not show)
    await expect(page.getByText(/no translations yet/i)).not.toBeVisible();
  });
});
