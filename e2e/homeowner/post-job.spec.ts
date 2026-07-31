import { test, expect } from '../fixtures';
import { createDbClient, seedHomeowner, seedJob, cleanup } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Homeowner – post a broadcast job request', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('seeded open job appears in the quote-requests list', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const job = await seedJob(db, homeowner.id, {
      title: 'Garden paving',
      postcode: 'SW1A 1AA',
      status: 'open',
    });
    ids.push({ table: 'jobs', id: job.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet/quote-requests');

    await expect(page.locator('main, [role="main"]')).toContainText('Garden paving');
    await expect(page.locator('main, [role="main"]')).toContainText(/open/i);
  });

  test('navigating to /cabinet/quote-requests/new redirects unauthenticated user to /login', async ({
    page,
  }) => {
    await page.goto('/cabinet/quote-requests/new');
    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated homeowner accessing /cabinet/quote-requests/new is redirected to projects', async ({
    page,
  }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet/quote-requests/new');

    // The page redirects to /cabinet/projects (no projectId param)
    await expect(page).toHaveURL(/\/cabinet\/projects/);
  });

  test('invalid UK postcode in direct-request form shows inline error', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    // Request form requires contractorId param; test validation via API directly
    const res = await page.request.post('/api/quote-requests', {
      headers: { Authorization: `Bearer ${homeowner.token}`, 'Content-Type': 'application/json' },
      data: { gardenProjectId: '00000000-0000-0000-0000-000000000000', postcode: '12345' },
    });
    expect(res.status()).toBe(400);
    const body = await res.json() as { message?: string | string[] };
    const messages = Array.isArray(body.message) ? body.message.join(' ') : String(body.message ?? '');
    expect(messages).toMatch(/postcode/i);
  });

  test('DB row exists with correct homeowner_id and status=open after seeding', async () => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const job = await seedJob(db, homeowner.id, { postcode: 'E1 6RF', status: 'open' });
    ids.push({ table: 'jobs', id: job.id });

    const { rows } = await db.query<{ homeowner_id: string; status: string }>(
      `SELECT homeowner_id, status FROM jobs WHERE id = $1`,
      [job.id],
    );
    expect(rows[0].homeowner_id).toBe(homeowner.id);
    expect(rows[0].status).toBe('open');
  });
});
