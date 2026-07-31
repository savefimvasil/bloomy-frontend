# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/register-contractor.spec.ts >> Contractor registration flow >> step 2 – enter OTP redirects to role selection
- Location: e2e/auth/register-contractor.spec.ts:30:7

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: 1
Received: 0
```

# Test source

```ts
  1  | import { test, expect } from '../fixtures';
  2  | import { createDbClient } from '../fixtures/db';
  3  | import { RegisterPage } from '../pages/RegisterPage';
  4  | import type { Client } from 'pg';
  5  | 
  6  | test.describe('Contractor registration flow', () => {
  7  |   let db: Client;
  8  |   const testEmail = `con-reg-${Date.now()}@e2e.test`;
  9  |   const testPassword = 'SecurePass99!';
  10 | 
  11 |   test.beforeAll(async () => {
  12 |     db = await createDbClient();
  13 |   });
  14 | 
  15 |   test.afterAll(async () => {
  16 |     await db.query(`DELETE FROM registration_tokens WHERE email = $1`, [testEmail]);
  17 |     await db.query(`DELETE FROM users WHERE email = $1`, [testEmail]);
  18 |     await db.end();
  19 |   });
  20 | 
  21 |   test('step 1 – submit email redirects to verify', async ({ page }) => {
  22 |     const reg = new RegisterPage(page);
  23 |     await reg.gotoInit();
  24 |     await reg.fillEmailInit(testEmail);
  25 |     await reg.acceptTerms();
  26 |     await reg.submitInit();
  27 |     await reg.expectRedirectToVerify();
  28 |   });
  29 | 
  30 |   test('step 2 – enter OTP redirects to role selection', async ({ page }) => {
  31 |     const { rows } = await db.query<{ code: string }>(
  32 |       `SELECT code FROM registration_tokens WHERE email = $1`,
  33 |       [testEmail],
  34 |     );
> 35 |     expect(rows.length).toBe(1);
     |                         ^ Error: expect(received).toBe(expected) // Object.is equality
  36 |     const { code } = rows[0];
  37 | 
  38 |     await page.goto(`/register/verify?email=${encodeURIComponent(testEmail)}`);
  39 |     const reg = new RegisterPage(page);
  40 |     await reg.fillOtp(code);
  41 |     await reg.submitOtp();
  42 |     await reg.expectRedirectToRole();
  43 |   });
  44 | 
  45 |   test('step 3 – select contractor role redirects to password', async ({ page }) => {
  46 |     // email param required — role page redirects to /register if missing
  47 |     await page.goto(`/register/role?email=${encodeURIComponent(testEmail)}`);
  48 |     const reg = new RegisterPage(page);
  49 |     await reg.selectRole('contractor');
  50 |     await reg.submitRole();
  51 |     await reg.expectRedirectToPassword();
  52 |   });
  53 | 
  54 |   test('step 4 – set password redirects to profile', async ({ page }) => {
  55 |     await page.addInitScript(() => {
  56 |       sessionStorage.setItem('bloomy_reg_role', 'contractor');
  57 |     });
  58 |     await page.goto(`/register/password?email=${encodeURIComponent(testEmail)}`);
  59 |     const reg = new RegisterPage(page);
  60 |     await reg.fillPassword(testPassword);
  61 |     await reg.submitPassword();
  62 |     await reg.expectRedirectToProfile();
  63 |   });
  64 | 
  65 |   test('step 5 – complete profile redirects to /cabinet', async ({ page }) => {
  66 |     await page.addInitScript(({ password }) => {
  67 |       sessionStorage.setItem('bloomy_reg_role', 'contractor');
  68 |       sessionStorage.setItem('bloomy_reg_password', password);
  69 |     }, { password: testPassword });
  70 |     await page.goto(`/register/profile?email=${encodeURIComponent(testEmail)}`);
  71 |     const reg = new RegisterPage(page);
  72 |     await reg.fillProfile('Bob', 'Builder');
  73 |     // Contractor profile requires postcode and service radius
  74 |     await page.getByLabel(/postcode/i).fill('SW1A 1AA');
  75 |     await page.getByLabel(/service radius/i).fill('25');
  76 |     await reg.submitProfile();
  77 |     await expect(page).toHaveURL(/\/cabinet/);
  78 |   });
  79 | 
  80 |   test('post-condition – user exists with role=contractor', async () => {
  81 |     const { rows } = await db.query<{ role: string }>(
  82 |       `SELECT role FROM users WHERE email = $1`,
  83 |       [testEmail],
  84 |     );
  85 |     expect(rows.length).toBe(1);
  86 |     expect(rows[0].role).toBe('contractor');
  87 |   });
  88 | 
  89 |   test('duplicate email registration is rejected', async ({ page }) => {
  90 |     const reg = new RegisterPage(page);
  91 |     await reg.gotoInit();
  92 |     await reg.fillEmailInit(testEmail);
  93 |     await reg.acceptTerms();
  94 |     await reg.submitInit();
  95 |     await expect(page.locator('form, main')).toContainText(/already exists|already registered|email.*taken/i);
  96 |   });
  97 | });
  98 | 
```