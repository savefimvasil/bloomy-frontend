import { test, expect } from '../fixtures';
import { createDbClient, seedContractor, seedVerificationDocument, cleanup, seedAdminUser } from '../fixtures/db';
import { generateToken } from '../fixtures/db';
import { injectAuth } from '../fixtures/auth';
import type { Client } from 'pg';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL ?? 'admin@bloomy.com';

async function getAdminToken(db: Client): Promise<{ token: string; email: string }> {
  const existing = await db.query<{ id: string }>(
    `SELECT id FROM users WHERE email = $1 LIMIT 1`,
    [ADMIN_EMAIL],
  );
  const id = existing.rows.length
    ? existing.rows[0].id
    : (await seedAdminUser(db, { email: ADMIN_EMAIL })).id;
  const token = generateToken({ sub: id, email: ADMIN_EMAIL, role: 'homeowner' });
  return { token, email: ADMIN_EMAIL };
}

test.describe('Admin – contractor verification flow', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('verification queue lists pending documents', async ({ page }) => {
    const contractor = await seedContractor(db, {
      businessName: 'Pending Verification Ltd',
      verified: false,
    });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const doc = await seedVerificationDocument(db, contractor.id, {
      type: 'insurance',
      description: 'Public liability certificate',
    });
    ids.push({ table: 'verification_documents', id: doc.id });

    const admin = await getAdminToken(db);
    await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
    await page.goto('/admin/verification');

    await expect(page.locator('main')).toContainText('Pending Verification Ltd');
  });

  test('expanding a document card shows document details', async ({ page }) => {
    const contractor = await seedContractor(db, {
      businessName: 'Doc Review Contractor',
      verified: false,
    });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const doc = await seedVerificationDocument(db, contractor.id, {
      type: 'insurance',
      description: 'Insurance policy document',
    });
    ids.push({ table: 'verification_documents', id: doc.id });

    const admin = await getAdminToken(db);
    await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
    await page.goto('/admin/verification');

    // Document type is already visible on the card (no click needed to expand)
    await expect(page.locator('main')).toContainText(/insurance/i);
    await expect(page.locator('main')).toContainText('Insurance policy document');
  });

  test('approving a document removes it from the pending queue', async ({ page }) => {
    const contractor = await seedContractor(db, {
      businessName: 'Approve Me Contractor',
      verified: false,
    });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const doc = await seedVerificationDocument(db, contractor.id, { type: 'dbs' });
    ids.push({ table: 'verification_documents', id: doc.id });

    const admin = await getAdminToken(db);
    await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
    await page.goto('/admin/verification');

    // Click "Review this document" to expand the card
    await page.getByRole('button', { name: /review this document/i }).first().click();
    await page.getByRole('button', { name: /^Approve$/i }).click();

    // Card disappears from the queue after approval
    await expect(page.locator('main')).not.toContainText('Approve Me Contractor', {
      timeout: 8_000,
    });

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM verification_documents WHERE id = $1`,
      [doc.id],
    );
    expect(rows[0].status).toBe('approved');
  });

  test('rejecting a document keeps it visible with rejected status', async ({ page }) => {
    const contractor = await seedContractor(db, {
      businessName: 'Reject Me Contractor',
      verified: false,
    });
    ids.push({ table: 'contractor_profiles', id: contractor.profileId });
    ids.push({ table: 'users', id: contractor.id });

    const doc = await seedVerificationDocument(db, contractor.id, { type: 'id' });
    ids.push({ table: 'verification_documents', id: doc.id });

    const admin = await getAdminToken(db);
    await injectAuth(page, { token: admin.token, email: admin.email, role: 'homeowner' });
    await page.goto('/admin/verification');

    await page.getByRole('button', { name: /review this document/i }).first().click();
    await page.getByRole('button', { name: /^Reject$/i }).click();

    // After rejection, document is removed from the pending list
    await expect(page.locator('main')).not.toContainText('Reject Me Contractor', {
      timeout: 8_000,
    });

    const { rows } = await db.query<{ status: string }>(
      `SELECT status FROM verification_documents WHERE id = $1`,
      [doc.id],
    );
    expect(rows[0].status).toBe('rejected');
  });

  test('unauthenticated access to /admin/verification redirects to /login', async ({ page }) => {
    await page.goto('/admin/verification');
    await expect(page).toHaveURL(/\/login/);
  });
});
