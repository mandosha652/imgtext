import { test, expect } from '@playwright/test';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

test.describe('Settings', () => {
  const email = uniqueEmail('settings');
  let stateFile = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ page, context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
    await page.goto('/settings');
  });

  test('renders all settings sections', async ({ page }) => {
    // Account section
    await expect(page.getByText(/account/i).first()).toBeVisible();

    // Password section
    await expect(page.getByText(/password/i).first()).toBeVisible();

    // API Keys section
    await expect(page.getByText(/api key/i).first()).toBeVisible();

    // Danger Zone section
    await expect(page.getByText(/danger zone/i).first()).toBeVisible();
  });

  test.describe('Account Info', () => {
    test('shows user email', async ({ page }) => {
      await expect(page.getByText(email)).toBeVisible();
    });

    test('edit profile name', async ({ page }) => {
      // Click edit button
      await page.getByRole('button', { name: /edit/i }).first().click();

      // Name input should appear
      const nameInput = page.locator('input[name="name"], #name').first();
      if (await nameInput.isVisible()) {
        await nameInput.fill('Updated Name');
        await page.getByRole('button', { name: /save/i }).click();

        // Should show success feedback
        await expect(page.getByText(/updated|saved/i).first()).toBeVisible({
          timeout: 10_000,
        });
      }
    });
  });

  test.describe('Change Password', () => {
    test('shows password change form fields', async ({ page }) => {
      // Scroll to password section
      await page
        .getByText(/change password/i)
        .first()
        .scrollIntoViewIfNeeded();

      await expect(
        page.locator('#currentPassword, input[name="currentPassword"]').first()
      ).toBeVisible();
      await expect(
        page.locator('#newPassword, input[name="newPassword"]').first()
      ).toBeVisible();
    });

    test('validation error for wrong current password', async ({ page }) => {
      await page
        .getByText(/change password/i)
        .first()
        .scrollIntoViewIfNeeded();

      const currentPw = page
        .locator('#currentPassword, input[name="currentPassword"]')
        .first();
      const newPw = page
        .locator('#newPassword, input[name="newPassword"]')
        .first();
      const confirmPw = page
        .locator(
          '#confirmNewPassword, input[name="confirmNewPassword"], #confirmPassword'
        )
        .first();

      await currentPw.fill('WrongPassword123!');
      await newPw.fill('NewPassword456!');
      if (await confirmPw.isVisible()) {
        await confirmPw.fill('NewPassword456!');
      }

      await page.getByRole('button', { name: /change password/i }).click();

      // Should show error
      await expect(
        page.getByText(/incorrect|wrong|invalid/i).first()
      ).toBeVisible({ timeout: 10_000 });
    });
  });

  test.describe('API Keys', () => {
    test('shows create new key button', async ({ page }) => {
      await page
        .getByText(/api key/i)
        .first()
        .scrollIntoViewIfNeeded();

      await expect(
        page.getByRole('button', { name: /create.*key/i })
      ).toBeVisible();
    });

    test('create API key flow', async ({ page }) => {
      await page
        .getByText(/api key/i)
        .first()
        .scrollIntoViewIfNeeded();

      await page.getByRole('button', { name: /create.*key/i }).click();

      // Dialog should open
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Fill name and create
      const nameInput = dialog.locator('input').first();
      await nameInput.fill('Test Key');
      await dialog.getByRole('button', { name: /create/i }).click();

      // Should show the generated key
      await expect(page.getByText(/copy|key.*created/i).first()).toBeVisible({
        timeout: 10_000,
      });
    });
  });

  test.describe('Danger Zone', () => {
    test('delete account button opens confirmation dialog', async ({
      page,
    }) => {
      await page
        .getByText(/danger zone/i)
        .first()
        .scrollIntoViewIfNeeded();

      await page.getByRole('button', { name: /delete account/i }).click();

      // Confirmation dialog should appear
      await expect(
        page.getByText(/this is permanent|cannot be undone|are you sure/i)
      ).toBeVisible();

      // Cancel to not actually delete
      await page.getByRole('button', { name: /cancel/i }).click();
    });
  });
});
