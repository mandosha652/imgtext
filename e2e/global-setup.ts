import { chromium } from '@playwright/test';

/**
 * Warm up key Next.js routes before parallel tests start.
 * Without this, parallel workers hit pages that are still compiling
 * on-demand, causing flaky failures on the first request.
 */
async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const routes = [
    '/',
    '/login',
    '/signup',
    '/dashboard',
    '/translate',
    '/batch',
    '/history',
    '/settings',
    '/pricing',
    '/help',
    '/api-docs',
    '/forgot-password',
    '/changelog',
    '/terms',
    '/privacy',
    '/reset-password',
    '/verify-email',
  ];

  for (const route of routes) {
    try {
      await page.goto(`http://localhost:3000${route}`, {
        waitUntil: 'networkidle',
        timeout: 60_000,
      });
    } catch {
      // Best-effort — protected routes may redirect, that's fine
    }
  }

  await browser.close();
}

export default globalSetup;
