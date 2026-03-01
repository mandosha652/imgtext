/**
 * Full user journey — one serial spec that walks a brand-new user through
 * every reachable feature of the product in natural usage order.
 *
 *   yarn test:e2e e2e/user-journey.spec.ts
 */

import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { uniqueEmail, TEST_PASSWORD } from './helpers';

const FIXTURE = path.join(__dirname, 'fixtures/test-image.png');
const email = uniqueEmail('journey');
const name = 'Journey User';

test.describe('Full user journey', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(300_000);

  let stateFile = '';

  // Sign up once before all tests, save auth state to disk
  test.beforeAll(async ({ browser }) => {
    stateFile = path.join(__dirname, '.auth', `journey-${Date.now()}.json`);
    fs.mkdirSync(path.dirname(stateFile), { recursive: true });

    const context = await browser.newContext();
    const page = await context.newPage();
    try {
      await page.goto('/signup');
      await page.locator('#name').fill(name);
      await page.locator('#email').fill(email);
      await page.locator('#password').fill(TEST_PASSWORD);
      await page.locator('#confirmPassword').fill(TEST_PASSWORD);
      await page.getByRole('button', { name: 'Create account' }).click();
      await expect(page).toHaveURL(/\/dashboard/, { timeout: 20_000 });
      await context.storageState({ path: stateFile });
    } finally {
      await context.close();
    }
  });

  // Inject saved cookies before each test (except 13 & 14 which test logout/login)
  test.beforeEach(async ({ context }, testInfo) => {
    const logoutTests = [
      '13 · log out — cancel then confirm',
      '14 · log back in — welcome back toast + onboarding progress',
    ];
    if (logoutTests.includes(testInfo.title)) return;

    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
  });

  // ── 1. Sign up ──────────────────────────────────────────────────────────────
  test('1 · sign up', async ({ page }) => {
    // Already authenticated from beforeAll — middleware redirects /signup → /dashboard
    await page.goto('/signup');
    await expect(page).toHaveURL(/\/dashboard/, { timeout: 10_000 });

    // Welcome heading includes the user's name
    await expect(
      page.getByRole('heading', { name: /welcome.*journey/i })
    ).toBeVisible();

    // Quick-action cards
    await expect(page.getByText('Quick Translate')).toBeVisible();
    await expect(page.getByText('Batch Translate')).toBeVisible();
  });

  // ── 2. Single image translation ─────────────────────────────────────────────
  test('2 · translate a single image to German', async ({ page }) => {
    await page.goto('/translate');
    await expect(
      page.getByRole('heading', { name: 'Translate Image' })
    ).toBeVisible({ timeout: 10_000 });

    // Empty state shown before any file is chosen
    await expect(
      page.getByText('Your translated image will appear here')
    ).toBeVisible();

    // Translate button disabled until a file is chosen
    const translateBtn = page
      .getByRole('main')
      .getByRole('button', { name: 'Translate' });
    await expect(translateBtn).toBeDisabled();

    // Upload image
    await page.locator('input[type="file"]').first().setInputFiles(FIXTURE);
    await expect(translateBtn).toBeEnabled();

    // Source language defaults to Auto-detect
    const sourceCombobox = page
      .getByText('Source Language')
      .locator('..')
      .getByRole('combobox');
    await expect(sourceCombobox).toContainText(/auto/i);

    // Pick German as target language
    const targetCombobox = page
      .getByText('Target Language')
      .locator('..')
      .getByRole('combobox');
    await targetCombobox.click();
    await page.getByRole('option', { name: 'German' }).click();

    // Exclude text: type entries and confirm helper text, then clear
    await page.locator('#excludeText').fill('BRAND,Logo');
    await expect(page.getByText('2 entries will be excluded')).toBeVisible();
    await page.locator('#excludeText').fill('');

    // Submit
    await translateBtn.click();

    // Loading state
    await expect(page.getByText('Processing your image...')).toBeVisible();

    // Result panel
    await expect(page.getByText('Translation Result')).toBeVisible({
      timeout: 120_000,
    });

    // New button resets the form back to empty state
    await page.getByRole('button', { name: 'New' }).click();
    await expect(translateBtn).toBeDisabled();
    await expect(
      page.getByText('Your translated image will appear here')
    ).toBeVisible();
  });

  // ── 3. Dashboard updates after first translation ─────────────────────────────
  test('3 · dashboard reflects first translation', async ({ page }) => {
    await page.goto('/dashboard');

    // All-time stat card appears for returning users
    await expect(page.getByText('total translations')).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText('All Time')).toBeVisible();
  });

  // ── 4. History — single tab ──────────────────────────────────────────────────
  test('4 · single translation appears in history with search', async ({
    page,
  }) => {
    await page.goto('/history');

    await expect(page.getByRole('heading', { name: 'History' })).toBeVisible();

    // Non-empty: Export JSON button visible
    await expect(
      page.getByRole('button', { name: /export json/i })
    ).toBeVisible({ timeout: 10_000 });

    // Single tab shown
    const singleTab = page.getByRole('tab', { name: /single/i });
    await expect(singleTab).toBeVisible();

    // German entry in the list
    await expect(page.getByText(/german/i).first()).toBeVisible();

    // Search works
    const searchInput = page.getByPlaceholder('Search by language…');
    await searchInput.fill('german');
    await expect(page.getByText(/german/i).first()).toBeVisible();

    await searchInput.fill('klingon');
    await expect(page.getByText(/no results match your search/i)).toBeVisible();

    // Clear button (×) next to search input
    await page.getByTitle('Clear').click();
    await expect(page.getByText(/german/i).first()).toBeVisible();
  });

  // ── 5. Batch — submit with 2 images × 3 languages ───────────────────────────
  test('5 · submit a batch — 2 images × 3 languages', async ({ page }) => {
    await page.goto('/batch');
    await expect(
      page.getByRole('heading', { name: 'Batch Translation' })
    ).toBeVisible();

    // Empty state on the right column
    await expect(page.getByText('No active batches')).toBeVisible();

    const startBtn = page.getByRole('button', { name: /start batch/i });
    await expect(startBtn).toBeDisabled();

    // Upload 2 files
    await page
      .locator('input[type="file"]')
      .first()
      .setInputFiles([FIXTURE, FIXTURE]);
    await expect(page.getByText(/2 of 20 images/)).toBeVisible();

    // File only → still disabled (no target language chosen)
    await expect(startBtn).toBeDisabled();

    // Select 3 target languages and verify counter
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: 'French' }).click();
    await page.getByRole('button', { name: 'Spanish' }).click();
    await expect(page.getByText('3/10')).toBeVisible();

    // Remove one and re-add it
    await page.getByRole('button', { name: 'Remove French' }).click();
    await expect(page.getByText('2/10')).toBeVisible();
    await page.getByRole('button', { name: 'French' }).click();
    await expect(page.getByText('3/10')).toBeVisible();

    // Now enabled
    await expect(startBtn).toBeEnabled();
    await startBtn.click();

    // Button briefly shows "Starting…"
    await expect(page.getByRole('button', { name: /starting/i })).toBeVisible();

    // Active batch card appears in the right column
    await expect(page.getByText('Running').first()).toBeVisible({
      timeout: 30_000,
    });
    await expect(page.getByText(/Pending|Processing/).first()).toBeVisible();

    // Form auto-resets
    await expect(page.getByText('0/10')).toBeVisible();
    await expect(page.getByText(/of 20 images/)).not.toBeVisible();
  });

  // ── 6. Batch detail page ─────────────────────────────────────────────────────
  test('6 · batch detail page via history external-link icon', async ({
    page,
  }) => {
    await page.goto('/history');

    // Switch to Batch tab
    const batchTab = page.getByRole('tab', { name: /batch/i });
    await expect(batchTab).toBeVisible({ timeout: 15_000 });
    await batchTab.click();

    // Wait for at least one batch entry to appear (batch from test 5 may still be processing)
    const detailLink = page
      .getByRole('link', { name: 'View batch details' })
      .first();
    await expect(detailLink).toBeVisible({ timeout: 60_000 });

    // Navigate via href to avoid click interception by the collapsible card
    const href = await detailLink.getAttribute('href');
    await page.goto(href!);

    await expect(page).toHaveURL(/\/batch\/.+/, { timeout: 15_000 });
    await expect(
      page.getByRole('heading', { name: 'Batch Details' })
    ).toBeVisible();

    // Status badge
    await expect(
      page
        .getByText(
          /Pending|Processing|Completed|Partially Completed|Cancelled/i
        )
        .first()
    ).toBeVisible();

    // Languages info
    await expect(page.getByText(/Languages:/i)).toBeVisible();

    // Back link returns to /history
    await page.getByRole('link', { name: /back/i }).click();
    await expect(page).toHaveURL(/\/history/);
  });

  // ── 7. Settings — profile edit ────────────────────────────────────────────────
  test('7 · settings — edit display name', async ({ page }) => {
    await page.goto('/settings');

    // Email shown in Account Information card (input #profileEmail)
    await expect(page.locator('#profileEmail')).toHaveValue(email);

    // Plan badge
    await expect(page.getByText(/free/i).first()).toBeVisible();

    // Click Edit button (top-right of AccountInfoCard)
    await page.getByRole('button', { name: 'Edit' }).click();

    // Name input (#profileName) becomes editable
    const nameInput = page.locator('#profileName');
    await nameInput.fill('Updated Journey User');

    // Save
    await page.getByRole('button', { name: 'Save' }).click();

    // Toast "Profile updated"
    await expect(page.getByText(/profile updated/i)).toBeVisible({
      timeout: 10_000,
    });
  });

  // ── 8. Settings — create and revoke an API key ───────────────────────────────
  test('8 · settings — create then revoke an API key', async ({
    page,
    context,
  }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/settings');

    // Scroll to the API Keys card (id="api-keys")
    await page.locator('#api-keys').scrollIntoViewIfNeeded();

    // Open create dialog — button says "Create Key"
    await page.getByRole('button', { name: 'Create Key' }).click();

    const dialog = page.getByRole('dialog');
    await expect(
      dialog.getByRole('heading', { name: 'Create API Key' })
    ).toBeVisible();

    // Fill name via #keyName, leave expiry blank (no expiration)
    await dialog.locator('#keyName').fill('Journey Key');
    await dialog.getByRole('button', { name: 'Create' }).click();

    // Dialog title flips to "API Key Created"
    await expect(
      dialog.getByRole('heading', { name: 'API Key Created' })
    ).toBeVisible({ timeout: 10_000 });

    // Warning shown: copy before closing
    await expect(dialog.getByText(/copy your api key/i).first()).toBeVisible();

    // Click the icon button next to the key input to copy it
    await dialog.locator('button[data-size="icon"]').click();

    // Confirmation text appears
    await expect(dialog.getByText(/key copied/i)).toBeVisible();

    // Close button is now enabled
    await dialog.getByRole('button', { name: 'Close' }).click();

    // Key row visible in the list
    await expect(page.getByText('Journey Key')).toBeVisible();
    await expect(page.getByText('Active').first()).toBeVisible();

    // Click the Trash icon on the "Journey Key" row to open revoke confirmation dialog
    // Find the row containing "Journey Key" text and click its last button (trash)
    await page
      .locator('*')
      .filter({ hasText: /^Journey Key/ })
      .locator('..')
      .locator('button')
      .last()
      .click();
    const revokeDialog = page.getByRole('dialog');
    await expect(revokeDialog).toBeVisible();
    await expect(revokeDialog.getByText(/revoke api key/i)).toBeVisible();

    // Confirm revocation
    await revokeDialog.getByRole('button', { name: 'Revoke Key' }).click();

    // After the 5 s undo window the key status changes to "Revoked"
    await expect(page.getByText('Revoked')).toBeVisible({ timeout: 15_000 });
  });

  // ── 9. Navigation ────────────────────────────────────────────────────────────
  test('9 · sidebar nav — walk every page', async ({ page }) => {
    await page.goto('/dashboard');

    const stops: Array<{ name: string | RegExp; url: RegExp }> = [
      { name: /^translate$/i, url: /\/translate/ },
      { name: /^batch$/i, url: /\/batch/ },
      { name: /^history$/i, url: /\/history/ },
      { name: /^settings$/i, url: /\/settings/ },
      { name: /^dashboard$/i, url: /\/dashboard/ },
    ];

    for (const stop of stops) {
      await page.getByRole('link', { name: stop.name }).first().click();
      await expect(page).toHaveURL(stop.url);
    }

    // ImgText logo always returns to /dashboard from any page
    await page.goto('/translate');
    await page
      .getByRole('link', { name: /imgtext/i })
      .first()
      .click();
    await expect(page).toHaveURL(/\/dashboard/);
  });

  // ── 10. Theme toggle ─────────────────────────────────────────────────────────
  test('10 · theme toggle switches light ↔ dark', async ({ page }) => {
    await page.goto('/dashboard');

    const html = page.locator('html');
    const before = await html.getAttribute('class');

    // aria-label="Toggle theme" on the button
    await page.getByRole('button', { name: 'Toggle theme' }).click();

    const after = await html.getAttribute('class');
    expect(after).not.toBe(before);
  });

  // ── 11. User avatar dropdown ─────────────────────────────────────────────────
  test('11 · avatar dropdown shows name, email, and quick links', async ({
    page,
  }) => {
    await page.goto('/dashboard');

    // Avatar button renders AvatarFallback with initials (e.g. "UJ")
    await page.getByRole('button', { name: /^[A-Z]{1,3}$/ }).click();

    const menu = page.getByRole('menu');
    await expect(menu).toBeVisible();

    // Name updated in step 7
    await expect(menu.getByText('Updated Journey User')).toBeVisible();
    await expect(menu.getByText(email)).toBeVisible();

    // Quick-nav items
    await expect(
      menu.getByRole('menuitem', { name: /settings/i })
    ).toBeVisible();
    await expect(menu.getByRole('menuitem', { name: /help/i })).toBeVisible();
    await expect(
      menu.getByRole('menuitem', { name: /what.?s new/i })
    ).toBeVisible();

    // Dismiss menu
    await page.keyboard.press('Escape');
    await expect(menu).not.toBeVisible();
  });

  // ── 12. Notification bell ────────────────────────────────────────────────────
  test('12 · notification bell opens the panel', async ({ page }) => {
    await page.goto('/dashboard');

    const bell = page.getByRole('button', { name: /notification/i });
    await expect(bell).toBeVisible();
    await bell.click();

    // Panel opens (may show "No notifications yet" for a new user)
    await expect(
      page.getByText(/notifications|no notifications/i).first()
    ).toBeVisible();
  });

  // ── 13. Log out (cancel + confirm) ───────────────────────────────────────────
  // No beforeEach cookie injection — starts fresh (logged-in from prior test's context)
  test('13 · log out — cancel then confirm', async ({ page, context }) => {
    // Inject cookies manually since beforeEach skips this test
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);

    await page.goto('/dashboard');

    // Open dropdown, click Log out
    await page.getByRole('button', { name: /^[A-Z]{1,3}$/ }).click();
    await page.getByRole('menuitem', { name: /log\s*out/i }).click();

    // AlertDialog appears with title "Log out?"
    const alertDialog = page.getByRole('alertdialog');
    await expect(alertDialog).toBeVisible();
    await expect(alertDialog.getByText('Log out?')).toBeVisible();

    // Cancel — stays on dashboard
    await alertDialog.getByRole('button', { name: 'Cancel' }).click();
    await expect(page).toHaveURL(/\/dashboard/);

    // Open again and confirm
    await page.getByRole('button', { name: /^[A-Z]{1,3}$/ }).click();
    await page.getByRole('menuitem', { name: /log\s*out/i }).click();
    await page
      .getByRole('alertdialog')
      .getByRole('button', { name: /^log\s*out$/i })
      .click();

    await expect(page).toHaveURL(/\/login/, { timeout: 15_000 });

    // Protected route now redirects unauthenticated user to login
    await page.goto('/dashboard');
    await expect(page).toHaveURL(/\/login/);
  });

  // ── 14. Log back in ───────────────────────────────────────────────────────────
  // Starts unauthenticated (no cookie injection) — tests the login flow
  test('14 · log back in — welcome back toast + onboarding progress', async ({
    page,
  }) => {
    await page.goto('/login');

    await page.locator('#email').fill(email);
    await page.locator('#password').fill(TEST_PASSWORD);
    await page.getByRole('button', { name: 'Sign in' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    // Sonner toast
    await expect(page.getByText('Welcome back!')).toBeVisible({
      timeout: 5_000,
    });
  });
});
