import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

const FIXTURE = path.join(__dirname, 'fixtures/test-image.png');
const LARGE_FIXTURE = path.join(__dirname, 'fixtures/test-image-large.png');
const PDF_FIXTURE = path.join(__dirname, 'fixtures/test-document.pdf');

// ── Single image uploader ────────────────────────────────────────────────────

test.describe('Single translate — file upload validation', () => {
  test.describe.configure({ mode: 'serial' });

  const email = uniqueEmail('upload-single');
  let stateFile = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ page, context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
    await page.goto('/translate');
    await expect(page.getByText('Translate Image')).toBeVisible();
  });

  test('wrong file type shows error message', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(PDF_FIXTURE);

    await expect(
      page.getByText(/unsupported format|invalid type|jpeg.*png.*webp/i).first()
    ).toBeVisible({ timeout: 5_000 });

    // Translate button should remain disabled
    await expect(
      page.getByRole('main').getByRole('button', { name: 'Translate' })
    ).toBeDisabled();
  });

  test('file over 10MB shows size error', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(LARGE_FIXTURE);

    await expect(page.getByText(/too large|10.*mb|size/i).first()).toBeVisible({
      timeout: 5_000,
    });

    // Translate button should remain disabled
    await expect(
      page.getByRole('main').getByRole('button', { name: 'Translate' })
    ).toBeDisabled();
  });

  test('valid image clears any previous error', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();

    // First upload invalid file
    await fileInput.setInputFiles(PDF_FIXTURE);
    await expect(
      page.getByText(/unsupported format|invalid type/i).first()
    ).toBeVisible({ timeout: 5_000 });

    // Then upload valid file — translate button should become enabled
    await fileInput.setInputFiles(FIXTURE);
    await expect(
      page.getByRole('main').getByRole('button', { name: 'Translate' })
    ).toBeEnabled({ timeout: 5_000 });
  });
});

// ── Batch image uploader ─────────────────────────────────────────────────────

test.describe('Batch — file upload validation', () => {
  test.describe.configure({ mode: 'serial' });

  const email = uniqueEmail('upload-batch');
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

  test('wrong file type rejected with error message', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(PDF_FIXTURE);

    await expect(
      page.getByText(/rejected|unsupported format|invalid type/i).first()
    ).toBeVisible({ timeout: 5_000 });

    // Start Batch button should remain disabled (no valid files)
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });

  test('file over 10MB rejected with size error', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(LARGE_FIXTURE);

    await expect(
      page.getByText(/too large|10.*mb|rejected/i).first()
    ).toBeVisible({ timeout: 5_000 });

    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });

  test('valid file accepted after rejected file', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();

    // Upload invalid first
    await fileInput.setInputFiles(PDF_FIXTURE);
    await expect(page.getByText(/rejected/i).first()).toBeVisible({
      timeout: 5_000,
    });

    // Upload valid file — it should appear in the file list
    await fileInput.setInputFiles(FIXTURE);
    await expect(page.getByText('test-image.png')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('uploading multiple valid files shows count', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles([FIXTURE, FIXTURE]);

    // Should show "2 of 20 images" (or similar count)
    await expect(page.getByText(/2 of 20|2.*images/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test('clear all button removes all files', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(FIXTURE);
    await expect(page.getByText('test-image.png')).toBeVisible();

    await page.getByRole('button', { name: /clear all/i }).click();

    await expect(page.getByText('test-image.png')).not.toBeVisible();
    await expect(
      page.getByRole('button', { name: /start batch/i })
    ).toBeDisabled();
  });
});
