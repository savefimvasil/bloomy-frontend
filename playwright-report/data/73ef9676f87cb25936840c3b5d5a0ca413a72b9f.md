# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/register-homeowner.spec.ts >> Homeowner registration flow @smoke >> step 5 – complete profile redirects to /cabinet/projects
- Location: e2e/auth/register-homeowner.spec.ts:68:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/cabinet/
Received string:  "http://localhost:3001/register/profile?email=hw-reg-1785537299062%40e2e.test"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    30 × locator resolved to <html lang="en" class="h-full antialiased">…</html>
       - unexpected value "http://localhost:3001/register/profile?email=hw-reg-1785537299062%40e2e.test"
    3 × locator resolved to <html id="__next_error__">…</html>
      - unexpected value "http://localhost:3001/register/profile?email=hw-reg-1785537299062%40e2e.test"
    - locator resolved to <html lang="en" class="h-full antialiased">…</html>
    - unexpected value "http://localhost:3001/register/profile?email=hw-reg-1785537299062%40e2e.test"

```

```yaml
- banner:
  - link "Bloomy Garden":
    - /url: /
    - img "Bloomy Garden": BLOOMY GARDEN
  - navigation:
    - button "Tools"
    - link "Find contractors":
      - /url: /contractors
    - link "Log in":
      - /url: /login
    - link "Get started":
      - /url: /register
- main:
  - heading "Almost there" [level=1]
  - paragraph: Tell us a little about yourself to personalise your Bloomy experience.
  - text: Step 5 of 5
  - heading "Complete your profile" [level=2]
  - paragraph: For hw-reg-1785537299062@e2e.test
  - text: Name
  - textbox "Name":
    - /placeholder: Your name
  - text: Surname
  - textbox "Surname":
    - /placeholder: Your surname
  - text: Why are you using Bloomy? (optional)
  - textbox "Why are you using Bloomy? (optional)":
    - /placeholder: e.g. planning a garden renovation, interior flooring project...
  - checkbox "Send me tips, updates, and occasional promotions from Bloomy"
  - text: Send me tips, updates, and occasional promotions from Bloomy
  - button "Create account"
  - link "Bloomy Garden":
    - /url: /
    - img "Bloomy Garden": BLOOMY GARDEN
  - paragraph: Plan your garden, estimate materials, connect with local contractors.
  - paragraph: For homeowners
  - list:
    - listitem:
      - link "Plan your garden":
        - /url: /projects/new
    - listitem:
      - link "Tile planner":
        - /url: /tile-plan
    - listitem:
      - link "Find a contractor":
        - /url: /contractors
    - listitem:
      - link "My quote requests":
        - /url: /cabinet/quote-requests
  - paragraph: For contractors
  - list:
    - listitem:
      - link "Direct requests":
        - /url: /cabinet/direct-requests
    - listitem:
      - link "Browse local jobs":
        - /url: /cabinet/nearby-requests
    - listitem:
      - link "Join as a contractor":
        - /url: /register
    - listitem:
      - link "My proposals":
        - /url: /cabinet/my-proposals
    - listitem:
      - link "My reviews":
        - /url: /cabinet/my-reviews
    - listitem:
      - link "My profile":
        - /url: /cabinet/contractor-profile
  - paragraph: Resources
  - list:
    - listitem:
      - link "How it works":
        - /url: /#how-it-works
    - listitem:
      - link "Contractor directory":
        - /url: /contractors
  - paragraph: © 2026 Bloomy Garden
  - link "Terms":
    - /url: /terms
  - link "Privacy":
    - /url: /privacy
  - link "Admin":
    - /url: /admin/heatmap
