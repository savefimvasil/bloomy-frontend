# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: auth/forgot-password.spec.ts >> Forgot password / reset flow >> valid reset token allows setting a new password
- Location: e2e/auth/forgot-password.spec.ts:43:7

# Error details

```
Error: expect(page).toHaveURL(expected) failed

Expected pattern: /\/login/
Received string:  "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
Timeout: 15000ms

Call log:
  - Expect "toHaveURL" with timeout 15000ms
    6 × locator resolved to <html lang="en" class="h-full antialiased">…</html>
      - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
    2 × locator resolved to <html id="__next_error__">…</html>
      - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
      - locator resolved to <html lang="en" class="h-full antialiased">…</html>
      - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
      - locator resolved to <html lang="en" class="h-full antialiased">…</html>
      - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
      - locator resolved to <html id="__next_error__">…</html>
      - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
    - locator resolved to <html id="__next_error__">…</html>
    3 × unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
      - locator resolved to <html lang="en" class="h-full antialiased">…</html>
    - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
    - waiting for "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3" navigation to finish...
    - navigated to "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
    2 × locator resolved to <html id="__next_error__">…</html>
      - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
    2 × locator resolved to <html lang="en" class="h-full antialiased">…</html>
      - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
    - locator resolved to <html id="__next_error__">…</html>
    5 × unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
      - locator resolved to <html lang="en" class="h-full antialiased">…</html>
    2 × unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
      - locator resolved to <html id="__next_error__">…</html>
    4 × unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"
      - locator resolved to <html lang="en" class="h-full antialiased">…</html>
    - unexpected value "http://localhost:3001/reset-password?token=a1cb74014388c079c54a040b89102fe86c2acbf777fc1a7409c8bb9bdd048de3"

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
  - heading "Set a new password" [level=1]
  - paragraph: Choose a strong password to secure your Bloomy account.
  - heading "Set a new password" [level=2]
  - paragraph: Choose something strong — at least 8 characters.
  - text: New password
  - textbox "New password":
    - /placeholder: At least 8 characters
  - text: Confirm new password
  - textbox "Confirm new password":
    - /placeholder: Repeat password
  - button "Update password"
  - paragraph:
    - link "Request a new link":
      - /url: /forgot-password
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
> 65 |     await expect(page).toHaveURL(/\/login/);
     |                        ^ Error: expect(page).toHaveURL(expected) failed
  66 |   });
  67 | 
  68 |   test('expired / invalid reset token shows an error', async ({ page }) => {
  69 |     await page.goto('/reset-password?token=invalidtoken123');
  70 |     await page.getByLabel(/^new password|^password/i).first().fill('NewSecure99!');
  71 |     await page.getByLabel(/confirm/i).fill('NewSecure99!');
  72 |     await page.getByRole('button', { name: /reset|save|update/i }).click();
  73 | 
  74 |     await expect(page.locator('main, form')).toContainText(/invalid|expired|not found/i);
  75 |   });
  76 | });
  77 | 
```