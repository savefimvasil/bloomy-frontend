import { test, expect } from '../fixtures';
import { createDbClient, getTestHomeowner, getTestContractor, cleanup } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

// Role enforcement in Bloomy is applied at the API layer (backend throws 403
// for wrong-role requests). The frontend does not redirect on page load — it
// shows an empty/error state when the API returns forbidden. These tests verify
// that the protected routes either:
//   a) Redirect the wrong-role user away (if a future client guard is added), or
//   b) Show no sensitive data (empty list / error message) because the API refused.
test.describe('Role enforcement', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test.describe('homeowner accessing contractor-only routes', () => {
    // Contractor routes that a homeowner should not see real data on.
    // API returns 403 for wrong-role calls; pages show error or empty state.
    const CONTRACTOR_ROUTES = [
      '/cabinet/nearby-requests',
      '/cabinet/my-proposals',
      '/cabinet/contractor-profile',
    ];

    for (const route of CONTRACTOR_ROUTES) {
      test(`${route} – shows no forbidden data for homeowner`, async ({ page }) => {
        const user = await getTestHomeowner(db);

        await injectAuth(page, { token: user.token, email: user.email, role: 'homeowner' });
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        // Check only the main content area — sidebar always contains nav text
        const mainText = await page.locator('main, [role="main"]').innerText().catch(
          () => page.locator('body').innerText(),
        );
        const urlAfter = page.url();

        const wasRedirected = !urlAfter.includes(route.split('/').pop()!);
        const hasErrorOrEmpty =
          /error|forbidden|unauthorized|not allowed|no jobs|nothing here|empty|failed/i.test(mainText) ||
          mainText.trim().length < 500;

        expect(wasRedirected || hasErrorOrEmpty).toBeTruthy();
      });
    }
  });

  test.describe('contractor accessing homeowner-only routes', () => {
    // API rejects these with 403 or returns empty; frontend shows error / empty state.
    const HOMEOWNER_ROUTES = [
      '/cabinet/quote-requests',
      '/cabinet/projects',
    ];

    for (const route of HOMEOWNER_ROUTES) {
      test(`${route} – shows no forbidden data for contractor`, async ({ page }) => {
        const user = await getTestContractor(db);

        await injectAuth(page, { token: user.token, email: user.email, role: 'contractor' });
        await page.goto(route);
        await page.waitForLoadState('networkidle');

        const mainText = await page.locator('main, [role="main"]').innerText().catch(
          () => page.locator('body').innerText(),
        );
        const urlAfter = page.url();

        const wasRedirected = !urlAfter.includes(route.split('/').pop()!);
        const hasErrorOrEmpty =
          /error|forbidden|unauthorized|not allowed|no requests|no.*yet|nothing here|empty|failed/i.test(mainText) ||
          mainText.trim().length < 500;

        expect(wasRedirected || hasErrorOrEmpty).toBeTruthy();
      });
    }
  });

  test('backend API returns 403 when homeowner calls contractor endpoint', async ({ page }) => {
    const user = await getTestHomeowner(db);

    await injectAuth(page, { token: user.token, email: user.email, role: 'homeowner' });
    await page.goto('/cabinet');

    const res = await page.request.get('/api/quote-requests/nearby', {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(res.status()).toBe(403);
  });

  test('backend API returns 403 when contractor calls homeowner endpoint', async ({ page }) => {
    const user = await getTestContractor(db);

    await injectAuth(page, { token: user.token, email: user.email, role: 'contractor' });
    await page.goto('/cabinet');

    const res = await page.request.get('/api/quote-requests/mine', {
      headers: { Authorization: `Bearer ${user.token}` },
    });
    expect(res.status()).toBe(403);
  });
});
