import { test, expect } from '../fixtures';
import { createDbClient, seedHomeowner, cleanup } from '../fixtures/db';
import type { Client } from 'pg';

test.describe('Forgot password / reset flow', () => {
  let db: Client;
  const ids: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, ids);
    await db.end();
  });

  test('submitting a known email shows success message', async ({ page }) => {
    const user = await seedHomeowner(db);
    ids.push({ table: 'users', id: user.id });

    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByRole('button', { name: /send|reset|submit/i }).click();

    // Page shows "Check your inbox" heading on success
    await expect(page.locator('main, [role="main"]')).toContainText(
      /check your inbox|reset link|on its way/i,
    );
  });

  test('submitting an unknown email shows generic success (no enumeration)', async ({ page }) => {
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill('nobody@e2e.test');
    await page.getByRole('button', { name: /send reset link|send|reset|submit/i }).click();

    // API should always return 200 for unknown emails (no-enumeration behaviour)
    await expect(page.locator('main, [role="main"]')).toContainText(
      /check your inbox|reset link|on its way/i,
    );
  });

  test('valid reset token allows setting a new password', async ({ page }) => {
    const user = await seedHomeowner(db);
    ids.push({ table: 'users', id: user.id });

    // Trigger reset email to generate token
    await page.goto('/forgot-password');
    await page.getByLabel(/email/i).fill(user.email);
    await page.getByRole('button', { name: /send|reset|submit/i }).click();

    // Wait for the backend to process and store the token
    await page.waitForLoadState('networkidle');

    // Read token from DB
    const { rows } = await db.query<{ token: string }>(
      `SELECT token FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
      [user.id],
    );
    expect(rows.length).toBe(1);
    const { token } = rows[0];

    await page.goto(`/reset-password?token=${token}`);
    await page.getByLabel(/^new password|^password/i).first().fill('NewSecure99!');
    await page.getByLabel(/confirm/i).fill('NewSecure99!');
    await page.getByRole('button', { name: /reset|save|update/i }).click();

    await expect(page).toHaveURL(/\/login/);
  });

  test('expired / invalid reset token shows an error', async ({ page }) => {
    await page.goto('/reset-password?token=invalidtoken123');
    await page.getByLabel(/^new password|^password/i).first().fill('NewSecure99!');
    await page.getByLabel(/confirm/i).fill('NewSecure99!');
    await page.getByRole('button', { name: /reset|save|update/i }).click();

    await expect(page.locator('main')).toContainText(/invalid|expired|not found/i);
  });
});
