import { test, expect } from '../fixtures';
import {
  createDbClient,
  seedHomeowner,
  seedNotification,
  cleanup,
} from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Notifications – notification centre', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('notification centre lists all unread notifications', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const notifs = await Promise.all([
      seedNotification(db, homeowner.id, { title: 'Proposal A received', body: 'Contractor X applied.' }),
      seedNotification(db, homeowner.id, { title: 'Proposal B received', body: 'Contractor Y applied.' }),
      seedNotification(db, homeowner.id, { title: 'Proposal C received', body: 'Contractor Z applied.' }),
    ]);
    notifs.forEach((n) => ids.push({ table: 'notifications', id: n.id }));

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet/notifications');

    const main = page.locator('main, [role="main"]');
    await expect(main).toContainText('Proposal A received');
    await expect(main).toContainText('Proposal B received');
    await expect(main).toContainText('Proposal C received');
  });

  test('marking a notification as read removes it from unread count', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const n = await seedNotification(db, homeowner.id, {
      title: 'Read Me',
      body: 'Click to mark as read.',
    });
    ids.push({ table: 'notifications', id: n.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet/notifications');

    // Click to mark as read (row click or explicit "mark read" button)
    await page.getByText('Read Me').click();

    // Verify DB updated
    const { rows } = await db.query<{ read: boolean }>(
      `SELECT read FROM notifications WHERE id = $1`,
      [n.id],
    );
    expect(rows[0].read).toBe(true);
  });

  test('marking all as read clears the badge', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const notifs = await Promise.all([
      seedNotification(db, homeowner.id, { title: 'Unread 1' }),
      seedNotification(db, homeowner.id, { title: 'Unread 2' }),
    ]);
    notifs.forEach((n) => ids.push({ table: 'notifications', id: n.id }));

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet/notifications');

    const markAllBtn = page.getByRole('button', { name: /mark all.*read|clear all/i });
    if (await markAllBtn.isVisible()) {
      await markAllBtn.click();
    } else {
      // Fallback: mark each individually
      const items = await page.getByText(/Unread/).all();
      for (const item of items) await item.click();
    }

    // Badge should now be 0 or hidden
    await page.goto('/cabinet');
    const badge = page
      .locator('[data-testid="notification-badge"], .notification-badge')
      .first();
    const visible = await badge.isVisible().catch(() => false);
    if (visible) {
      const text = await badge.textContent();
      expect(text?.trim()).toMatch(/^0?$/);
    }
  });

  test('notification with link navigates correctly when clicked', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    ids.push({ table: 'users', id: homeowner.id });

    const n = await seedNotification(db, homeowner.id, {
      title: 'Go to proposal',
      body: 'View your proposal.',
      link: '/cabinet/quote-requests',
    });
    ids.push({ table: 'notifications', id: n.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto('/cabinet/notifications');
    await page.waitForLoadState('networkidle');

    await page.getByText('Go to proposal').click();
    await expect(page).toHaveURL(/\/cabinet\/quote-requests/);
  });
});
