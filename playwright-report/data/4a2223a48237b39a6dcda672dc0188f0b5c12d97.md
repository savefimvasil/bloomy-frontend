# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/forgot-password.spec.ts >> Forgot password / reset flow >> expired / invalid reset token shows an error
- Location: e2e/auth/forgot-password.spec.ts:68:7

# Error details

```
Error: expect(locator).toContainText(expected) failed

Locator: locator('main, form')
Expected pattern: /invalid|expired|not found/i
Error: strict mode violation: locator('main, form') resolved to 2 elements:
    1) <main class="flex-1 overflow-y-auto pt-[68px]">…</main> aka getByRole('main')
    2) <form class="mt-6 flex flex-col gap-4">…</form> aka getByText('New passwordConfirm new')

Call log:
  - Expect "toContainText" with timeout 15000ms
  - waiting for locator('main, form')

```

# Test source

```ts
  1  | import { test, expect } from '../fixtures';
  2  | import { createDbClient, seedHomeowner, cleanup } from '../fixtures/db';
  3  | import type { Client } from 'pg';
  4  | 
  5  | test.describe('Forgot password / reset flow', () => {
  6  |   let db: Client;
  7  |   const ids: { table: string; id: string }[] = [];
  8  | 
  9  |   test.beforeAll(async () => {
  10 |     db = await createDbClient();
  11 |   });
  12 | 
  13 |   test.afterAll(async () => {
  14 |     await cleanup(db, ids);
  15 |     await db.end();
  16 |   });
  17 | 
  18 |   test('submitting a known email shows success message', async ({ page }) => {
  19 |     const user = await seedHomeowner(db);
  20 |     ids.push({ table: 'users', id: user.id });
  21 | 
  22 |     await page.goto('/forgot-password');
  23 |     await page.getByLabel(/email/i).fill(user.email);
  24 |     await page.getByRole('button', { name: /send|reset|submit/i }).click();
  25 | 
  26 |     // Page shows "Check your inbox" heading on success
  27 |     await expect(page.locator('main, [role="main"]')).toContainText(
  28 |       /check your inbox|reset link|on its way/i,
  29 |     );
  30 |   });
  31 | 
  32 |   test('submitting an unknown email shows generic success (no enumeration)', async ({ page }) => {
  33 |     await page.goto('/forgot-password');
  34 |     await page.getByLabel(/email/i).fill('nobody@e2e.test');
  35 |     await page.getByRole('button', { name: /send reset link|send|reset|submit/i }).click();
  36 | 
  37 |     // API should always return 200 for unknown emails (no-enumeration behaviour)
  38 |     await expect(page.locator('main, [role="main"]')).toContainText(
  39 |       /check your inbox|reset link|on its way/i,
  40 |     );
  41 |   });
  42 | 
  43 |   test('valid reset token allows setting a new password', async ({ page }) => {
  44 |     const user = await seedHomeowner(db);
  45 |     ids.push({ table: 'users', id: user.id });
  46 | 
  47 |     // Trigger reset email to generate token
  48 |     await page.goto('/forgot-password');
  49 |     await page.getByLabel(/email/i).fill(user.email);
  50 |     await page.getByRole('button', { name: /send|reset|submit/i }).click();
  51 | 
  52 |     // Read token from DB
  53 |     const { rows } = await db.query<{ token: string }>(
  54 |       `SELECT token FROM password_reset_tokens WHERE user_id = $1 ORDER BY created_at DESC LIMIT 1`,
  55 |       [user.id],
  56 |     );
  57 |     expect(rows.length).toBe(1);
  58 |     const { token } = rows[0];
  59 | 
  60 |     await page.goto(`/reset-password?token=${token}`);
  61 |     await page.getByLabel(/^new password|^password/i).first().fill('NewSecure99!');
  62 |     await page.getByLabel(/confirm/i).fill('NewSecure99!');
  63 |     await page.getByRole('button', { name: /reset|save|update/i }).click();
  64 | 
  65 |     await expect(page).toHaveURL(/\/login/);
  66 |   });
  67 | 
  68 |   test('expired / invalid reset token shows an error', async ({ page }) => {
  69 |     await page.goto('/reset-password?token=invalidtoken123');
  70 |     await page.getByLabel(/^new password|^password/i).first().fill('NewSecure99!');
  71 |     await page.getByLabel(/confirm/i).fill('NewSecure99!');
  72 |     await page.getByRole('button', { name: /reset|save|update/i }).click();
  73 | 
> 74 |     await expect(page.locator('main, form')).toContainText(/invalid|expired|not found/i);
     |                                              ^ Error: expect(locator).toContainText(expected) failed
  75 |   });
  76 | });
  77 | 
```