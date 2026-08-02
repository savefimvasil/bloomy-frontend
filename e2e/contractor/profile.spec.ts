import { test, expect } from '../fixtures';
import { createDbClient, seedContractor, cleanup } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Contractor – profile management', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('profile page loads with existing data pre-filled', async ({ page }) => {
    const contractor = await seedContractor(db, {
      businessName: 'Pre-filled Landscaping',
      postcode: 'SW1A 1AA',
      radiusMiles: 15,
    });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/contractor-profile');

    await expect(page.getByLabel(/business name/i)).toHaveValue('Pre-filled Landscaping');
    await expect(page.getByLabel(/postcode/i)).toHaveValue(/SW1A 1AA/i);
  });

  test('updating business name persists to DB', async ({ page }) => {
    const contractor = await seedContractor(db, { businessName: 'Old Name Ltd' });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/contractor-profile');

    await page.getByLabel(/business name/i).clear();
    await page.getByLabel(/business name/i).fill('New Name Ltd');
    await page.getByRole('button', { name: /save|update/i }).click();

    await expect(page.locator('main')).toContainText(/saved|updated|success/i);

    const { rows } = await db.query<{ business_name: string }>(
      `SELECT business_name FROM contractor_profiles WHERE user_id = $1`,
      [contractor.id],
    );
    expect(rows[0].business_name).toBe('New Name Ltd');
  });

  test('invalid postcode shows validation error', async ({ page }) => {
    const contractor = await seedContractor(db);
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/contractor-profile');

    await page.getByLabel(/postcode/i).clear();
    await page.getByLabel(/postcode/i).fill('INVALID');
    await page.getByRole('button', { name: /save|update/i }).click();

    await expect(page.locator('main')).toContainText(/valid.*postcode|postcode.*invalid/i);
  });

  test('updating radius persists to DB', async ({ page }) => {
    const contractor = await seedContractor(db, { radiusMiles: 10 });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    await injectAuth(page, { token: contractor.token, email: contractor.email, role: 'contractor' });
    await page.goto('/cabinet/contractor-profile');

    const radiusInput = page.getByLabel(/radius|service area|miles/i).first();
    await radiusInput.clear();
    await radiusInput.fill('20');
    await page.getByRole('button', { name: /save|update/i }).click();

    await expect(page.locator('main')).toContainText(/saved|updated|success/i);

    const { rows } = await db.query<{ radius_km: number }>(
      `SELECT radius_km FROM contractor_profiles WHERE user_id = $1`,
      [contractor.id],
    );
    expect(rows[0].radius_km).toBe(20);
  });
});
