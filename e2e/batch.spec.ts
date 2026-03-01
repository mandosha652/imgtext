import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

const FIXTURE = path.join(__dirname, 'fixtures/test-image.png');

test.describe('Batch Translation', () => {
  test.describe.configure({ mode: 'serial' });

  const email = uniqueEmail('batch');
  let stateFile = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ page, context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
    await page.goto('/batch');
    await expect(
      page.getByRole('heading', { name: 'Batch Translation' })
    ).toBeVisible();
  });

  // ── Page structure ────────────────────────────────────────────────────────

  test('renders batch page with form and empty active-batches panel', async ({
    page,
  }) => {
    await expect(page.getByText('New Batch').first()).toBeVisible();
    await expect(page.getByText('Target Languages')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
    await expect(page.getByText('No active batches')).toBeVisible();
  });

  // ── File upload ───────────────────────────────────────────────────────────

  test('start batch button is disabled without files', async ({ page }) => {
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });

  test('uploading a file shows it in the file list with count', async ({
    page,
  }) => {
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await expect(page.getByText(/test-image/i)).toBeVisible();
    await expect(page.getByText(/1 of 20 images/)).toBeVisible();
  });

  test('uploading multiple files shows correct count', async ({ page }) => {
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles([FIXTURE, FIXTURE]);
    await expect(page.getByText(/2 of 20 images/)).toBeVisible();
  });

  test('remove individual file via remove button', async ({ page }) => {
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await expect(page.getByText(/1 of 20 images/)).toBeVisible();
    await page.getByRole('button', { name: /remove test-image/i }).click();
    await expect(page.getByText(/of 20 images/)).not.toBeVisible();
  });

  test('clear all files removes them all', async ({ page }) => {
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles([FIXTURE, FIXTURE]);
    await expect(page.getByText(/2 of 20 images/)).toBeVisible();
    await page.getByRole('button', { name: 'Clear all' }).click();
    await expect(page.getByText(/of 20 images/)).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });

  // ── Language selection ────────────────────────────────────────────────────

  test('all supported language buttons are visible', async ({ page }) => {
    await expect(page.getByRole('button', { name: 'English' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'German' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'French' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Spanish' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Dutch' })).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Portuguese' })
    ).toBeVisible();
    await expect(page.getByRole('button', { name: 'Swedish' })).toBeVisible();
  });

  test('selecting a language shows badge and increments counter', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'German' }).click();
    await expect(page.getByText('1/10')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Remove German' })
    ).toBeVisible();
  });

  test('selecting multiple languages tracks count correctly', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: 'French' }).click();
    await page.getByRole('button', { name: 'Spanish' }).click();
    await expect(page.getByText('3/10')).toBeVisible();
  });

  test('removing a language via badge decrements counter', async ({ page }) => {
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: 'French' }).click();
    await expect(page.getByText('2/10')).toBeVisible();
    await page.getByRole('button', { name: 'Remove German' }).click();
    await expect(page.getByText('1/10')).toBeVisible();
    await expect(
      page.getByRole('button', { name: 'Remove German' })
    ).not.toBeVisible();
  });

  test('file only (no language) keeps start batch disabled', async ({
    page,
  }) => {
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await expect(page.getByText(/1 of 20 images/)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });

  test('language only (no file) keeps start batch disabled', async ({
    page,
  }) => {
    await page.getByRole('button', { name: 'German' }).click();
    await expect(page.getByText('1/10')).toBeVisible();
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });

  test('file + language enables start batch button', async ({ page }) => {
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await page.getByRole('button', { name: 'German' }).click();
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeEnabled();
  });

  // ── Source language ───────────────────────────────────────────────────────

  test('source language defaults to auto-detect', async ({ page }) => {
    const sourceSelect = page
      .getByText('Source Language')
      .locator('..')
      .getByRole('combobox');
    await expect(sourceSelect).toContainText(/auto/i);
  });

  // ── Exclude text ──────────────────────────────────────────────────────────

  test('exclude text field shows entry count', async ({ page }) => {
    await page.locator('#excludeText').fill('Nike,Brand,Logo');
    await expect(page.getByText(/3 entr/i)).toBeVisible();
  });

  test('exclude text warns about consecutive commas', async ({ page }) => {
    await page.locator('#excludeText').fill('Nike,,Brand');
    await expect(page.getByText(/consecutive commas/i)).toBeVisible();
  });

  // ── Webhook URL ───────────────────────────────────────────────────────────

  test('valid webhook URL shows confirmation hint', async ({ page }) => {
    await page.locator('#webhookUrl').fill('https://example.com/webhook');
    await expect(page.getByText(/POST will be sent/i)).toBeVisible();
  });

  test('invalid webhook URL shows error and disables submit', async ({
    page,
  }) => {
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await page.getByRole('button', { name: 'German' }).click();
    await page.locator('#webhookUrl').fill('not-a-url');
    await expect(page.getByText(/valid url/i)).toBeVisible();
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });

  test('fixing invalid webhook URL re-enables submit', async ({ page }) => {
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await page.getByRole('button', { name: 'German' }).click();
    await page.locator('#webhookUrl').fill('not-a-url');
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
    await page.locator('#webhookUrl').fill('https://example.com/webhook');
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeEnabled();
  });

  // ── Submit: single language ───────────────────────────────────────────────

  test('submit batch with one language → active batch card appears', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: /start batch/i }).click();

    // Button enters "Starting…" while mutation is in flight
    await expect(page.getByRole('button', { name: /starting/i })).toBeVisible();

    // Active batch card appears on the right with status badge
    await expect(page.getByText('Running').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Pending|Processing/).first()).toBeVisible();

    // Form resets automatically after successful submit
    await expect(page.getByText('0/10')).toBeVisible();
  });

  // ── Submit: multiple languages (KEY TEST) ────────────────────────────────

  test('submit batch with multiple target languages → toast confirms count, active card shows, form resets', async ({
    page,
  }) => {
    test.setTimeout(60_000);

    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);

    // Select 3 languages
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: 'French' }).click();
    await page.getByRole('button', { name: 'Spanish' }).click();
    await expect(page.getByText('3/10')).toBeVisible();

    await page.getByRole('button', { name: /start batch/i }).click();

    // Toast confirms the batch was created
    await expect(page.getByText(/batch started with 1 image/i)).toBeVisible({
      timeout: 15_000,
    });

    // Active batch card appears in the right column
    await expect(page.getByText('Running').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Pending|Processing/).first()).toBeVisible();

    // Form resets — language counter back to 0, file list gone
    await expect(page.getByText('0/10')).toBeVisible();
    await expect(page.getByText(/of 20 images/)).not.toBeVisible();
  });
});

