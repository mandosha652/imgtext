import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

test.describe('Translate', () => {
  const email = uniqueEmail('translate');
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

  test('renders translate page with upload and result panels', async ({
    page,
  }) => {
    await expect(page.getByText('Upload Image').first()).toBeVisible();

    // Empty state on right
    await expect(
      page.getByText(/your translated image will appear here/i)
    ).toBeVisible();
  });

  test('translate button is disabled without image', async ({ page }) => {
    const translateBtn = page
      .getByRole('main')
      .getByRole('button', { name: 'Translate' });
    await expect(translateBtn).toBeDisabled();
  });

  test('upload image → translate button becomes enabled', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures/test-image.png')
    );

    const translateBtn = page
      .getByRole('main')
      .getByRole('button', { name: 'Translate' });
    await expect(translateBtn).toBeEnabled();
  });

  test('upload image → translate → shows result', async ({ page }) => {
    test.setTimeout(150_000);
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures/test-image.png')
    );

    // Select target language (pick German)
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

    // Should show loading state
    await expect(page.getByText('Processing your image...')).toBeVisible();

    // Wait for result (translation can take a while)
    await expect(page.getByText('Translation Result')).toBeVisible({
      timeout: 120_000,
    });

    // New button should appear
    await expect(page.getByRole('button', { name: 'New' })).toBeVisible();
  });

  test('upload image → remove image', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures/test-image.png')
    );

    await expect(
      page.getByRole('main').getByRole('button', { name: 'Translate' })
    ).toBeEnabled();

    await page.getByRole('button', { name: 'Remove image' }).click();

    await expect(
      page.getByRole('main').getByRole('button', { name: 'Translate' })
    ).toBeDisabled();
  });

  test('new button resets the form', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(
      path.join(__dirname, 'fixtures/test-image.png')
    );

    const newBtn = page.getByRole('button', { name: 'New' });
    await expect(newBtn).toBeVisible();
    await newBtn.click();

    await expect(
      page.getByRole('main').getByRole('button', { name: 'Translate' })
    ).toBeDisabled();
  });

  test('source language defaults to auto-detect', async ({ page }) => {
    const sourceSelect = page
      .getByText('Source Language')
      .locator('..')
      .getByRole('combobox');

    await expect(sourceSelect).toContainText(/auto/i);
  });

  test('exclude text field shows entry count', async ({ page }) => {
    const excludeInput = page.locator('#excludeText');
    await excludeInput.fill('Nike,Brand,Logo');

    await expect(page.getByText(/3 entries will be excluded/i)).toBeVisible();
  });

  test('exclude text shows warning for consecutive commas', async ({
    page,
  }) => {
    const excludeInput = page.locator('#excludeText');
    await excludeInput.fill('Nike,,Brand');

    await expect(page.getByText(/consecutive commas/i)).toBeVisible();
  });
});
