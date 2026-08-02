import { test, expect } from '../fixtures';
import {
  createDbClient,
  seedHomeowner,
  seedContractor,
  seedJob,
  seedNotification,
  cleanup,
} from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Notifications – in-app badge', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('unread notification count is reflected in header badge', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const n1 = await seedNotification(db, homeowner.id, {
      type: 'proposal_received',
      title: 'New proposal',
      body: 'Contractor A submitted a proposal.',
    });
    const n2 = await seedNotification(db, homeowner.id, {
      type: 'proposal_received',
      title: 'New proposal',
      body: 'Contractor B submitted a proposal.',
    });
    ids.push({ table: 'notifications', id: n1.id });
    ids.push({ table: 'notifications', id: n2.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet');

    // Badge shows 2 unread
    const badge = page.getByTestId('notification-badge').first();
    await expect(badge).toBeVisible();
    await expect(badge).toContainText('2');
  });

  test('no badge shown when all notifications are read', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const n = await seedNotification(db, homeowner.id, { read: true });
    ids.push({ table: 'notifications', id: n.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet');

    const badge = page.getByTestId('notification-badge').first();

    // Badge should not exist or contain 0
    const visible = await badge.isVisible().catch(() => false);
    if (visible) {
      const text = await badge.textContent();
      expect(text?.trim()).toMatch(/^0?$/);
    }
  });

  test('proposal submission triggers notification badge increment for homeowner', async ({
    browser,
  }) => {
    const db2 = await createDbClient();
    const homeowner = await seedHomeowner(db2);
    const contractor = await seedContractor(db2, {
      postcode: 'SW1A 1AA',
      lat: 51.5014,
      lng: -0.1419,
      radiusMiles: 25,
    });

    const job = await seedJob(db2, homeowner.id, {
      postcode: 'SW1A 2AA',
      lat: 51.5014,
      lng: -0.1404,
    });

    const homeownerCtx = await browser.newContext();
    const contractorCtx = await browser.newContext();
    const homeownerPage = await homeownerCtx.newPage();
    const contractorPage = await contractorCtx.newPage();

    await injectAuth(homeownerPage, {
      token: homeowner.token,
      email: homeowner.email,
      role: 'homeowner',
    });
    await injectAuth(contractorPage, {
      token: contractor.token,
      email: contractor.email,
      role: 'contractor',
    });

    await homeownerPage.goto('/cabinet');
    await contractorPage.goto(`/cabinet/nearby-requests/${job.id}`);

    await contractorPage.getByTestId('proposal-message').fill('I can do this job, excellent work guaranteed.');
    await contractorPage.getByTestId('send-proposal-btn').click();
    await expect(contractorPage.locator('main')).toContainText(/your proposal|pending/i, {
      timeout: 8_000,
    });

    // Homeowner badge should now show ≥ 1
    await homeownerPage.reload();
    const badge = homeownerPage.getByTestId('notification-badge').first();
    await expect(badge).toBeVisible({ timeout: 8_000 });
    const count = parseInt((await badge.textContent()) ?? '0', 10);
    expect(count).toBeGreaterThanOrEqual(1);

    await homeownerCtx.close();
    await contractorCtx.close();

    await db2.query(`DELETE FROM quotes WHERE job_id = $1 AND contractor_id = $2`, [job.id, contractor.id]);
    await db2.query(`DELETE FROM jobs WHERE id = $1`, [job.id]);
    await db2.query(`DELETE FROM contractor_profiles WHERE user_id = $1`, [contractor.id]);
    await db2.query(`DELETE FROM users WHERE id = ANY($1)`, [[homeowner.id, contractor.id]]);
    await db2.end();
  });
});
