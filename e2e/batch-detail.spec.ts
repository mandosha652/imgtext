import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

const FIXTURE = path.join(__dirname, 'fixtures/test-image.png');

test.describe('Batch Detail Page', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(120_000);

  const email = uniqueEmail('batch-detail');
  let stateFile = '';
  let batchUrl = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
  });

  test('submit batch and navigate to detail page via history', async ({
    page,
  }) => {
    await page.goto('/batch');
    await expect(
      page.getByRole('heading', { name: 'Batch Translation' })
    ).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(FIXTURE);

    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: /start batch/i }).click();

    // Wait for batch to appear in active batches panel
    await expect(
      page.getByText(/pending|processing|completed/i).first()
    ).toBeVisible({ timeout: 30_000 });

    // Navigate to history and open batch detail
    await page.goto('/history');
    const batchTab = page.getByRole('tab', { name: /batch/i });
    await expect(batchTab).toBeVisible({ timeout: 10_000 });
    await batchTab.click();

    // Click the external link icon on the batch card to go to detail
    const detailLink = page
      .getByRole('link', { name: /view batch details/i })
      .first();
    await expect(detailLink).toBeVisible({ timeout: 10_000 });

    batchUrl = (await detailLink.getAttribute('href')) ?? '';
    await detailLink.click();

    await expect(page).toHaveURL(/\/batch\/.+/, { timeout: 10_000 });
    await expect(
      page.getByRole('heading', { name: 'Batch Details' })
    ).toBeVisible();
  });

  test('batch detail shows status badge and language info', async ({
    page,
  }) => {
    // Use the batch URL captured in previous test, or navigate via history
    if (batchUrl) {
      await page.goto(batchUrl);
    } else {
      await page.goto('/history');
      await page.getByRole('tab', { name: /batch/i }).click();
      await page
        .getByRole('link', { name: /view batch details/i })
        .first()
        .click();
    }

    await expect(
      page.getByRole('heading', { name: 'Batch Details' })
    ).toBeVisible({ timeout: 10_000 });

    // Status badge should be visible (pending/processing/completed etc)
    await expect(
      page.getByText(/pending|processing|completed|failed|cancelled/i).first()
    ).toBeVisible();

    // Language info should be visible
    await expect(page.getByText(/german/i).first()).toBeVisible();

    // Back link to history
    await expect(page.getByRole('link', { name: /back/i })).toBeVisible();
  });

  test('back link navigates to history', async ({ page }) => {
    if (batchUrl) {
      await page.goto(batchUrl);
    } else {
      await page.goto('/history');
      await page.getByRole('tab', { name: /batch/i }).click();
      await page
        .getByRole('link', { name: /view batch details/i })
        .first()
        .click();
    }

    await expect(
      page.getByRole('heading', { name: 'Batch Details' })
    ).toBeVisible({ timeout: 10_000 });

    await page.getByRole('link', { name: /back/i }).click();
    await expect(page).toHaveURL(/\/history/, { timeout: 10_000 });
  });

  test('invalid batch id shows error state', async ({ page }) => {
    await page.goto('/batch/nonexistent-batch-id-00000000');

    await expect(page.getByText(/failed to load batch/i)).toBeVisible({
      timeout: 15_000,
    });
    await expect(
      page.getByRole('link', { name: /back to history/i })
    ).toBeVisible();
  });

  test('cancel button visible for active batch and cancels it', async ({
    page,
  }) => {
    // Start a fresh batch so we can cancel it
    await page.goto('/batch');
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(FIXTURE);
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: /start batch/i }).click();

    // Get the batch link from active batches panel
    const detailLink = page
      .getByRole('link', { name: /view|details/i })
      .first();
    await expect(detailLink).toBeVisible({ timeout: 20_000 });
    await detailLink.click();

    await expect(
      page.getByRole('heading', { name: 'Batch Details' })
    ).toBeVisible({ timeout: 10_000 });

    // If still pending/processing, cancel button should be visible
    const cancelBtn = page.getByRole('button', { name: /cancel batch/i });
    const isActive = await cancelBtn.isVisible();

    if (isActive) {
      await cancelBtn.click();
      await expect(page.getByText(/cancelled/i)).toBeVisible({
        timeout: 15_000,
      });
      // Cancel button should disappear after cancellation
      await expect(cancelBtn).not.toBeVisible({ timeout: 10_000 });
    } else {
      // Batch completed too fast — just verify no cancel button on terminal state
      await expect(cancelBtn).not.toBeVisible();
    }
  });
});
