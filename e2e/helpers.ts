import {
  type Page,
  expect,
  type Browser,
  type BrowserContext,
} from '@playwright/test';
import path from 'path';
import fs from 'fs';

let userCounter = 0;

/** Generate a unique test email for this test run */
export function uniqueEmail(prefix = 'e2e-frontend'): string {
  userCounter++;
  return `e2e-frontend-${prefix}-${Date.now()}-${userCounter}@test.com`;
}

export const TEST_PASSWORD = 'TestPassword123!';

/**
 * Sign up a new user and end up on /dashboard.
 *
 * Handles two re-entry cases automatically:
 * 1. Already authenticated (previous test in same worker left cookies) → stays on dashboard.
 * 2. Email already registered (beforeEach rerun) → falls back to logIn.
 */
export async function signUp(
  page: Page,
  email: string,
  password = TEST_PASSWORD
) {
  await page.goto('/signup');

  // If middleware already redirected us to /dashboard (still authenticated), we're done.
  if (page.url().includes('/dashboard')) return;

  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.locator('#confirmPassword').fill(password);
  await page.getByRole('button', { name: 'Create account' }).click();

  // If already registered the backend shows an error toast and stays on /signup;
  // fall back to login in that case.
  try {
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 8_000 });
  } catch {
    await logIn(page, email, password);
  }
}

/** Log in with existing credentials and end up on /dashboard */
export async function logIn(
  page: Page,
  email: string,
  password = TEST_PASSWORD
) {
  await page.goto('/login');

  // If already authenticated, middleware redirects to /dashboard
  if (page.url().includes('/dashboard')) return;

  await page.locator('#email').fill(email);
  await page.locator('#password').fill(password);
  await page.getByRole('button', { name: 'Sign in' }).click();
  await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });
}

/**
 * Sign up a brand-new user using a dedicated browser context.
 * Useful in beforeAll hooks where `page` is not available.
 */
export async function signUpOnce(
  browser: Browser,
  email: string,
  password = TEST_PASSWORD
): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await signUp(page, email, password);
  } finally {
    await context.close();
  }
}

/**
 * Sign up once and save the authenticated browser state (cookies) to a file.
 * Subsequent tests can load this file as `storageState` to skip login entirely.
 *
 * Usage in beforeAll:
 *   const stateFile = await signUpAndSaveState(browser, email);
 *
 * Usage in test:
 *   test.use({ storageState: stateFile });  // or pass to newContext()
 */
export async function signUpAndSaveState(
  browser: Browser,
  email: string,
  password = TEST_PASSWORD
): Promise<string> {
  const stateFile = path.join(
    __dirname,
    '.auth',
    `${email.split('@')[0]}.json`
  );

  // Reuse existing state if already saved in this run
  if (fs.existsSync(stateFile)) return stateFile;

  fs.mkdirSync(path.dirname(stateFile), { recursive: true });

  const context = await browser.newContext();
  const page = await context.newPage();
  try {
    await signUp(page, email, password);
    await context.storageState({ path: stateFile });
  } finally {
    await context.close();
  }
  return stateFile;
}

/**
 * Restore a saved auth state into an existing context's page.
 * Faster than logIn() — no network round-trip needed.
 */
export async function restoreState(
  context: BrowserContext,
  stateFile: string
): Promise<void> {
  const raw = fs.readFileSync(stateFile, 'utf-8');
  const state = JSON.parse(raw) as {
    cookies: Parameters<BrowserContext['addCookies']>[0];
  };
  await context.addCookies(state.cookies);
}
