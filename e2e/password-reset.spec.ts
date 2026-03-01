import { test, expect } from '@playwright/test';

test.describe('Password Reset Flow', () => {
  test.describe('Forgot Password', () => {
    test('renders forgot password form', async ({ page }) => {
      await page.goto('/forgot-password');

      await expect(page.locator('#email')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /send reset link/i })
      ).toBeVisible();
    });

    test('submitting email shows success state', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.locator('#email').fill('test@example.com');
      await page.getByRole('button', { name: /send reset link/i }).click();

      // Should show success message (even if email doesn't exist, backend returns 200)
      await expect(page.getByText(/check your inbox/i)).toBeVisible({
        timeout: 10_000,
      });
    });

    test('back to sign in link works', async ({ page }) => {
      await page.goto('/forgot-password');

      await page.locator('#email').fill('test@example.com');
      await page.getByRole('button', { name: /send reset link/i }).click();
      await expect(page.getByText(/check your inbox/i)).toBeVisible({
        timeout: 10_000,
      });

      await page.getByRole('link', { name: /sign in/i }).click();
      await expect(page).toHaveURL(/\/login/);
    });
  });

  test.describe('Reset Password', () => {
    test('shows error state when no token provided', async ({ page }) => {
      await page.goto('/reset-password');

      // Should show invalid link message
      await expect(page.getByText(/invalid link/i)).toBeVisible();
    });

    test('shows form when token is provided', async ({ page }) => {
      await page.goto('/reset-password?token=fake-token');

      // Should show password fields
      await expect(page.locator('#new_password')).toBeVisible();
      await expect(page.locator('#confirmPassword')).toBeVisible();
      await expect(
        page.getByRole('button', { name: /set.*password|reset.*password/i })
      ).toBeVisible();
    });

    test('shows validation error for mismatched passwords', async ({
      page,
    }) => {
      await page.goto('/reset-password?token=fake-token');

      await page.locator('#new_password').fill('NewPassword123!');
      await page.locator('#confirmPassword').fill('DifferentPassword123!');
      await page
        .getByRole('button', { name: /set.*password|reset.*password/i })
        .click();

      // Should show mismatch error
      await expect(page.getByText(/match/i)).toBeVisible();
    });
  });

  test.describe('Verify Email', () => {
    test('shows error when no token provided', async ({ page }) => {
      await page.goto('/verify-email');

      await expect(page.getByText(/invalid link/i)).toBeVisible();
    });

    test('shows verifying state with token', async ({ page }) => {
      await page.goto('/verify-email?token=fake-token');

      // Should show either verifying or error (fake token will fail)
      await expect(
        page.getByText(/verifying|verification failed|invalid/i)
      ).toBeVisible({ timeout: 10_000 });
    });
  });
});
