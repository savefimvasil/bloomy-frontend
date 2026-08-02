import { test, expect } from '../fixtures';
import { createDbClient, seedHomeowner, seedContractor, seedJob, seedQuote, cleanup } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

test.describe('Homeowner – job lifecycle (mark complete, photos, leave review)', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('mark job as complete – status changes to completed', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { status: 'awarded' });
    ids.push({ table: 'jobs', id: job.id });

    const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
    ids.push({ table: 'quotes', id: q.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);

    await page.getByRole('button', { name: /mark.*(complete|done)|complete/i }).click();

    await expect(page.locator('main')).toContainText(/completed|work completed/i);

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM jobs WHERE id = $1`,
      [job.id],
    );
    expect(rows[0].status).toBe('completed');
  });

  test('leave a review after completion', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { status: 'completed' });
    ids.push({ table: 'jobs', id: job.id });

    const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
    ids.push({ table: 'quotes', id: q.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });
    await page.goto(`/cabinet/quote-requests/${job.id}`);

    // Open the review modal
    await page.getByRole('button', { name: /write a review/i }).click();

    const reviewText = 'Excellent work, very professional and on time.';
    await page.getByPlaceholder(/quality.*work|punctuality|communication/i).fill(reviewText);

    // Star rating – click 4th star
    const stars = page.locator('[aria-label*="star"]');
    const starCount = await stars.count();
    if (starCount >= 4) {
      await stars.nth(3).click();
    }

    await page.getByRole('button', { name: /submit review/i }).click();

    await expect(page.locator('main')).toContainText(/you reviewed|your review/i);

    const { rows } = await db.query<{ id: string }>(
      `SELECT id FROM reviews WHERE job_id = $1 AND homeowner_id = $2`,
      [job.id, homeowner.id],
    );
    expect(rows.length).toBe(1);
  });

  test('upload completion photos – thumbnails shown', async ({ page }) => {
    const homeowner = await seedHomeowner(db);
    const contractor = await seedContractor(db);
    ids.push({ table: 'users', id: homeowner.id });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const job = await seedJob(db, homeowner.id, { status: 'completed' });
    ids.push({ table: 'jobs', id: job.id });

    const q = await seedQuote(db, job.id, contractor.id, { status: 'accepted' });
    ids.push({ table: 'quotes', id: q.id });

    await injectAuth(page, { token: homeowner.token, email: homeowner.email, role: 'homeowner' });

    // Intercept upload API calls so we don't need Sharp to process the test buffer
    await page.route('**/api/uploads/photo', async (route) => {
      await route.fulfill({ json: { url: '/uploads/e2e-test.webp' } });
    });
    await page.route(`**/api/quote-requests/mine/${job.id}/photos`, async (route) => {
      await route.fulfill({ json: { photoUrls: ['/uploads/e2e-test.webp'] } });
    });

    await page.goto(`/cabinet/quote-requests/${job.id}`);

    // Switch to photos tab to access the file input
    await page.getByRole('button', { name: /photos/i }).click();

    const fileInput = page.locator('input[type="file"]').first();
    await expect(fileInput).toBeAttached({ timeout: 5_000 });
    await fileInput.setInputFiles([
      { name: 'photo1.jpg', mimeType: 'image/jpeg', buffer: Buffer.alloc(128, 0) },
    ]);

    await expect(page.locator('img').first()).toBeVisible({ timeout: 10_000 });
  });
});
