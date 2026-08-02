import { test, expect } from '../fixtures';
import { createDbClient } from '../fixtures/db';
import { RegisterPage } from '../pages/RegisterPage';
import type { Client } from 'pg';

test.describe('Contractor registration flow', () => {
  let db: Client;
  const testEmail = `con-reg-${Date.now()}@e2e.test`;
  const testPassword = 'SecurePass99!';

  test.beforeAll(async () => {
    db = await createDbClient();
  });

  test.afterAll(async () => {
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

  test('step 3 – select contractor role redirects to password', async ({ page }) => {
    // email param required — role page redirects to /register if missing
    await page.goto(`/register/role?email=${encodeURIComponent(testEmail)}`);
    const reg = new RegisterPage(page);
    await reg.selectRole('contractor');
    await reg.submitRole();
    await reg.expectRedirectToPassword();
  });

  test('step 4 – set password redirects to profile', async ({ page }) => {
    await page.addInitScript(() => {
      sessionStorage.setItem('bloomy_reg_role', 'contractor');
    });
    await page.goto(`/register/password?email=${encodeURIComponent(testEmail)}`);
    const reg = new RegisterPage(page);
    await reg.fillPassword(testPassword);
    await reg.submitPassword();
    await reg.expectRedirectToProfile();
  });

  test('step 5 – complete profile redirects to /cabinet', async ({ page }) => {
    await page.addInitScript(({ password }) => {
      sessionStorage.setItem('bloomy_reg_role', 'contractor');
      sessionStorage.setItem('bloomy_reg_password', password);
    }, { password: testPassword });
    await page.goto(`/register/profile?email=${encodeURIComponent(testEmail)}`);
    const reg = new RegisterPage(page);
    await reg.fillProfile('Bob', 'Builder');
    // Contractor profile requires postcode and service radius
    await page.getByTestId('register-postcode').fill('SW1A 1AA');
    await page.getByTestId('register-radius').fill('25');
    await reg.submitProfile();
    await expect(page).toHaveURL(/\/cabinet/);
  });

  test('post-condition – user exists with role=contractor', async () => {
    const { rows } = await db.query<{ role: string }>(
      `SELECT role FROM users WHERE email = $1`,
      [testEmail],
    );
    expect(rows.length).toBe(1);
    expect(rows[0].role).toBe('contractor');
  });

  test('duplicate email registration is rejected', async ({ page }) => {
    const reg = new RegisterPage(page);
    await reg.gotoInit();
    await reg.fillEmailInit(testEmail);
    await reg.acceptTerms();
    await reg.submitInit();
    await expect(page.locator('main')).toContainText(/already exists|already registered|email.*taken/i);
  });
});