- alert
```

# Test source

```ts
  1  | import { test, expect } from '../fixtures';
  2  | import { createDbClient, cleanup } from '../fixtures/db';
  3  | import { RegisterPage } from '../pages/RegisterPage';
  4  | import type { Client } from 'pg';
  5  | 
  6  | test.describe('Homeowner registration flow @smoke', () => {
  7  |   let db: Client;
  8  |   const testEmail = `hw-reg-${Date.now()}@e2e.test`;
  9  |   const testPassword = 'SecurePass99!';
  10 |   const seededIds: { table: string; id: string }[] = [];
  11 | 
  12 |   test.beforeAll(async () => {
  13 |     db = await createDbClient();
  14 |   });
  15 | 
  16 |   test.afterAll(async () => {
  17 |     await cleanup(db, seededIds);
  18 |     await db.query(`DELETE FROM registration_tokens WHERE email = $1`, [testEmail]);
  19 |     await db.query(`DELETE FROM users WHERE email = $1`, [testEmail]);
  20 |     await db.end();
  21 |   });
  22 | 
  23 |   test('step 1 – submit email redirects to verify', async ({ page }) => {
  24 |     const reg = new RegisterPage(page);
  25 |     await reg.gotoInit();
  26 |     await reg.fillEmailInit(testEmail);
  27 |     await reg.acceptTerms();
  28 |     await reg.submitInit();
  29 |     await reg.expectRedirectToVerify();
  30 |   });
  31 | 
  32 |   test('step 2 – enter OTP redirects to role selection', async ({ page }) => {
  33 |     const { rows } = await db.query<{ code: string }>(
  34 |       `SELECT code FROM registration_tokens WHERE email = $1`,
  35 |       [testEmail],
  36 |     );
  37 |     expect(rows.length).toBe(1);
  38 |     const { code } = rows[0];
  39 | 
  40 |     await page.goto(`/register/verify?email=${encodeURIComponent(testEmail)}`);
  41 |     const reg = new RegisterPage(page);
  42 |     await reg.fillOtp(code);
  43 |     await reg.submitOtp();
  44 |     await reg.expectRedirectToRole();
  45 |   });
  46 | 
  47 |   test('step 3 – select homeowner role redirects to password', async ({ page }) => {
  48 |     // email param required — role page redirects to /register if missing
  49 |     await page.goto(`/register/role?email=${encodeURIComponent(testEmail)}`);
  50 |     const reg = new RegisterPage(page);
  51 |     await reg.selectRole('homeowner');
  52 |     await reg.submitRole();
  53 |     await reg.expectRedirectToPassword();
  54 |   });
  55 | 
  56 |   test('step 4 – set password redirects to profile', async ({ page }) => {
  57 |     // Inject role into sessionStorage before the page reads it
  58 |     await page.addInitScript(() => {
  59 |       sessionStorage.setItem('bloomy_reg_role', 'homeowner');
  60 |     });
  61 |     await page.goto(`/register/password?email=${encodeURIComponent(testEmail)}`);
  62 |     const reg = new RegisterPage(page);
  63 |     await reg.fillPassword(testPassword);
  64 |     await reg.submitPassword();
  65 |     await reg.expectRedirectToProfile();
  66 |   });
  67 | 
  68 |   test('step 5 – complete profile redirects to /cabinet/projects', async ({ page }) => {
  69 |     // Inject role + password into sessionStorage before the profile page reads them
  70 |     await page.addInitScript(({ password }) => {
  71 |       sessionStorage.setItem('bloomy_reg_role', 'homeowner');
  72 |       sessionStorage.setItem('bloomy_reg_password', password);
  73 |     }, { password: testPassword });
  74 |     await page.goto(`/register/profile?email=${encodeURIComponent(testEmail)}`);
  75 |     const reg = new RegisterPage(page);
  76 |     await reg.fillProfile('Alice', 'Green');
  77 |     await reg.submitProfile();
> 78 |     await expect(page).toHaveURL(/\/cabinet/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  79 |   });
  80 | 
  81 |   test('post-condition – user exists in DB with role=homeowner', async () => {
  82 |     const { rows } = await db.query<{ role: string; password_hash: string }>(
  83 |       `SELECT role, password_hash FROM users WHERE email = $1`,
  84 |       [testEmail],
  85 |     );
  86 |     expect(rows.length).toBe(1);
  87 |     expect(rows[0].role).toBe('homeowner');
  88 |     expect(rows[0].password_hash).toMatch(/^[a-f0-9]+:[a-f0-9]+$/);
  89 |   });
  90 | });
  91 | 
```