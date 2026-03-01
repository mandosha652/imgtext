import { test, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { signUpAndSaveState, uniqueEmail } from './helpers';

const FIXTURE = path.join(__dirname, 'fixtures/test-image.png');

test.describe('Notification Bell', () => {
  test.describe.configure({ mode: 'serial' });
  test.setTimeout(60_000);

  const email = uniqueEmail('notifications');
  let stateFile = '';

  test.beforeAll(async ({ browser }) => {
    stateFile = await signUpAndSaveState(browser, email);
  });

  test.beforeEach(async ({ context }) => {
    const { cookies } = JSON.parse(fs.readFileSync(stateFile, 'utf-8'));
    await context.addCookies(cookies);
  });

  test('bell button is visible in dashboard header', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(
      page.getByRole('button', { name: /notifications/i })
    ).toBeVisible();
  });

  test('clicking bell opens notification panel', async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /notifications/i }).click();

    // Panel should open showing either empty state or notifications
    await expect(page.getByText(/notifications/i).first()).toBeVisible({
      timeout: 5_000,
    });
  });

  test("empty state shows 'No notifications yet'", async ({ page }) => {
    await page.goto('/dashboard');
    await page.getByRole('button', { name: /notifications/i }).click();

    await expect(page.getByText(/no notifications yet/i)).toBeVisible({
      timeout: 5_000,
    });
  });

  test('batch completion adds notification with unread badge', async ({
    page,
  }) => {
    // Submit a batch — on completion the notification store gets a push
    await page.goto('/batch');
    await expect(
      page.getByRole('heading', { name: 'Batch Translation' })
    ).toBeVisible();

    const fileInput = page.locator('input[type="file"]').first();
    await fileInput.setInputFiles(FIXTURE);
    await page.getByRole('button', { name: 'German' }).click();
    await page.getByRole('button', { name: /start batch/i }).click();

    // Wait for batch to complete (status polling fires notification)
    await expect(page.getByText(/completed/i).first()).toBeVisible({
      timeout: 90_000,
    });

    // Notification badge (unread count) should now appear on bell
    const badge = page.locator('button[aria-label="Notifications"] span');
    await expect(badge).toBeVisible({ timeout: 10_000 });

    // Open bell and verify notification entry
    await page.getByRole('button', { name: /notifications/i }).click();
    await expect(page.getByText(/no notifications yet/i)).not.toBeVisible({
      timeout: 5_000,
    });
  });

  test('mark all read removes badge', async ({ page }) => {
    await page.goto('/dashboard');
    const bell = page.getByRole('button', { name: /notifications/i });
    await bell.click();

    const markAllRead = page.getByText(/mark all read/i);
    const hasMark = await markAllRead.isVisible();

    if (hasMark) {
      await markAllRead.click();
      // Badge should disappear
      await expect(
        page.locator('button[aria-label="Notifications"] span')
      ).not.toBeVisible({ timeout: 5_000 });
    } else {
      // No unread notifications — badge already absent
      await expect(
        page.locator('button[aria-label="Notifications"] span')
      ).not.toBeVisible();
    }
  });
});
