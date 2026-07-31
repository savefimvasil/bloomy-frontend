import { test, expect } from '../fixtures';
import {
  createDbClient,
  seedHomeowner,
  seedContractor,
  seedJob,
  cleanup,
} from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

// Direct requests are shown in the "Sent directly to you" section of
// /cabinet/nearby-requests (the /cabinet/direct-requests route just redirects there).
test.describe('Contractor – direct requests', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('/cabinet/direct-requests redirects to /cabinet/nearby-requests', async ({ page }) => {
    const contractor = await seedContractor(db);
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/direct-requests');
    await page.waitForURL(/\/cabinet\/nearby-requests/, { timeout: 10_000 });
    expect(page.url()).toMatch(/\/cabinet\/nearby-requests/);
  });

  test('direct request appears in "Sent directly to you" section', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, {
      title: 'Direct Tiling Job',
      targetContractorId: contractor.id,
      status: 'open',
    });
    ids.push({ table: 'jobs', id: job.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/nearby-requests');
    await page.waitForLoadState('networkidle');

    await expect(page.locator('main')).toContainText('Direct Tiling Job');
    await expect(page.locator('main')).toContainText(/sent directly to you/i);
  });

  test('clicking a direct request card opens job detail', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, {
      title: 'Detailed Direct Job',
      targetContractorId: contractor.id,
      note: 'Please call before starting.',
    });
    ids.push({ table: 'jobs', id: job.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/nearby-requests');
    await page.waitForLoadState('networkidle');

    await page.getByText('Detailed Direct Job').click();
    await expect(page).toHaveURL(new RegExp(`/cabinet/nearby-requests/${job.id}`));
    await expect(page.locator('main')).toContainText('Please call before starting.');
  });

  test('accepting a direct request changes job status to in_progress', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, {
      title: 'Accept Direct Test',
      targetContractorId: contractor.id,
      status: 'open',
    });
    ids.push({ table: 'jobs', id: job.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto(`/cabinet/nearby-requests/${job.id}`);
    await page.waitForLoadState('networkidle');

    await page.getByRole('button', { name: /accept.*start|start work|accept/i }).first().click();

    await expect(page.locator('main')).toContainText(/in progress|started|accepted/i, {
      timeout: 10_000,
    });

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM jobs WHERE id = $1`,
      [job.id],
    );
    expect(rows[0].status).toBe('in_progress');
  });
});