// ── Cancel test in its own isolated describe ──────────────────────────────────
// Kept separate so a timeout here doesn't poison the serial suite above.

test.describe('Batch Translation – cancel', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(90_000);

  const cancelEmail = uniqueEmail('batch-cancel');
  let cancelStateFile = '';

  test.beforeAll(async ({ browser }) => {
    cancelStateFile = await signUpAndSaveState(browser, cancelEmail);
  });

  test.beforeEach(async ({ page, context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(cancelStateFile, 'utf-8'));
    await context.addCookies(cookies);
    await page.goto('/batch');
    await expect(
      page.getByRole('heading', { name: 'Batch Translation' })
    ).toBeVisible();
  });

  test('cancel a running batch removes it from active panel', async ({
    page,
  }) => {
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: /start batch/i }).click();

    // Wait for the active batch card to appear
    await expect(page.getByText('Running').first()).toBeVisible({
      timeout: 30_000,
    });

    // Cancel the first active batch
    const cancelBtn = page
      .getByRole('button', { name: 'Cancel Batch' })
      .first();
    await expect(cancelBtn).toBeVisible({ timeout: 10_000 });
    await cancelBtn.click();

    // Active panel returns to empty state (or batch shows as cancelled)
    await expect(page.getByText('No active batches')).toBeVisible({
      timeout: 30_000,
    });
  });
});
