import { test, expect } from '../fixtures';
import { createDbClient, cleanup } from '../fixtures/db';
import { RegisterPage } from '../pages/RegisterPage';
import type { Client } from 'pg';

test.describe('Homeowner registration flow @smoke', () => {
  let db: Client;
  const testEmail = `hw-reg-${Date.now()}@e2e.test`;
  const testPassword = 'SecurePass99!';
  const seededIds: { table: string; id: string }[] = [];

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
    await cleanup(db, seededIds);
    await db.query(`DELETE FROM registration_tokens WHERE email = $1`, [testEmail]);
    await db.query(`DELETE FROM users WHERE email = $1`, [testEmail]);
    await db.end();
  });

  test('step 1 – submit email redirects to verify', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.gotoInit();
    await reg.fillEmailInit(testEmail);
    await reg.acceptTerms();
    await reg.submitInit();
    await reg.expectRedirectToVerify();
  });

  test('step 2 – enter OTP redirects to role selection', async ({ page }) => {
    const { rows } = await db.query<{ code: string }>(
      `SELECT code FROM registration_tokens WHERE email = $1`,
      [testEmail],
    );
    expect(rows.length).toBe(1);
    const { code } = rows[0];

    await page.goto(`/register/verify?email=${encodeURIComponent(testEmail)}`);
    const reg = new RegisterPage(page);
    await reg.fillOtp(code);
    await reg.submitOtp();
    await reg.expectRedirectToRole();
  });

  test('step 3 – select homeowner role redirects to password', async ({ page }) => {
    // email param required — role page redirects to /register if missing
    await page.goto(`/register/role?email=${encodeURIComponent(testEmail)}`);
    const reg = new RegisterPage(page);
    await reg.selectRole('homeowner');
    await reg.submitRole();
    await reg.expectRedirectToPassword();
  });

  test('step 4 – set password redirects to profile', async ({ page }) => {
    // Inject role into sessionStorage before the page reads it
    await page.addInitScript(() => {
      sessionStorage.setItem('bloomy_reg_role', 'homeowner');
    });
    await page.goto(`/register/password?email=${encodeURIComponent(testEmail)}`);
    const reg = new RegisterPage(page);
    await reg.fillPassword(testPassword);
    await reg.submitPassword();
    await reg.expectRedirectToProfile();
  });

  test('step 5 – complete profile redirects to /cabinet/projects', async ({ page }) => {
    // Inject role + password into sessionStorage before the profile page reads them
    await page.addInitScript(({ password }) => {
      sessionStorage.setItem('bloomy_reg_role', 'homeowner');
      sessionStorage.setItem('bloomy_reg_password', password);
    }, { password: testPassword });
    await page.goto(`/register/profile?email=${encodeURIComponent(testEmail)}`);
    const reg = new RegisterPage(page);
    await reg.fillProfile('Alice', 'Green');
    await reg.submitProfile();
    await expect(page).toHaveURL(/\/cabinet/);
  });

  test('post-condition – user exists in DB with role=homeowner', async () => {
    const { rows } = await db.query<{ role: string; password_hash: string }>(
      `SELECT role, password_hash FROM users WHERE email = $1`,
      [testEmail],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].role).toBe('homeowner');
    expect(rows[0].password_hash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/);
  });
});
