import { test, expect } from '@playwright/test';
import { logIn, uniqueEmail, TEST_PASSWORD } from './helpers';

const TEST_EMAIL = uniqueEmail('auth');

test.describe('Authentication', () => {
  test.describe.configure({ mode: 'serial' });

  test('signup → redirect to dashboard', async ({ page }) => {
    await page.goto('/signup');

    await page.locator('#name').fill('E2E Test User');
    await page.locator('#email').fill(TEST_EMAIL);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page.locator('#confirmPassword').fill(TEST_PASSWORD);

    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
  });

  test('logout → redirect to login', async ({ page }) => {
    await logIn(page, TEST_EMAIL);

    // Open user avatar dropdown
    await page.getByRole('button', { name: /^[A-Z]{1,3}$/ }).click();

    // Click "Log out" menu item — opens a confirmation dialog
    await page.getByRole('menuitem', { name: /log\s*out/i }).click();

    // Confirm in the AlertDialog
    await page
      .getByRole('button', { name: /^log\s*out$/i })
      .last()
      .click();

    await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
  });

  test('login with valid credentials → dashboard', async ({ page }) => {
    await page.goto('/login');

    await page.locator('#email').fill(TEST_EMAIL);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await expect(page.getByText('Welcome back!')).toBeVisible({
      timeout: 5_000,
    });
  });

  test('login with invalid credentials → stays on login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('#email')).toBeVisible();

    await page.locator('#email').fill('wrong@example.com');
    await page.locator('#password').fill('WrongPassword123');

    const [response] = await Promise.all([
      page.waitForResponse(r => r.url().includes('/api/v1/auth/login')),
      page.getByRole('button', { name: 'Sign in' }).click(),
    ]);

    expect(response.status()).toBe(401);
    await expect(page).toHaveURL(/\/login/);
  });

  test('login form validation — empty fields', async ({ page }) => {
    await page.goto('/login');

    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(
      page.getByText(/please enter a valid email/i).first()
    ).toBeVisible();
    await expect(page.getByText(/password is required/i)).toBeVisible();
  });

  test('protected route redirects to login with callbackUrl', async ({
    page,
  }) => {
    await page.context().clearCookies();

    await page.goto('/translate');

    await expect(page).toHaveURL(/\/login.*callbackUrl/i, {
      timeout: 10_000,
    });
  });

  test('authenticated user visiting /login redirects to dashboard', async ({
    page,
  }) => {
    await logIn(page, TEST_EMAIL);

    await page.goto('/login');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });
  });

  test('signup form validation — password mismatch', async ({ page }) => {
    await page.goto('/signup');

    await page.locator('#email').fill('mismatch@test.com');
    await page.locator('#password').fill('Password123!');
    await page.locator('#confirmPassword').fill('DifferentPassword!');
    await page.getByRole('button', { name: 'Create account' }).click();

    await expect(page.getByText(/match/i)).toBeVisible();
  });

  test('signup form shows password strength indicator', async ({ page }) => {
    await page.goto('/signup');

    await page.locator('#password').fill('ab');
    await expect(page.getByText(/weak/i)).toBeVisible();

    await page.locator('#password').fill('StrongPass123!');
    await expect(page.getByText(/good|strong/i)).toBeVisible();
  });

  test('callbackUrl works after login', async ({ page }) => {
    await page.context().clearCookies();

    // Try to access translate page → redirected to login with callbackUrl
    await page.goto('/translate');
    await expect(page).toHaveURL(/\/login.*callbackUrl/i, {
      timeout: 10_000,
    });

    // Login
    await page.locator('#email').fill(TEST_EMAIL);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    // Should redirect to /translate (the original destination), not /dashboard
    await expect(page).toHaveURL(/\/translate/, { timeout: 15_000 });
  });
});
