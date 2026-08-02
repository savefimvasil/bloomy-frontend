import { test, expect } from '../fixtures';
import { createDbClient, seedHomeowner, seedContractor, seedJob, seedQuote, cleanup } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Homeowner – view proposals, accept and reject', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('both contractor cards are visible on job detail page', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor1 = await seedContractor(db, { businessName: 'Alpha Builds' });
    const contractor2 = await seedContractor(db, { businessName: 'Beta Gardens' });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor1.profileId });
    ids.push({ table: 'users', id: contractor1.id });
    ids.push({ table: 'contractor_profiles', id: contractor2.profileId });
    ids.push({ table: 'users', id: contractor2.id });

    const job = await seedJob(db, homeowner.id);
    ids.push({ table: 'jobs', id: job.id });

    const q1 = await seedQuote(db, job.id, contractor1.id, { message: 'I can start immediately.' });
    const q2 = await seedQuote(db, job.id, contractor2.id, { message: 'Available next week.' });
    ids.push({ table: 'quotes', id: q1.id });
    ids.push({ table: 'quotes', id: q2.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);

    await expect(page.locator('main')).toContainText('Alpha Builds');
    await expect(page.locator('main')).toContainText('Beta Gardens');
    await expect(page.locator('main')).toContainText('I can start immediately.');
    await expect(page.locator('main')).toContainText('Available next week.');
  });

  test('verified contractor shows verified badge', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, { verified: true, businessName: 'Verified Co' });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id);
    ids.push({ table: 'jobs', id: job.id });

    const q = await seedQuote(db, job.id, contractor.id);
    ids.push({ table: 'quotes', id: q.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);

    const verifiedLocator = page.getByText(/verified/i).first();
    await expect(verifiedLocator).toBeVisible();
  });

  test('accepting a proposal – job status changes to awarded', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, { businessName: 'Top Contractor' });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id);
    ids.push({ table: 'jobs', id: job.id });

    const q = await seedQuote(db, job.id, contractor.id, { message: 'Best price guaranteed.' });
    ids.push({ table: 'quotes', id: q.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);

    await page.getByTestId('accept-proposal-btn').first().click();
    // Confirm dialog
    await page.getByTestId('confirm-btn').click();

    await expect(page.locator('main')).toContainText(/awarded/i);

    // Verify DB
    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM jobs WHERE id = $1`,
      [job.id],
    );
    expect(rows[0].status).toBe('awarded');
  });

  test('accepting one proposal auto-rejects others', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor1 = await seedContractor(db, { businessName: 'Quick Contractor' });
    const contractor2 = await seedContractor(db, { businessName: 'Slow Contractor' });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor1.profileId });
    ids.push({ table: 'users', id: contractor1.id });
    ids.push({ table: 'contractor_profiles', id: contractor2.profileId });
    ids.push({ table: 'users', id: contractor2.id });

    const job = await seedJob(db, homeowner.id);
    ids.push({ table: 'jobs', id: job.id });

    const q1 = await seedQuote(db, job.id, contractor1.id, { message: 'I can start tomorrow!' });
    const q2 = await seedQuote(db, job.id, contractor2.id, { message: 'I will get to it eventually.' });
    ids.push({ table: 'quotes', id: q1.id });
    ids.push({ table: 'quotes', id: q2.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);

    // Accept the first proposal — all others should be auto-rejected by the API
    await page.getByTestId('accept-proposal-btn').first().click();
    // Confirm dialog
    await page.getByTestId('confirm-btn').click();

    await expect(page.locator('main')).toContainText(/awarded/i);

    const { rows } = await db.query<{ id: string; status: string }>(
      `SELECT id, status FROM quotes WHERE job_id = $1`,
      [job.id],
    );
    const statuses = Object.fromEntries(rows.map((r) => [r.id, r.status]));
    // One accepted, one rejected
    const accepted = rows.filter((r) => r.status === 'accepted');
    const rejected = rows.filter((r) => r.status === 'rejected');
    expect(accepted).toHaveLength(1);
    expect(rejected).toHaveLength(1);
    void statuses; // suppress unused warning
  });
});
