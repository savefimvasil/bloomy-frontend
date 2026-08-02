import { test, expect } from '../fixtures';
import { createDbClient, getTestHomeowner } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Logout', () => {
  let db: Client;

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await db.end();
  });

  test('logout clears token and redirects to /login', async ({ page }) => {
    const user = await getTestHomeowner(db);

    await injectAuth(page, { token: user.token, email: user.email, role: 'homeowner' });
    await page.goto('/cabinet');

    await page.getByTestId('logout-btn').first().click();

    await expect(page).toHaveURL(/\/login/);
    const stored = await page.evaluate(() => localStorage.getItem('bloomy-auth'));
    const parsed = JSON.parse(stored ?? '{}') as { state?: { token?: string } };
    expect(parsed.state?.token).toBeFalsy();
  });

  test('after logout, protected routes redirect to /login', async ({ page }) => {
    const user = await getTestHomeowner(db);

    await injectAuth(page, { token: user.token, email: user.email, role: 'homeowner' });
    await page.goto('/cabinet');
    await page.getByTestId('logout-btn').first().click();
    await expect(page).toHaveURL(/\/login/);

    // After logout localStorage is cleared; the auth guard must redirect fresh navigation
    await page.goto('/cabinet/quote-requests', { waitUntil: 'domcontentloaded' });
    await page.waitForURL(/\/login/, { waitUntil: 'commit', timeout: 15_000 });
    expect(page.url()).toMatch(/\/login/);
  });
});
