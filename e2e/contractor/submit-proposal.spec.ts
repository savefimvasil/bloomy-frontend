import { test, expect } from '../fixtures';
import { createDbClient, seedHomeowner, seedContractor, seedJob, cleanup } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Contractor – submit proposal and manage own proposals', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('happy path – submit proposal creates DB row and shows success state', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, {
      postcode: 'SW1A 1AA',
      lat: 51.5014,
      lng: -0.1419,
      radiusMiles: 25,
    });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, {
      postcode: 'SW1A 2AA',
      lat: 51.5014,
      lng: -0.1404,
    });
    ids.push({ table: 'jobs', id: job.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto(`/cabinet/nearby-requests/${job.id}`);

    await page.getByTestId('proposal-message').fill(
      'I have 10 years of experience and can start next week.',
    );

    const priceNote = page.getByTestId('proposal-price');
    if (await priceNote.isVisible()) {
      await priceNote.fill('£1,200–£1,500');
    }

    const timeline = page.getByTestId('proposal-duration');
    if (await timeline.isVisible()) {
      await timeline.fill('14');
    }

    await page.getByTestId('send-proposal-btn').click();

    await expect(page.locator('main')).toContainText(/your proposal|pending/i);

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM quotes WHERE job_id = $1 AND contractor_id = $2`,
      [job.id, contractor.id],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].status).toBe('pending');

    // Notification for homeowner
    const { rows: notifRows } = await db.query<{ id: string }>(
      `SELECT id FROM notifications WHERE user_id = $1 AND type = 'proposal_received'`,
      [homeowner.id],
    );
    expect(notifRows.length).toBeGreaterThanOrEqual(1);
    // Cleanup quotes
    await db.query(`DELETE FROM quotes WHERE job_id = $1 AND contractor_id = $2`, [job.id, contractor.id]);
  });

  test('revisiting same job shows already-applied state', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, {
      postcode: 'SW1A 1AA',
      lat: 51.5014,
      lng: -0.1419,
      radiusMiles: 25,
    });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { postcode: 'SW1A 2AA', lat: 51.5014, lng: -0.1404 });
    ids.push({ table: 'jobs', id: job.id });

    // Seed an existing proposal via API to simulate having already applied
    const res = await page.request.post(`/api/quote-requests/nearby/${job.id}/propose`, {
      headers: {
        Authorization: `Bearer ${contractor.token}`,
        'Content-Type': 'application/json',
      },
      data: { message: 'Already submitted this proposal.', timelineDays: 7 },
    });
    // May succeed (201) or already-applied response
    expect([200, 201, 409].includes(res.status())).toBeTruthy();

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto(`/cabinet/nearby-requests/${job.id}`);

    await expect(page.locator('main')).toContainText(/your proposal|pending/i);
    await db.query(`DELETE FROM quotes WHERE job_id = $1 AND contractor_id = $2`, [job.id, contractor.id]);
  });

  test('short message (< 20 chars) fails validation', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, {
      postcode: 'SW1A 1AA',
      lat: 51.5014,
      lng: -0.1419,
      radiusMiles: 25,
    });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { postcode: 'SW1A 2AA', lat: 51.5014, lng: -0.1404 });
    ids.push({ table: 'jobs', id: job.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto(`/cabinet/nearby-requests/${job.id}`);

    await page.getByTestId('proposal-message').fill('Too short');
    await page.getByTestId('send-proposal-btn').click();

    await expect(page.locator('main')).toContainText(/at least|minimum|too short|characters/i);
  });

  test('My Proposals page lists submitted proposals', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, { postcode: 'SW1A 1AA', lat: 51.5014, lng: -0.1419 });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { title: 'My Proposal Test Job' });
    ids.push({ table: 'jobs', id: job.id });

    const { rows } = await db.query<{ id: string }>(
      `INSERT INTO quotes (id, job_id, contractor_id, message, status)
       VALUES (gen_random_uuid(), $1, $2, 'Great proposal message here.', 'pending')
       RETURNING id`,
      [job.id, contractor.id],
    );
    ids.push({ table: 'quotes', id: rows[0].id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/my-proposals');

    await expect(page.locator('main')).toContainText('My Proposal Test Job');
  });
});
