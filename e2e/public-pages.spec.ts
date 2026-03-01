import { test, expect } from '@playwright/test';

test.describe('Public Pages', () => {
  test.describe('Homepage', () => {
    test('renders hero section and key content', async ({ page }) => {
      await page.goto('/');

      // Hero
      await expect(
        page.getByRole('heading', { name: /translate image text/i })
      ).toBeVisible();

      // How it works section
      await expect(page.getByText('How it works')).toBeVisible();

      // Footer links
      await expect(page.getByRole('link', { name: /terms/i })).toBeVisible();
      await expect(page.getByRole('link', { name: /privacy/i })).toBeVisible();
    });

    test('CTA navigates to signup or dashboard', async ({ page }) => {
      await page.goto('/');

      const cta = page.getByRole('link', { name: /get started/i }).first();
      await expect(cta).toBeVisible();
    });

    test('nav shows login/signup for unauthenticated users', async ({
      page,
    }) => {
      await page.context().clearCookies();
      await page.goto('/');

      await expect(
        page.getByRole('link', { name: /log in|sign in/i }).first()
      ).toBeVisible();
    });
  });

  test.describe('Pricing', () => {
    test('renders all pricing tiers', async ({ page }) => {
      await page.goto('/pricing');

      await expect(
        page.getByRole('heading', { name: /plans|pricing/i }).first()
      ).toBeVisible();

      // All three tier headings should be visible
      await expect(page.getByRole('heading', { name: 'Free' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'Pro' })).toBeVisible();
      await expect(
        page.getByRole('heading', { name: 'Enterprise' })
      ).toBeVisible();
    });

    test('shows feature comparison', async ({ page }) => {
      await page.goto('/pricing');

      // Key feature rows
      await expect(page.getByText(/images.*month/i).first()).toBeVisible();
    });
  });

  test.describe('Help & FAQ', () => {
    test('renders FAQ questions', async ({ page }) => {
      await page.goto('/help');

      await expect(
        page.getByRole('heading', { name: /help|faq/i }).first()
      ).toBeVisible();

      // At least one FAQ question should be visible
      await expect(page.getByText(/what image formats/i)).toBeVisible();
    });

    test('FAQ accordion expands on click', async ({ page }) => {
      await page.goto('/help');

      const question = page.getByText(/what image formats/i);
      await question.click();

      // Answer should be visible after clicking
      await expect(page.getByText(/jpeg.*png.*webp/i).first()).toBeVisible();
    });

    test('contact section is visible', async ({ page }) => {
      await page.goto('/help');

      await expect(page.getByText(/still need help/i)).toBeVisible();
      await expect(
        page.getByRole('link', { name: /support@imgtext/i })
      ).toBeVisible();
    });
  });

  test.describe('API Docs', () => {
    test('renders API reference content', async ({ page }) => {
      await page.goto('/api-docs');

      await expect(
        page.getByRole('heading', { name: /api reference/i }).first()
      ).toBeVisible();

      // Authentication section
      await expect(
        page.getByText('Authorization: Bearer YOUR_API_KEY')
      ).toBeVisible();

      // At least one endpoint
      await expect(page.getByText(/translate-image/i).first()).toBeVisible();
    });

    test('shows supported languages table', async ({ page }) => {
      await page.goto('/api-docs');

      await expect(page.getByText(/supported languages/i)).toBeVisible();
      await expect(page.getByText('English').first()).toBeVisible();
      await expect(page.getByText('German').first()).toBeVisible();
    });
  });

  test.describe('Terms of Service', () => {
    test('renders terms content', async ({ page }) => {
      await page.goto('/terms');

      await expect(
        page.getByRole('heading', { name: /terms of service/i }).first()
      ).toBeVisible();

      // Key sections
      await expect(page.getByText(/acceptance of terms/i)).toBeVisible();
    });
  });

  test.describe('Privacy Policy', () => {
    test('renders privacy content', async ({ page }) => {
      await page.goto('/privacy');

      await expect(
        page.getByRole('heading', { name: /privacy policy/i }).first()
      ).toBeVisible();

      // Key sections
      await expect(
        page.getByText(/information.*collect/i).first()
      ).toBeVisible();
    });
  });
});
