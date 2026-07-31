import { test, expect } from '../fixtures';

const PROTECTED_ROUTES = [
  '/cabinet',
  '/cabinet/projects',
  '/cabinet/quote-requests',
  '/cabinet/nearby-requests',
  '/cabinet/contractor-profile',
  '/cabinet/my-proposals',
  '/cabinet/notifications',
];

// Cabinet auth is enforced client-side: CabinetLayout reads Zustand auth state
// after hydration and calls router.replace('/login') if no token is present.
// We use waitForURL with waitUntil:'commit' so we only wait for the URL change,
// not for the full /login page load (which loads slow external images).
test.describe('Auth guard – unauthenticated access @smoke', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await page.waitForURL(/\/login/, { waitUntil: 'commit', timeout: 15_000 });
      expect(page.url()).toMatch(/\/login/);
    });
  }

  test('/admin/pricing redirects to /login (middleware-enforced)', async ({ page }) => {
    // /admin/* is protected by Next.js middleware — redirect is server-side, no JS needed.
    await page.goto('/admin/pricing', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { waitUntil: 'commit', timeout: 10_000 });
    expect(page.url()).toMatch(/\/login/);
  });
});
