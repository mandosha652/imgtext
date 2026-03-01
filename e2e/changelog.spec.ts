import { test, expect } from '@playwright/test';

test.describe('Changelog', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/changelog', { waitUntil: 'domcontentloaded' });
  });

  test('renders changelog page with main heading', async ({ page }) => {
    await expect(
      page.getByRole('heading', { name: /what's new/i })
    ).toBeVisible();
    await expect(
      page.getByText(/latest updates, improvements, and fixes/i)
    ).toBeVisible();
  });

  test('shows at least one release section', async ({ page }) => {
    // Release headings are h2 elements with the version name e.g. "February 2026"
    await expect(page.getByRole('heading', { level: 2 }).first()).toBeVisible();
  });

  test('shows change type labels', async ({ page }) => {
    // Each change item has a type label — at least one "New" label must exist
    await expect(page.getByText('New').first()).toBeVisible();
  });

  test('back link navigates to home', async ({ page }) => {
    // The back button is wrapped in a <Link href="/"> so Playwright sees it as a link
    const backLink = page.getByRole('link', { name: /back/i });
    await expect(backLink).toBeVisible();
    await backLink.click();
    await expect(page).toHaveURL('/');
  });
});
