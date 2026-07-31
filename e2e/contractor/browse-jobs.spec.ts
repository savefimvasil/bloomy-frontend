import { test, expect } from '../fixtures';
import { createDbClient, seedHomeowner, seedContractor, seedJob, cleanup } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

// Approximate coordinates for UK postcodes used in tests:
//   SW1A 1AA → 51.5014, -0.1419 (Westminster, London)
//   SW1A 2AA → 51.5014, -0.1404 (~0.1 mi from contractor)
//   E1 6RF   → 51.5142, -0.0723 (~5.8 mi from contractor)
//   M1 1AE   → 53.4808, -2.2426 (~200 mi – outside radius)

test.describe('Contractor – browse nearby jobs and geo filtering', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('jobs within radius appear; jobs outside radius do not', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, {
      postcode: 'SW1A 1AA',
      lat: 51.5014,
      lng: -0.1419,
      radiusMiles: 10,
    });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    // Job A – within radius
    const jobA = await seedJob(db, homeowner.id, {
      title: 'Job Near SW1',
      postcode: 'SW1A 2AA',
      lat: 51.5014,
      lng: -0.1404,
    });
    ids.push({ table: 'jobs', id: jobA.id });

    // Job B – within radius
    const jobB = await seedJob(db, homeowner.id, {
      title: 'Job East London',
      postcode: 'E1 6RF',
      lat: 51.5142,
      lng: -0.0723,
    });
    ids.push({ table: 'jobs', id: jobB.id });

    // Job C – outside radius (Manchester)
    const jobC = await seedJob(db, homeowner.id, {
      title: 'Job Manchester',
      postcode: 'M1 1AE',
      lat: 53.4808,
      lng: -2.2426,
    });
    ids.push({ table: 'jobs', id: jobC.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/nearby-requests');

    const main = page.locator('main, [role="main"]');
    await expect(main).toContainText('Job Near SW1');
    await expect(main).toContainText('Job East London');
    await expect(main).not.toContainText('Job Manchester');
  });

  test('job cards show distance from contractor', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, {
      postcode: 'SW1A 1AA',
      lat: 51.5014,
      lng: -0.1419,
      radiusMiles: 10,
    });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, {
      title: 'Distance Test Job',
      postcode: 'SW1A 2AA',
      lat: 51.5014,
      lng: -0.1404,
    });
    ids.push({ table: 'jobs', id: job.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/nearby-requests');

    // Distance label should be present (e.g. "0.1 mi" or "0.2 km")
    await expect(page.locator('main')).toContainText(/\d+(\.\d+)?\s*(mi|km|miles)/i);
  });

  test('direct-request jobs do not appear in nearby-requests list', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db, {
      postcode: 'SW1A 1AA',
      lat: 51.5014,
      lng: -0.1419,
      radiusMiles: 25,
    });
    const otherContractor = await seedContractor(db, { postcode: 'E1 6RF' });
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });
    ids.push({ table: 'contractor_profiles', id: otherContractor.profileId });
    ids.push({ table: 'users', id: otherContractor.id });

    // Direct request targeting another contractor – should NOT appear in our contractor's feed
    const directJob = await seedJob(db, homeowner.id, {
      title: 'Private Direct Job',
      postcode: 'SW1A 2AA',
      lat: 51.5014,
      lng: -0.1404,
      targetContractorId: otherContractor.id,
    });
    ids.push({ table: 'jobs', id: directJob.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/nearby-requests');

    await expect(page.locator('main')).not.toContainText('Private Direct Job');
  });
});
